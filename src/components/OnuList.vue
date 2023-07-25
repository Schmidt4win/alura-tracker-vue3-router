<template>
  <div class="max-container">
    <div class="search-container">
      <input class="input" type="text" v-model="searchQuery" placeholder="PESQUISE POR CLIENTE" />
    </div>

    <div class="client-container">
      <Box class="box-container" v-for="cliente in filteredOnuClient" :key="cliente.name">
        <!-- Use cliente.mac as the key -->
        <div class="columns">
          <div class="column">
            <strong class="label">cliente:</strong> {{ cliente.name }}
            <!-- Use cliente.name instead of cliente.Alias -->
          </div>
          <div class="column">
            <strong class="label">Mac:</strong> {{ cliente.mac }}
            <!-- Use cliente.mac instead of cliente.Serial -->
          </div>
          <div class="column">
            <strong class="label">VLAN:</strong> {{ cliente.flowProfile }}
            <!-- Use cliente.flowProfile instead of cliente.Interface -->
          </div>
          <div class="column">
            <button class="button" @click="verificarOnu(cliente)">
              Verificar ONU
            </button>
          </div>
        </div>
      </Box>
    </div>

    <div class="modal is-active" v-if="showSelectedOnuModal">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head custom-background">
          <p class="modal-card-title custom-text-color">
            ONUs da OLT: {{ selectedOnuName }}
          </p>
          <button class="delete" aria-label="close" @click="closeSelectedOnuModal"></button>
        </header>
        <section class="modal-card-body custom-terminal-background custom-text-color">
          <table class="table is-fullwidth is-bordered is-striped is-narrow">
            <thead>
              <tr>
                <th>ONU MAC</th>
                <th>GPON</th>
                <th>ONU Model</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="onu in onus" :key="onu.onuMac" class="onu-item">
                <td class="td">{{ onu.onuMac }}</td>
                <td>{{ onu.gpon }}</td>
                <td>{{ onu.onuModel }}</td>
              </tr>
            </tbody>
          </table>
        </section>
        <footer class="modal-card-foot custom-background">
          <button class="button" @click="closeSelectedOnuModal">Fechar</button>
        </footer>
      </div>
    </div>

    <div class="modal is-active" v-if="showJsonModal">
      <div class="modal-background"></div>
      <div class="modal-card json-modal-card">
        <header class="modal-card-head custom-background">
          <p class="modal-card-title custom-text-color">SINAL DO CLIENTE</p>
          <button class="delete" aria-label="close" @click="closeJsonModal"></button>
        </header>
        <section class="modal-card-body custom-terminal-background custom-text-color">
          <div v-if="jsonData.Alias">
            <Box class="box-container">
              Dados Basicos:
              <p><strong>Nome:</strong> {{ jsonData.Alias }}</p>
              <p><strong>Status:</strong> {{ jsonData.Status }}</p>
              <p><strong>Rx:</strong> {{ jsonData["Power Level"] }}</p>
              <p><strong>Tx:</strong> {{ jsonData.RSSI }}</p>
            </Box>
            <Box class="box-container">Dados de Diagnostico:
              <p><strong>Mac:</strong> {{ jsonData.Serial }}</p>
              <p><strong>Model:</strong> {{ jsonData.Model }}</p>
              <p><strong>Distance:</strong> {{ jsonData.Distance }}</p>
              <p>
                <strong>Firmware:</strong> {{ jsonData["Firmware Version"] }}
              </p>
              <p><strong>Last Update:</strong> {{ jsonData["Last Update"] }}</p>
            </Box>
          </div>
          <div v-else>
            <p>No data available for this ONU.</p>
          </div>
        </section>
        <footer class="modal-card-foot custom-background">
          <button class="button is-primary" @click="closeJsonModal">
            Fechar
          </button>
        </footer>
      </div>
    </div>
    <div class="modal color-progress is-active" v-if="loading">
      <div class="modal-background"></div>
      <div class="modal-content">
        <progress class="progress is-info is-primary" max="100"></progress>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";
import Icliente from "../interfaces/ICliente";
import IOnu from "../interfaces/IOnu";
import IOnuDataResponse from "../interfaces/IOnuDataResponse";

import Box from "./Box.vue";
import { TipoNotificacao } from "@/interfaces/INotificação";
import useNotificador from "@/hooks/notificador";
import { useStore } from "@/store";

