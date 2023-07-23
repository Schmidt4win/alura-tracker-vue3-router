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
      <Box v-for="cliente in filteredClientes" :key="cliente._id">
        <div class="columns">
          <div class="column">
            <strong class="label">cliente:</strong> {{ cliente.onuAlias }}
          </div>
          <div class="column">
            <strong class="label">Mac:</strong> {{ cliente.onuSerial.toLocaleUpperCase() }}
          </div>
          <div class="column">
            <strong class="label">VLAN:</strong> {{ cliente.onuVlan }}
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
                <td class="td">{{ onu.onuMac.toLocaleUpperCase() }}</td>
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
          <p class="modal-card-title custom-text-color">
            SINAL DO CLIENTE
          </p>
          <button
            class="delete"
            aria-label="close"
            @click="closeJsonModal"
          ></button>
        </header>
        <section
          class="modal-card-body custom-terminal-background custom-text-color"
        >
          <div v-for="data in formattedJsonData" :key="data.clienteOnu">
            <p><strong>Nome:</strong> {{ data.mac.toLocaleUpperCase() }}</p>
            <p><strong>Status:</strong> {{ data.status }}</p>
            <p><strong>Rx:</strong> {{ data.rx }}</p>
            <p><strong>Tx:</strong> {{ data.tx }}</p>
          </div>
        </section>
        <footer class="modal-card-foot custom-background">
          <button class="button is-primary" @click="closeJsonModal">
            Fechar
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";
import Icliente from "../interfaces/ICliente";
import IOnu from "../interfaces/IOnu";
import IOnuData from "../interfaces/IOnuData";
import IOnuCliente from "../interfaces/IOnuCliente";
import IAuthData from "../interfaces/IAuthData";
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
      onuClient: [] as IOnuCliente[],
      activeDropdown: null as string | null,
      searchQuery: "",
      showModal: false,
      onus: [] as IOnu[],
      onuName: "",
      selectedPonVlan: "",
      showJsonModal: false,
      jsonData: {} as Record<string, IOnuData>,
      selectedOnuName: "",
      showSelectedOnuModal: false,
      selectedcliente: null as Icliente | null,
    };
  },
  beforeMount() {
    this.fetchOnuData();
  },
  created() {
    this.fetchOnuData();
  },
  computed: {
    filteredClientes(): IOnuCliente[] {
      if (!this.searchQuery) {
        if (this.onuName) {
          // Change the condition to check for onuName
          return this.onuClient.filter(
            (cliente: IOnuCliente) => cliente.onuAlias === this.onuName
          );
        }
        return this.onuClient;
      } else {
        const query = this.searchQuery.toLowerCase();
        return this.onuClient.filter((cliente: IOnuCliente) => {
          const {
            onuAlias,
            oltIp,
            oltPon,
            onuVlan,
            user,
            onuSerial,
            date_time,
          } = cliente;
          return (
            onuAlias.toLowerCase().includes(query) ||
            oltIp.toLowerCase().includes(query) ||
            oltPon.toLowerCase().includes(query) ||
            onuSerial.toLowerCase().includes(query) ||
            date_time.toLowerCase().includes(query) ||
            onuVlan.toLowerCase().includes(query) ||
            user.toLowerCase().includes(query)
          );
        });
      }
    },
    formattedJsonData(): Array<{
      clienteOnu: string;
      onuAlias: string;
      mac: string;
      status: string;
      rx: string;
      tx: string;
    }> {
      const jsonData = this.jsonData;
      const formattedData: Array<{
        clienteOnu: string;
        onuAlias: string;
        mac: string;
        status: string;
         rx: string;
         tx: string;
      }> = [];

      for (const clienteOnu in jsonData) {
        const data = jsonData[clienteOnu];

        // Check if an onu exists in the onus array with the matching onuMac
        const onu = this.onus.find((onu) => onu.onuMac === clienteOnu);

        const formattedItem = {
          clienteOnu: clienteOnu,
          onuAlias: onu ? onu.onuAlias : "N/A",
          mac: clienteOnu,
          status: data["Status"] ? data["Status"] : "N/A",
          rx: data["Power Level"] ? data["Power Level"] : "N/A",
          tx: data["RSSI"] ? data["RSSI"] : "N/A",
        };

        formattedData.push(formattedItem);
      }

      return formattedData;
    },

    uniqueOltNames(): string[] {
      // Get unique OLT names from onuClient
      return [
        ...new Set(
          this.onuClient.map((cliente: IOnuCliente) => cliente.onuAlias)
        ),
      ];
    },
  },
  methods: {
    async verificarOnu(cliente: IOnuCliente) {
      try {
        const response = await axios.post(
          "https://api.heatmap.conectnet.net/verificar-onu",
          {
            oltIp: cliente.oltIp,
            onuAlias: cliente.onuAlias,
          }
        );

        // The response data should be an object containing the ONU data
        const responseData = response.data;
        const onuData: IOnuData = responseData[cliente.onuAlias];

        // Set the jsonData to the onuData received from the server
        this.jsonData = {
          [cliente.onuAlias]: onuData,
        };

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
        const response = await fetch(
          "https://api.heatmap.conectnet.net/onuget"
        );
        const data = await response.json();
        this.onuClient = data;
      } catch (error) {
        console.error("Error fetching cliente data:", error);
      }
    },
    async openModalForSelectedOnu() {
      // Check if a valid OLT is selected
      if (this.onuName) {
        // Find the selected OLT from onuClient
        const selectedOnu = this.onuClient.find(
          (cliente: IOnuCliente) => cliente.onuAlias === this.onuName
        );

        try {
          if (selectedOnu) {
            const response = await fetch(
              "https://api.heatmap.conectnet.net/listar-onu",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ oltIp: selectedOnu.onuAlias }), // Use selectedOnu.oltIp instead of cliente.oltIp
              }
            );
            const data = await response.json();
            this.onus = data.map((onu: IOnu) => ({
              ...onu,
              onuAlias: "",
            }));

            // Set the selectedOnuName to the selected OLT name
            this.selectedOnuName = selectedOnu.onuAlias;

            // Show the new modal for the selected OLT
            this.showSelectedOnuModal = true;

            // Close the other modal if it's open
            this.showModal = false;
          }
        } catch (error) {
          console.error("Error fetching ONU data:", error);
        }
      } else {
        // No OLT is selected, show a notification or handle the case accordingly
        console.warn("No OLT selected. Please select an OLT.");
      }
    },
    closeModalAndRefresh() {
      // Close the modal
      this.showModal = false;

      this.onuName = this.selectedOnuName;
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
  max-height: calc(100vh - 165px);
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
