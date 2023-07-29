<template>
    <div>
        <Box>        
        <table class="table">
      <tbody>
        <Box v-for="(groupedOLTs, oltName) in groupedOnuData" :key="oltName">
          <td @click="toggleDropdown(oltName)" class="{ 'active-dropdown': showDropdownId === oltName }">{{ oltName }}</td>
          <Box v-if="showDropdownId === oltName">
            <ul class="ramal-dropdown">
              <li v-for="(groupedRamals, oltRamal) in groupedOLTs" :key="oltRamal">
                <div
                  @click="toggleRamalDropdown(oltName, oltRamal)"
                  :class="{ 'active-dropdown': isRamalDropdownOpen(oltName, oltRamal) }"
                >
                  {{ oltRamal }}
                </div>
                <ul v-if="isRamalDropdownOpen(oltName, oltRamal)">
                  <div v-for="(data, index) in groupedRamals" :key="index">
                    <p> {{ data.date_time }}</p>
                    <button @click="toggleModal(data)" class="button is-primary">Verificar Sinal</button>
                  </div>
                </ul>
              </li>
            </ul>
          </Box>
        </Box>
      </tbody>
    </table>
    </Box>
  
      <!-- Modal -->
      <div v-if="showModal" class="modal is-active">
        <div class="modal-background" @click="toggleModal"></div>
        <div class="modal-content">
          <div class="modal-title">
            <h1>Clientes ({{ onuCount }} ONUs)</h1>
            <p>Average Power Level: {{ averagePowerLevel }}</p>
            <p>Average RSSI: {{ averageRSSI }}</p>
          </div>
          <div class="modal-box">
            <div class="box modal-content-box">
              <div v-for="(cliente, key) in selectedClientes" :key="key">
                <div class="columns">
                  <div class="column">{{ cliente.name }}</div>
                  <div class="column">{{ cliente["Power Level"] }}</div>
                  <div class="column">{{ cliente.RSSI }}</div>
                  <!-- Add other properties here -->
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="modal-close is-large" aria-label="close" @click="toggleModal"></button>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from "vue";
  import axios from "axios";
  import Box from "./Box.vue";
  
  
  interface OnuData {
    _id: string;
    oltIp: string;
    oltRamal: string;
    oltName: string;
    oltPon: string;
    date_time: string;
    clientes?: Record<string, ClienteData>;
  }
  
  interface ClienteData {
    mac: string;
    Status: string;
    "Power Level": string;
    RSSI: string;
    name: string;
    date_time: string;
  }
  
  export default defineComponent({
    name: "TabelaPon",
    components: {
        Box
    },
    data() {
      return {
        onuData: [] as OnuData[],
        showDropdownId: "",
        showRamalDropdown: {} as Record<string, Record<string, boolean>>,
        selectedClientes: null as null | Record<string, ClienteData>,
        showModal: false,
        searchQuery: "",
        recordedAverage: {} as Record<string, string>,
      };
    },
    computed: {
        isRamalDropdownOpen(): (oltName: string, oltRamal: string) => boolean {
      return (oltName: string, oltRamal: string) =>
        this.showRamalDropdown[oltName] && this.showRamalDropdown[oltName][oltRamal];
    },
      filteredGroupedData(): OnuData[] {
        const query = this.searchQuery.toLowerCase();
        const filteredData: OnuData[] = [];
  
        // Filter the grouped data
        for (const ramal in this.groupedOnuData) {
          const groupData = this.groupedOnuData[ramal];
          const filteredGroupData = groupData.filter(
            (item) => item.oltRamal.toLowerCase().includes(query)
          );
          filteredData.push(...filteredGroupData);
        }
  
        return filteredData;
      },
  
      groupedOnuData(): Record<string, Record<string, OnuData[]>> {
      const groupedData: Record<string, Record<string, OnuData[]>> = {};
      for (const item of this.sortedOnuData) {
        const oltName = item.oltName;
        const oltRamal = item.oltRamal;
        if (!groupedData[oltName]) {
          groupedData[oltName] = {};
        }
        if (!groupedData[oltName][oltRamal]) {
          groupedData[oltName][oltRamal] = [];
        }
        groupedData[oltName][oltRamal].push(item);
      }
      return groupedData;
    },
  
      // New computed property to calculate average signal levels for each group
      averageSignalLevels(): Record<string, string> {
        const averageSignals: Record<string, string> = {};
        for (const ramal in this.groupedOnuData) {
          const groupData = this.groupedOnuData[ramal];
          const signalLevels = groupData.flatMap((item) =>
            Object.values(item.clientes || {}).map((cliente) =>
              this.parseNumber(cliente["Power Level"] ?? '', 0)
            )
          );
          averageSignals[ramal] = this.calculateAverageSignal(signalLevels);
        }
        return averageSignals;
      },
  
      averageRSSILevels(): Record<string, string> {
      const averageRSSI: Record<string, string> = {};
      for (const ramal in this.groupedOnuData) {
        const groupData = this.groupedOnuData[ramal];
        const rssiLevels = groupData.flatMap((item) =>
          Object.values(item.clientes || {}).map((cliente) =>
            this.parseNumber(cliente.RSSI ?? "", 0)
          )
        );
        averageRSSI[ramal] = this.calculateAverageSignal(rssiLevels);
      }
      return averageRSSI;
    },
  
  
  
      sortedOnuData(): OnuData[] {
        return this.sortDataByDateTime(this.onuData);
      },
      onuCount(): number {
        return this.selectedClientes ? Object.keys(this.selectedClientes).length : 0;
      },
      averagePowerLevel(): string {
      if (!this.selectedClientes) return "";

      const powerLevels = Object.values(this.selectedClientes)
        .map((cliente) => this.parseNumber(cliente["Power Level"], NaN))
        .filter((val) => !isNaN(val)); // Filter out NaN values

      if (powerLevels.length === 0) return ""; // Handle empty values

      const average =
        powerLevels.reduce((acc, val) => acc + val, 0) / powerLevels.length;
      return `${average.toFixed(2)}dBm (+-3dBm)`;
    },

    // Update averageRSSI computed property
    averageRSSI(): string {
      if (!this.selectedClientes) return "";

      const rssis = Object.values(this.selectedClientes)
        .map((cliente) => this.parseNumber(cliente.RSSI, NaN))
        .filter((val) => !isNaN(val)); // Filter out NaN values

      if (rssis.length === 0) return ""; // Handle empty values

      const average = rssis.reduce((acc, val) => acc + val, 0) / rssis.length;
      return `${average.toFixed(2)}dBm (+-3dBm)`;
    },
  
      filteredOnuData(): OnuData[] {
        const query = this.searchQuery.toLowerCase();
        return this.sortedOnuData.filter(
          (item) => item.oltRamal.toLowerCase().includes(query)
        );
      },
  
  
    },
    methods: {
        

        
  
      parseNumber(value: string | ClienteData | undefined, defaultValue: number): number {
        if (typeof value === 'string') {
          const parsedValue = parseFloat(value);
          return isNaN(parsedValue) ? defaultValue : parsedValue;
        }
        return defaultValue;
      },
      calculateAverageSignal(signalLevels: number[]): string {
        if (signalLevels.length === 0) return ""; // Handle empty values
        const average = signalLevels.reduce((acc, val) => acc + val, 0) / signalLevels.length;
        return `${average.toFixed(2)}dBm (+-3dBm)`;
      },
      async fetchData() {
        try {
          const response = await axios.get(
            "https://api.heatmap.conectnet.net/allonuget"
          );
          this.onuData = response.data;
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      },
      
      sortDataByDateTime(data: OnuData[]): OnuData[] {
        return data.slice().sort(
          (a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
        );
      },
      
      toggleDropdown(id: string) {
      if (this.showDropdownId === id) {
        this.showDropdownId = "";
      } else {
        this.showDropdownId = id;
        this.showRamalDropdownId = "";
      }
      console.log("Dropdown Toggled for:", id);
    },

    toggleRamalDropdown(oltName: string, oltRamal: string) {
      if (!this.showRamalDropdown[oltName]) {
        this.showRamalDropdown[oltName] = {};
      }
      this.showRamalDropdown[oltName][oltRamal] = !this.isRamalDropdownOpen(
        oltName,
        oltRamal
      );
      console.log("Ramal Dropdown Toggled for:", oltName, oltRamal);
    },

    toggleModal(data: OnuData) {
  // Check if clientes data is available for the selected ONU
  if (data.clientes) {
    // If available, set the selectedClientes property with the data
    this.selectedClientes = data.clientes;
  } else {
    // If not available, set selectedClientes to null to handle the case
    // where there are no cliente data for the selected ONU
    this.selectedClientes = null;
  }

  this.showModal = !this.showModal;
  console.log("Modal Toggled with Data:", data);
},
  
    },
    created() {
      this.fetchData();
    },
  });
  </script>
  
  <style scoped>


.dropdown {
  display: inline-block;
  position: relative;
  margin-left: 10px;
  cursor: pointer;
}

.dropdown ul {
  list-style: none;
  padding-left: 0;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.dropdown li {
  cursor: pointer;
  padding: 5px 10px;
}

.dropdown li:hover {
  background-color: #f5f5f5;
}
  .container {
    padding: 2rem;
    max-height: calc(50vh - 100px);
    /* Set a maximum height for the container */
    overflow-y: auto;
    /* Enable scrolling when content exceeds the maximum height */
  }
  
  .grouped-data-container {
    padding: 2rem;
    max-height: calc(50vh - 200px);
    overflow-y: auto;
  }
  
  .grouped-data-container .title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }
  
  .grouped-data-container .grouped-row {
    margin-bottom: 2rem;
    border-bottom: 1px solid #ddd;
    padding-bottom: 1rem;
  }
  
  .grouped-data-container .average-signal {
    margin-top: 1rem;
  }
  
  .card {
    margin-bottom: 1rem;
  }
  
  .modal-box {
    max-height: 80vh;
    overflow-y: auto;
  }
  
  .modal-title {
    padding: 1rem;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
    z-index: 9999;
  }
  
  .modal-content-box {
    padding: 1rem;
  }
  </style>