export default defineComponent({
  name: "OnuList",
  components: {
    Box,
  },
  data() {
    return {
      onuClient: [] as IOnuDataResponse[],
      activeDropdown: null as string | null,
      searchQuery: "",
      showModal: false,
      onus: [] as IOnu[],
      onuName: "",
      selectedPonVlan: "",
      showJsonModal: false,
      jsonData: {} as Record<string, IOnuDataResponse>,
      selectedOnuName: "",
      showSelectedOnuModal: false,
      selectedcliente: null as Icliente | null,
      loading: false
    };
  },
  beforeMount() {
    this.fetchOnuData();
  },


  computed: {
    filteredOnuClient(): IOnuDataResponse[] {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) {
        return this.onuClient; // Retorna todos os clientes se a query estiver vazia
      }

      const regex = new RegExp(`^${query}`, 'i');
      return this.onuClient.filter((cliente) => {
        const name = cliente.name ? cliente.name.trim().toLowerCase() : '';
        return name.match(regex);
      });
    },

    formattedJsonData(): Array<{
      onuAlias: string;
      mac: string;
      status: string;
      rx: string;
      tx: string;
    }> {
      const jsonData = this.jsonData;
      const formattedData: Array<{
        onuAlias: string;
        mac: string;
        status: string;
        rx: string;
        tx: string;
      }> = [];

      for (const clienteOnu in jsonData) {
        const data = jsonData[clienteOnu];

        // Check if the onuMac property exists before using it
        const formattedItem = {
          onuAlias: data.Alias ? data.Alias : "N/A",
          mac: data.Serial ? data.Serial : "N/A",
          status: data.Status ? data.Status : "N/A",
          rx: data["Power Level"] ? data["Power Level"] : "N/A",
          tx: data.RSSI ? data.RSSI : "N/A",
        };

        formattedData.push(formattedItem);
      }

      return formattedData;
    },
  },
  methods: {
    async verificarOnu(cliente: IOnuDataResponse) {
      try {
        console.log(cliente);
        const response = await axios.post(
          "https://api.heatmap.conectnet.net/verificar-onu-completo",
          {
            oltIp: cliente.oltIp,
            onuAlias: cliente.name,
          }
        );

        // The response data should be an object containing the ONU data
        const responseData = response.data;

        // Set the jsonData to the onuData received from the server
        this.jsonData = responseData;

        // Show the jsonmodal with the received data
        this.showJsonModal = true;

        // Add console log to check the jsonData
        console.log(this.jsonData);
      } catch (error) {
        console.error("Error verifying ONU:", error);
      }
    },

    async fetchOnuData() {
      try {
        this.loading = true;
        this.notificar(
          TipoNotificacao.ATENCAO,
          "EXCELENTE!",
          `Os Clientes estão sendos aferidos. Aguarde alguns segundos!`
        );
        const apiCalls = [];
        const baseIp = "192.168.";
        const startRange = 202;
        const endRange = 209;

        for (let i = startRange; i <= endRange; i++) {
          const oltIp = baseIp + i + ".2";
          apiCalls.push(
            axios.post(
              "https://api.heatmap.conectnet.net/verificar-onu-name-olt",
              { oltIp }
            )
          );
        }

        // Wait for all the API calls to complete
        const responses = await axios.all(apiCalls);

        // Extract the data from each response and combine them into a single array
        const combinedOnuClient: IOnuDataResponse[] = []; // Explicitly type the combinedOnuClient

        responses.forEach((response) => {
          const responseData = Array.isArray(response.data)
            ? response.data // If the data is an array, use it directly
            : Array.isArray(response.data.data)
              ? response.data.data // If the data is nested under "data" property, use it
              : [];

          // Combine the client data into the combinedOnuClient array
          combinedOnuClient.push(...responseData);
        });


        // Set the onuClient data to the combined result
        this.onuClient = combinedOnuClient;
        this.loading = false
      } catch (error) {
        console.error("Error verifying ONU:", error);
      }
    },
    closeModal() {
      this.showModal = false;
    },

    closeSelectedOnuModal() {
      this.showSelectedOnuModal = false;
    },
    openJsonModal(data: any) {
      this.jsonData = data;
      this.showJsonModal = true;
    },
    closeJsonModal() {
      this.showJsonModal = false;
    },
  },
  setup() {
    const store = useStore();
    const { notificar } = useNotificador();
    return {
      store,
      notificar,
    };
  },
});
</script>
<style scoped>
.custom-background {
  background-color: aliceblue;
}

.box-container {
  border: 1px solid #e96d13;
}

.custom-text-color {
  color: black;
}

.custom-terminal-background {
  background-color: aliceblue;
}

.search-container {
  padding: 1.5rem 0;
  max-height: calc(100vh - 50px);
  overflow-y: auto;
}

.button {
  background-color: rgb(34, 130, 214);
  padding: 1.5rem;
  color: aliceblue;
}

.label {
  color: rgb(34, 130, 214);
  font-weight: bold;
}

.client-container {
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding: 1.25rem;
}

/* .max-container {
    max-height: calc(100vh - 50px);
    overflow-y: auto;
    padding: 1.25rem;
  } */

.modal.is-active {
  display: flex !important;
  /* Force the modal to be visible */
}

.modal-card {
  background-color: white;
  border-radius: 5px;
  max-width: 80%;
  /* Adjust the width as needed */
  max-height: 80%;
  /* Adjust the height as needed */
  overflow-y: auto;
  /* Add scroll if the modal content exceeds the height */
}

.modal-card-title {
  font-weight: bold;
  color: #363636;
}

.modal-card-body {
  padding: 1.25rem;
}

.modal-card-foot {
  padding: 1.25rem;
  justify-content: flex-end;
}

.modal-card-foot button {
  margin-left: 5px;
}

.modal-close {
  cursor: pointer;
}

.modal.is-active .modal-background {
  display: block !important;
  /* Force the background to be visible */
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  color: #363636;
}

.table th,
.table td {
  border: 1px solid #d3d3d3;
  padding: 0.5rem;
  text-align: left;
}

.table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.select-container {
  display: flex;
  align-items: center;
  position: relative;
  /* Ensure relative positioning for z-index to work */
}

.custom-select {
  z-index: 1;
  height: 50px;
  /* Set z-index to a higher value to ensure it's displayed above other elements */
}

.select {
  margin-right: 10px;
}
</style>
