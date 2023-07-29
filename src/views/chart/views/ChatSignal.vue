<template>
    <div>
      <div class="conter">
        <h1 class="title">Lista de Clientes</h1>
      </div>
  
      <div class="conter">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Pesquisar cliente por nome"
        />
        <h2>Nomes dos Clientes</h2>
        <div v-for="(client, index) in filteredClients" :key="index">
          <h3 @click="openModal(client)">{{ client.name }}</h3>
        </div>
      </div>
  
      <!-- The Modal component -->
      <ModalSignal
        :selectedClient="selectedClient"
        :clientDataByDate="clientDataByDate"
        @close="closeModal"
      />
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import axios from 'axios';
  import ModalSignal from "@/views/chart/component/ModalSignal.vue"
  interface Cliente {
    mac: string;
    Status: string;
    "Power Level": string;
    RSSI: string;
    name: string;
    date_time: string;
  }
  
  interface ClientesData {
    [key: string]: Cliente;
  }
  
  interface IDadosCliente {
    _id: string;
    oltIp: string;
    oltRamal: string;
    oltName: string;
    oltPon: string;
    date_time: string;
    clientes?: ClientesData;
  }
  
  export default defineComponent({
    name: "ChartSignal",
    components: {
        ModalSignal
    },
    data() {
        return {
      fetchedData: {} as IDadosCliente[],
      nameList: [] as Cliente[],
      selectedClient: null as Cliente | null,
      searchQuery: "",
      
    };
    },
    async created() {
      try {
        const response = await axios.get('https://api.heatmap.conectnet.net/allonuget');
        console.log(response.data);
        this.fetchedData = response.data;
        this.groupClientsByName();
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      }
    },
    methods: {
      openModal(client: Cliente) {
        // Set the selected client to open the modal
        this.selectedClient = client;
        // Group client data by date for the modal content
        this.groupClientDataByDate(client);
      },
      closeModal() {
        // Close the modal by setting the selected client to null
        this.selectedClient = null;
      },
      groupClientsByName() {
        if (!this.fetchedData) {
          return;
        }
  
        const groupedClients: { [name: string]: Cliente } = {};
        const namesList: Cliente[] = [];
  
        this.fetchedData.forEach((item: IDadosCliente) => {
          const clientes = item.clientes;
          if (clientes) {
            Object.entries(clientes).forEach(([clientId, clientData]) => {
              const name = clientData.name;
              if (!groupedClients[name]) {
                groupedClients[name] = clientData;
                namesList.push(clientData);
              }
            });
          }
        });
  
        this.nameList = namesList;
      },
      groupClientDataByDate(client: Cliente) {
        if (!this.fetchedData) {
          return;
        }
  
        const clientDataByDate: { [date_time: string]: Cliente } = {};
  
        this.fetchedData.forEach((item: IDadosCliente) => {
          const clientes = item.clientes;
          if (clientes) {
            Object.entries(clientes).forEach(([clientId, clientData]) => {
              if (clientData.name === client.name) {
                const date_time = clientData.date_time;
                clientDataByDate[date_time] = clientData;
              }
            });
          }
        });
  
        this.clientDataByDate = clientDataByDate;
      },
    },
    computed: {
        filteredClients(): Cliente[] {
      if (!this.searchQuery) {
        return this.nameList;
      }

      const lowerCaseQuery = this.searchQuery.toLowerCase();
      return this.nameList.filter((client: Cliente) =>
        client.name.toLowerCase().includes(lowerCaseQuery)
      );
    }
    },
    setup() {
      return {
        clientDataByDate: {} as { [date_time: string]: Cliente },
      };
    },
  });
  </script>
  
  <style scoped>
  .conter {
    padding: 2rem;
    max-height: calc(80vh - 100px);
    /* Set a maximum height for the container */
    overflow-y: auto;
    overflow-x: auto;
    max-width: calc(80vh - 100px);
    background-color: aliceblue;
    padding: 1.25rem;
  }
  </style>
  