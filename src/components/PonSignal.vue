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
              <button class="button is-primary" @click="openModal(ramal)">Verificar Sinal da Pon</button>
            </div>
          </div>
        </Box>
      </div>
  
      <div class="modal is-active" v-if="showModal">
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head custom-background">
            <p class="modal-card-title custom-text-color">ONUs:</p>
            <button class="delete" aria-label="close" @click="closeModal"></button>
          </header>
          <section class="modal-card-body custom-terminal-background custom-text-color">
            <table class="table is-fullwidth is-bordered is-striped is-narrow">
              <thead>
                <tr>
                  <th>ONU MAC</th>
                  <th>GPON</th>
                  <th>ONU Model</th>
                  <th>NOME</th>
                  <th>CADASTRAR</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="onu in onus" :key="onu.onuMac" class="onu-item">
                  <td class="td">{{ onu.onuMac }}</td>
                  <td>{{ onu.gpon }}</td>
                  <td>{{ onu.onuModel }}</td>
                  <td>
                    <input class="input" type="text" v-model="onu.onuAlias" placeholder="Nome do cliente" name="onuAlias" />
                  </td>
                  <td>
                    <button class="button is-primary" @click="registerOnu(onu)">
                      Cadastrar
                    </button>
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
              ONUs da OLT: {{ selectedOltName }}
            </p>
            <button class="delete" aria-label="close" @click="closeSelectedOltModal"></button>
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
            <button class="button" @click="closeSelectedOltModal">Fechar</button>
          </footer>
        </div>
      </div>
  
      <div class="modal is-active" v-if="showJsonModal">
        <div class="modal-background"></div>
        <div class="modal-card json-modal-card">
          <header class="modal-card-head custom-background">
            <p class="modal-card-title custom-text-color">
              ONU LIBERADA COM SUCESSO
            </p>
            <button class="delete" aria-label="close" @click="closeJsonModal"></button>
          </header>
          <section class="modal-card-body custom-terminal-background custom-text-color">
            <div v-for="data in formattedJsonData" :key="data.clienteOnu">
              <p><strong>Nome:</strong> {{ data.onuAlias }}</p>
              <p><strong>Mac:</strong> {{ data.mac }}</p>
              <p><strong>Status:</strong> Online</p>
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
    </div>
    <div class="modal is-active" v-if="showOnuDataModal">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head custom-background">
        <p class="modal-card-title custom-text-color">
          ONU Data - {{ selectedOltIp }} - {{ selectedOltPon }}
        </p>
        <button class="delete" aria-label="close" @click="closeOnuDataModal"></button>
      </header>
      <section class="modal-card-body custom-terminal-background custom-text-color">
        <table class="table is-fullwidth is-bordered is-striped is-narrow">
          <thead>
            <tr>
              <th>MAC</th>
              <th>Status</th>
              <th>Rx</th>
              <th>Tx</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(data, mac) in onuData" :key="mac" class="onu-item">
              <td class="td">{{ mac.toLocaleUpperCase() }}</td>
              <td>{{ data.Status }}</td>
              <td>{{ data['Power Level'] }}</td>
              <td>{{ data.RSSI }}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <footer class="modal-card-foot custom-background">
        <button class="button" @click="closeOnuDataModal">Fechar</button>
      </footer>
    </div>
  </div>
  <div class="modal color-progress is-active" v-if="loading">
      <div class="modal-background"></div>
      <div class="modal-content">
        <progress class="progress is-info is-primary" max="100"></progress>
      </div>
    </div>
  
  </template>
  
  <script lang="ts">
  import { defineComponent } from "vue";
  import axios from "axios";
  import IRamal from "../interfaces/IRamal";
  import IOnu from "../interfaces/IOnu";
  import IOnuData from "../interfaces/IOnuData";
  import IStatus from "../interfaces/IStatus";
  import IAuthData from "../interfaces/IAuthData";
  import Box from "./Box.vue";
  import { TipoNotificacao } from "@/interfaces/INotificação";
  import useNotificador from "@/hooks/notificador";
  import { useStore } from "@/store";
  
  export default defineComponent({
    name: "PonSignal",
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
        onuData: {} as Record<string, IOnuData>,
      selectedOltPon: "",
      showOnuDataModal: false,
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
        // Get unique OLT names from fetchedRamais
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
      async openModalForSelectedOlt() {
        // Check if a valid OLT is selected
        if (this.selectedOltIp) {
          // Find the selected OLT from fetchedRamais
          const selectedOlt = this.fetchedRamais.find(
            (ramal: IRamal) => ramal.oltName === this.selectedOltIp
          );
  
          try {
            if (selectedOlt) {
              const response = await fetch(
                "https://api.heatmap.conectnet.net/listar-onu",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ oltIp: selectedOlt.oltIp }), // Use selectedOlt.oltIp instead of ramal.oltIp
                }
              );
              const data = await response.json();
              this.onus = data.map((onu: IOnu) => ({
                ...onu,
                onuAlias: "",
              }));
  
              // Set the selectedOltName to the selected OLT name
              this.selectedOltName = selectedOlt.oltName;
  
              // Show the new modal for the selected OLT
              this.showSelectedOltModal = true;
  
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
        this.notificar(
          TipoNotificacao.ATENCAO,
          "EXCELENTE!",
          `O Sinal do ${ramal.oltRamal} esta sendo verificado. Aguarde alguns segundos!`
        );
        try {
        this.loading = true; // Show the loading progress bar
        const response = await axios.post("https://api.heatmap.conectnet.net/verificar-pon", {
          oltIp: ramal.oltIp,
          oltPon: ramal.oltPon,
        });

        // Store the ONU data in the component data
        this.onuData = response.data;

        // Store the selected OLT IP and PON for the table header
        this.selectedOltIp = ramal.oltIp;
        this.selectedOltPon = ramal.oltPon;
        

        // Show the ONU data modal
        
        this.loading = false;  // Hide the loading progress bar after the response is received
        this.showOnuDataModal = true;
      } catch (error) {
        console.error("Error fetching ONU data:", error);
        this.loading = false; // Make sure to hide the loading bar in case of an error too
      }
    },
    closeOnuDataModal() {
      // Close the ONU data modal
      this.showOnuDataModal = false;
      this.selectedOltIp = this.selectedOltName;
    },
  
  
      async registerOnu(onu: IOnu) {
        try {
          const authData = localStorage.getItem("authData");
  
          if (authData === null) {
            console.error("Authentication data is missing from localStorage.");
            return;
          }
  
          const { username } = JSON.parse(authData) as IAuthData;
          const user = username ?? "Unknown User";
          console.log(user);
  
          const data = {
            // Get the oltIp from the selected ramal
            oltIp: this.selectedRamal?.oltIp || "",
            oltPon: onu.gpon,
            onuVlan: this.selectedPonVlan,
            onuSerial: onu.onuMac,
            onuAlias: onu.onuAlias,
            user: user,
          };
  
          this.showModal = false; // Close the ONU registration modal
          this.notificar(
            TipoNotificacao.ATENCAO,
            "EXCELENTE!",
            `O cliente ${onu.onuAlias} está sendo cadastrado. Aguarde alguns segundos!`
          );
  
          const response = await axios.post(
            "https://api.heatmap.conectnet.net/liberar-onu",
            data
          );
  
          if (response.status === 200) {
            this.openJsonModal(response.data);
  
            // Armazena os dados da resposta em jsonData
            this.jsonData = response.data;
          }
  
          console.log("ONU registered successfully:", data);
  
          this.showModal = false;
        } catch (error) {
          console.error("Error registering ONU:", error);
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
  