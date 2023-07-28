<template>
  <div class="max-container">
    <div class="search-container">
      <input
        class="input"
        type="text"
        v-model="searchQuery"
        placeholder="PESQUISE POR CLIENTE"
      />
    </div>

    <div class="client-container">
      <Box
        class="box-container"
        v-for="cliente in filteredOnuClient"
        :key="cliente._id"
      >
        <div class="columns">
          <div class="column">
            <strong class="label">cliente:</strong> {{ cliente.name }}
          </div>
          <div class="column">
            <strong class="label">Mac:</strong> {{ cliente.mac }}
          </div>
          <div class="column">
            <strong class="label">VLAN:</strong> {{ cliente.flowProfile }}
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
          <button
            class="delete"
            aria-label="close"
            @click="closeSelectedOnuModal"
          ></button>
        </header>
        <section
          class="modal-card-body custom-terminal-background custom-text-color"
        >
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
          <button
            class="delete"
            aria-label="close"
            @click="closeJsonModal"
          ></button>
        </header>
        <section
          class="modal-card-body custom-terminal-background custom-text-color"
        >
          <div v-if="jsonData.Alias">
            <Box class="box-container">
              Dados Basicos:
              <p><strong>Nome:</strong> {{ jsonData.Alias }}</p>
              <p><strong>Status:</strong> {{ jsonData.Status }}</p>
              <p><strong>Rx:</strong> {{ jsonData["Power Level"] }}</p>
              <p><strong>Tx:</strong> {{ jsonData.RSSI }}</p>
            </Box>
            <Box class="box-container"
              >Dados de Diagnostico:
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
      loading: false,
    };
  },
  beforeMount() {
    this.fetchOnuData();
  },
  watch: {
    searchQuery(newQuery) {
      if (!newQuery.trim()) {
        this.clearFilteredOnuClient();
      }
    },
  },

  computed: {
    filteredOnuClient(): IOnuDataResponse[] {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) {
        this.clearFilteredOnuClient();
        return [];
      } else {
        return this.onuClient.filter((cliente: IOnuDataResponse) => {
          const name = cliente.name ? cliente.name.trim().toLowerCase() : "";
          return name.startsWith(query);
        });
      }
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
    clearFilteredOnuClient() {
      this.filteredOnuClient = [...this.onuClient];
    },
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

        const responseData = response.data;

        this.jsonData = responseData;

        this.showJsonModal = true;

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
          "Os Clientes estão sendo aferidos. Aguarde alguns segundos!"
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

        const responses = await axios.all(apiCalls);
        let uniqueId = 1;

        const combinedOnuClient: IOnuDataResponse[] = [];

        responses.forEach((response) => {
          const responseData: IOnuDataResponse[] = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data.data)
            ? response.data.data
            : [];

          responseData.forEach((item) => {
            item._id = uniqueId++;
          });

          combinedOnuClient.push(...responseData);
        });
        console.log(combinedOnuClient[33])
        this.onuClient = combinedOnuClient;
        this.loading = false;
      } catch (error) {
        console.error("Error fetching ONU data:", error);
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

.modal.is-active {
  display: flex !important;
}

.modal-card {
  background-color: white;
  border-radius: 5px;
  max-width: 80%;

  max-height: 80%;

  overflow-y: auto;
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
}

.custom-select {
  z-index: 1;
  height: 50px;
}

.select {
  margin-right: 10px;
}
</style>
