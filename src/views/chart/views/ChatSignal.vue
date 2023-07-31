<template>
    <div class="page-container">
      <div class="">
        <h1 class="title">Lista de Clientes</h1>
      </div>
  
      <div class="">
        <input
        class="input"
          type="text"
          v-model="searchQuery"
          placeholder="Pesquisar cliente por nome"
        />
        <h2>Nomes dos Clientes</h2>
        <Box class="conter">
        <div v-for="(client, index) in filteredClients" :key="index">
          <Box class="caixa-nomes" @click="openModal(client)">{{ client.name }}</Box>
        </div>
    </Box>
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
  import Box from '@/components/Box.vue';
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
        ModalSignal,
        Box
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
        console.log(this.clientDataByDate)
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
    
    max-height: calc(100vh - 240px);
    /* Set a maximum height for the container */
    overflow-y: auto;
    overflow-x: auto;
    background-color: rgb(12, 1, 73);
    padding: 1.25rem;
  }

  .page-container {
    padding: 2rem;
    
  }

  .input {
    max-width: 400px;
  }

  .caixa-nomes {
    margin-bottom: 10px;
    padding: 1.25rem;
    border: 2px solid #e96d13; /* Adding a border */
    border-radius: 5px; /* Rounded corners */
    background-color: #f9f9f9; /* Background color for the names box */
    cursor: pointer; /* Change cursor on hover */
    transition: background-color 0.3s ease; /* Smooth transition */
  }

  /* Highlight text on hover */
  .caixa-nomes:hover {
    background-color: rgb(34, 130, 214);
    color: aliceblue;
  }

  /* Styling the title */
  .title {
    font-size: 2rem;
    color: #fff;
    margin-bottom: 1rem;
  }

  /* Styling the subtitle */
  h2 {
    font-size: 1.5rem;
    color: aliceblue;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }

  /* Styling the search query input */
  .input {
    max-width: 400px;
    font-size: 1rem;
    padding: 0.5rem;
    border: 1px solid #333;
    border-radius: 5px;
  }

 
</style>