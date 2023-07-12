<template>
    <div>
      <div class="search-container">
        <input class="input" type="text" v-model="searchQuery" placeholder="Procure pelo nome do cliente" />
      </div>
      <div class="client-container">
        <Box v-for="ramal in filteredRamais" :key="ramal._id">
          <div class="columns" @click="toggleDropdown(ramal._id)">
            <div class="column">
              <strong class="label">OLT Ramal:</strong> {{ ramal.oltRamal }}
            </div>
            <div class="column">
              <strong class="label">OLT IP:</strong> {{ ramal.oltIp }}
            </div>
            <div class="column">
              <strong class="label">OLT PON:</strong> {{ ramal.oltPon }}
            </div>
          </div>
          
          <div v-if="activeDropdown === ramal._id" class="dropdown columns is-30">
            <!-- Dropdown content -->
            <div class="dropdown-content">
              <table class="table">
                <tr>
                  <td><strong class="label">OLT Ramal:</strong></td>
                  <td>{{ ramal.oltRamal }}</td>
                </tr>
                <tr>
                  <td><strong class="label">OLT IP:</strong></td>
                  <td>{{ ramal.oltIp }}</td>
                </tr>
                <tr>
                  <td><strong class="label">OLT PON:</strong></td>
                  <td>{{ ramal.oltPon }}</td>
                </tr>
                <tr>
                  <td><strong class="label">PON VLAN:</strong></td>
                  <td>{{ ramal.ponVlan }}</td>
                </tr>
                <tr>
                  <td><strong class="label">OLT Name:</strong></td>
                  <td>{{ ramal.oltName }}</td>
                </tr>
              </table>
            </div>
          </div>
        </Box>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, PropType, computed } from 'vue';
  
  import IRamal from '../interfaces/IRamal';
  import Box from './Box.vue';
  
  export default defineComponent({
    name: 'RamalTeste',
    components: {
      Box
    },
    data() {
      return {
        fetchedRamais: [] as IRamal[],
        activeDropdown: null as string | null,
        searchQuery: '',
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
    },
    methods: {
      async fetchRamalData() {
        try {
          const response = await fetch('https://api.heatmap.conectnet.net/ramais');
          const data = await response.json();
          this.fetchedRamais = data;
        } catch (error) {
          console.error('Error fetching ramal data:', error);
        }
      },
      toggleDropdown(ramalId: string) {
        if (this.activeDropdown === ramalId) {
          this.activeDropdown = null;
        } else {
          this.activeDropdown = ramalId;
        }
      }
    }
  });
  </script>
  
  <style scoped>
  .search-container {
    padding: 1.5rem 0;
  }
  
  .label {
    color: #e96d13;
    font-weight: bold;
  }
  
  .dropdown-item p {
    margin: 0;
    padding-bottom: 0.5em;
  }
  
  .dropdown-item strong {
    margin-right: 0.5em;
    padding-bottom: 0.5em;
  }
  
  .client-container {
    max-height: calc(100vh - 100px);
    overflow-y: auto;
    padding: 1.25rem;
  }
  </style>
  