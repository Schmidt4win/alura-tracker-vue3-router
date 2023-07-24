<template>
    <div class="max-container">
      <div class="search-container">
        <input class="input" type="text" v-model="searchQuery"
          placeholder="VLAN= OLT + PON, EXEMPLO: OLT 3 + PON 11 = 2311 " />
      </div>
      <div class="columns is-mobile">
        <!-- Add columns class here and is-mobile class for responsiveness -->
        <div class="column is-narrow">
          <!-- First column for select -->
          <div class="select">
            <div class="select-container">
              <select v-model="selectedOltIp" class="custom-select">
                <option value="">Select OLT</option>
                <option v-for="oltName in uniqueOltNames" :value="oltName" :key="oltName">
                  {{ oltName }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="column is-narrow">
          <!-- Second column for "Verificar ONUs" button -->
          <button class="button is-fullwidth select-b" @click="openModalForSelectedOlt">
            Verificar Clientes da Olt
          </button>
        </div>
      </div>
      <div class="client-container">
        <Box v-for="ramal in filteredRamais" :key="ramal._id">
          <div class="columns">
            <div class="column">
              <strong class="label">Ramal:</strong> {{ ramal.oltRamal }}
            </div>
            <div class="column">
              <strong class="label">OLT:</strong> {{ ramal.oltName }}
            </div>
            <div class="column">
              <strong class="label">VLAN:</strong> {{ ramal.ponVlan }}
            </div>
            <div class="column">
              <button class="button is-primary" @click="openModal(ramal)">Verificar Clientes</button>
            </div>
          </div>
        </Box>
      </div>
  
      <div class="modal is-active" v-if="showModal">
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head custom-background">
            <p class="modal-card-title custom-text-color">ONUs: {{ onuCountInModal }}</p>
            <button class="delete" aria-label="close" @click="closeModal"></button>
          </header>
          <section class="modal-card-body custom-terminal-background custom-text-color">
      <table class="table is-fullwidth is-bordered is-striped is-narrow">
        <thead>
          <tr>
            <th>Nome</th>
            <th>MAC</th>
            <!-- <th>OLT IP</th> -->
            <th>Verificar Sinal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="onu in onus" :key="onu.mac" class="onu-item">
            <td>{{ onu.name }}</td>
            <td>{{ onu.mac }}</td>
            <!-- <td>{{ onu.oltIp }}</td> -->
            <td>
                <button class="button" @click="verificarOnu(onu)">Verificar Sinal</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
          <footer class="modal-card-foot custom-background">
            <button class="button" @click="closeModal">Fechar</button>
          </footer>
        </div>
      </div>
      <div class="modal is-active" v-if="showSelectedOltModal">
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head custom-background">
            <p class="modal-card-title custom-text-color">
              OLT: {{ selectedOltName }} - ONUs: {{ onuCountInModal }}
            </p>
            <button class="delete" aria-label="close" @click="closeSelectedOltModal"></button>
          </header>
          <section class="modal-card-body custom-terminal-background custom-text-color">
      <table class="table is-fullwidth is-bordered is-striped is-narrow">
        <thead>
          <tr>
            <th>Nome</th>
            <th>MAC</th>
            <!-- <th>OLT IP</th> -->
            <th>Verificar Sinal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="onu in onus" :key="onu.mac" class="onu-item">
            <td>{{ onu.name }}</td>
            <td>{{ onu.mac }}</td>
            <!-- <td>{{ onu.oltIp }}</td> -->
            <td>
                <button class="button" @click="verificarOnu(onu)">Verificar Sinal</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
          <footer class="modal-card-foot custom-background">
            <button class="button" @click="closeSelectedOltModal">Fechar</button>
          </footer>
        </div>
      </div>
  
      <div class="modal is-active" v-if="showJsonModal">
        <div class="modal-background"></div>
        <div class="modal-card json-modal-card">
          <header class="modal-card-head custom-background">
            <p class="modal-card-title custom-text-color">
              SINAL DA ONU
            </p>
            <button class="delete" aria-label="close" @click="closeJsonModal"></button>
          </header>
          <section class="modal-card-body custom-terminal-background custom-text-color">
            <div v-for="data in formattedJsonData" :key="data.clienteOnu">
              
              <p><strong>Mac:</strong> {{ data.mac.toLocaleUpperCase() }}</p>
              <p><strong>Status:</strong> {{ data.status }}</p>
              <p><strong>Rx:</strong> {{ data.tx }}</p>
              <p><strong>Tx:</strong> {{ data.rx }}</p>
            </div>
          </section>
          <footer class="modal-card-foot custom-background">
            <button class="button is-primary" @click="closeJsonModal">
              Fechar
            </button>
          </footer>
        </div>
      </div>
      <div class="modal is-active" v-if="loading">
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
  import IRamal from "../interfaces/IRamal";
  import IOnu from "../interfaces/IOnu";
  import IOnuData from "../interfaces/IOnuData";
  import Box from "./Box.vue";
  import { TipoNotificacao } from "@/interfaces/INotificação";
  import useNotificador from "@/hooks/notificador";
  import { useStore } from "@/store";
  
  export default defineComponent({
    name: "PonOnu",
    components: {
      Box,
    },
    data() {
      return {
        fetchedRamais: [] as IRamal[],
        activeDropdown: null as string | null,
        searchQuery: "",
        showModal: false,
        onus: [] as IOnu[],
        selectedOltIp: "",
        selectedPonVlan: "",
        showJsonModal: false,
        jsonData: {} as Record<string, IOnuData>,
        selectedOltName: "",
        showSelectedOltModal: false,
        selectedRamal: null as IRamal | null,
        loading: false,
      };
    },
    beforeMount() {
      this.fetchRamalData();
    },
    created() {
      this.fetchRamalData();
    },
    computed: {
      filteredRamais(): IRamal[] {
        if (!this.searchQuery) {
          if (this.selectedOltIp) {
            // Change the condition to check for selectedOltIp
            return this.fetchedRamais.filter(
              (ramal: IRamal) => ramal.oltName === this.selectedOltIp
            );
          }
          return this.fetchedRamais;
        } else {
          const query = this.searchQuery.toLowerCase();
          return this.fetchedRamais.filter((ramal: IRamal) => {
            const { oltRamal, oltIp, oltPon, ponVlan, oltName } = ramal;
            return (
              oltRamal.toLowerCase().includes(query) ||
              oltIp.toLowerCase().includes(query) ||
              oltPon.toLowerCase().includes(query) ||
              ponVlan.toLowerCase().includes(query) ||
              oltName.toLowerCase().includes(query)
            );
          });
        }
      },
      onuCountInModal(): number {
      return this.onus.length;
    },
      formattedJsonData(): Array<{
        clienteOnu: string;
        onuAlias: string;
        mac: string;
        status: string;
        tx: string;
        rx: string;
      }> {
        const jsonData = this.jsonData;
        const formattedData: Array<{
          clienteOnu: string;
          onuAlias: string;
          mac: string;
          status: string;
          tx: string;
          rx: string;
        }> = [];
  
        for (const clienteOnu in jsonData) {
          const data = jsonData[clienteOnu];
          const onu = this.onus.find((onu) => onu.onuMac === clienteOnu);
          const formattedItem = {
            clienteOnu,
            onuAlias: onu ? onu.onuAlias : "N/A",
            mac: clienteOnu,
            status: data["Status"],
            tx: data["Power Level"],
            rx: data["RSSI"],
          };
  
          formattedData.push(formattedItem);
        }
  
        return formattedData;
      },
      uniqueOltNames(): string[] {
        
        return [
          ...new Set(this.fetchedRamais.map((ramal: IRamal) => ramal.oltName)),
        ];
      },
    },
    methods: {
      async fetchRamalData() {
        try {
          const response = await fetch(
            "https://api.heatmap.conectnet.net/ramais"
          );
          const data = await response.json();
          this.fetchedRamais = data;
        } catch (error) {
          console.error("Error fetching ramal data:", error);
        }
      },
      async verificarOnu(onu: any) {
      try {
        const response = await axios.post(
          "https://api.heatmap.conectnet.net/verificar-onu",
          {
            oltIp: onu.oltIp,
            onuAlias: onu.name,
          }
        );

        // The response data should be an object containing the ONU data
        const responseData = response.data;
        const onuData: IOnuData = responseData[onu.name];

        // Set the jsonData to the onuData received from the server
        this.jsonData = {
          [onu.name]: onuData,
        };

        // Show the jsonmodal with the received data
        this.showJsonModal = true;

        // Add console log to check the jsonData
        console.log(this.jsonData);
      } catch (error) {
        console.error("Error verifying ONU:", error);
      }
    },
    async openModalForSelectedOlt(ramal: IRamal) {
    if (this.selectedOltIp) {
      
      const selectedOlt = this.fetchedRamais.find(
        (ramal: IRamal) => ramal.oltName === this.selectedOltIp
      );

      try {
        if (selectedOlt) {
          const response = await fetch(
            "https://api.heatmap.conectnet.net/verificar-onu-name-olt",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ oltIp: selectedOlt.oltIp }), 
            }
          );
          const data = await response.json();

      
          this.onus = data.filter((onuData: any) => onuData.name !== "N/A").map((onuData: any) => ({
            name: onuData.name || "N/A",
            mac: onuData.mac || "N/A",
            oltIp: selectedOlt.oltIp || "N/A",
          }));

      
          this.selectedOltName = selectedOlt.oltName;

      
          this.showSelectedOltModal = true;

      
          this.showModal = false;
        }
      } catch (error) {
        console.error("Error fetching ONU data:", error);
      }
    } else {
      
      console.warn("No OLT selected. Please select an OLT.");
    }
  },

      closeModalAndRefresh() {
        // Close the modal
        this.showModal = false;
  
        this.selectedOltIp = this.selectedOltName;
      },
      closeModal() {
        this.showModal = false;
      },
    
      closeSelectedOltModal() {
        this.showSelectedOltModal = false;
      },
      openJsonModal(data: any) {
        this.jsonData = data;
        this.showJsonModal = true;
      },
      closeJsonModal() {
        this.showJsonModal = false;
      },
      async openModal(ramal: IRamal) {
      try {
        const response = await fetch(
          "https://api.heatmap.conectnet.net/verificar-onu-name-pon",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ oltIp: ramal.oltIp, oltPon: ramal.oltPon }),
          }
        );
        const data = await response.json();

        // Extract the required data from the API response and store it in the 'onus' array
        this.onus = data.map((onuData: any) => ({
          name: onuData.name || "N/A",
          mac: onuData.mac || "N/A",
          oltIp: ramal.oltIp || "N/A",
        }));

        // Store the selected ramal in the component data
        this.selectedRamal = ramal;
        this.selectedPonVlan = ramal.ponVlan;
        this.showModal = true;
      } catch (error) {
        console.error("Error fetching ONU data:", error);
      }
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
    /* Force the background to be visible */
  }
  
  .table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
    color: #363636;
  }
  
  .table thead {
  position: sticky;
  top: 0;
  background-color: #f5f5f5;
  z-index: 1;
}
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
  