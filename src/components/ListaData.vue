<template>
  <div>
    <div class="field">
      <div class="control">
        <input class="input" type="text" v-model="searchQuery" placeholder="Search by OLT Ramal" />
      </div>
    </div>
    <div class="columns is-multiline container">
      <table class="table is-fullwidth">
  <tbody>
    <tr v-for="item in filteredOnuData" :key="item._id">
      <td>{{ item.oltName }}</td>
      <td>{{ item.oltRamal }}</td>
      <td>{{ item.date_time }}</td>
      <td>
        <a @click="toggleModal(item)" class="button is-primary">Clientes</a>
      </td>
    </tr>
  </tbody>
</table>
    </div>
    <Box>
      <div class="grouped-data-container">
        <div class="title">Grouped Data and Average Signal Levels</div>
        <div class="grouped-row" v-for="(groupedData, ramal) in groupedOnuData" :key="ramal">
          <div class="columns is-multiline">
            <table class="table is-fullwidth">
              <tbody>
            <tr class="column" v-for="(item, index) in groupedData" :key="index">
              <div class="card">
                <div class="card-content">
                  <td class="title">{{ item.oltName }}</td>
                  <td class="subtitle">{{ item.oltRamal }}</td>
                  <td class="subtitle">{{ item.date_time }}</td>
                </div>
              </div>
              
            </tr>
            <tr>
              <td class="average-signal">Average Power Level: {{ averageSignalLevels[ramal] }}</td>
          <td class="subtitle">Average RSSI: {{ averageRSSILevels[ramal] }}</td>
            </tr>
          </tbody>
          </table>
          </div>
          
        </div>
      </div>
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
  name: "ListaData",
  components: {
    Box
  },
  data() {
    return {
      onuData: [] as OnuData[],
      showDropdownId: "",
      selectedClientes: null as null | Record<string, ClienteData>,
      showModal: false,
      searchQuery: "",
      recordedAverage: {} as Record<string, string>,
    };
  },
  computed: {
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

    groupedOnuData(): Record<string, OnuData[]> {
      const groupedData: Record<string, OnuData[]> = {};
      for (const item of this.sortedOnuData) {
        if (!groupedData[item.oltRamal]) {
          groupedData[item.oltRamal] = [item];
        } else {
          groupedData[item.oltRamal].push(item);
        }
      }
      console.log("data agrupada: ", groupedData)
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
        .map((cliente) => parseFloat(cliente["Power Level"]))
        .filter((val) => !isNaN(val)); // Filter out NaN values

      if (powerLevels.length === 0) return ""; // Handle empty values

      const average =
        powerLevels.reduce((acc, val) => acc + val, 0) / powerLevels.length;
      return `${average.toFixed(2)}dBm (+-3dBm)`;
    },

    averageRSSI(): string {
      if (!this.selectedClientes) return "";

      const rssis = Object.values(this.selectedClientes)
        .map((cliente) => parseFloat(cliente.RSSI))
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
    toggleDropdown(item: OnuData) {
      this.showDropdownId = this.showDropdownId === item._id ? "" : item._id;
      if (this.showDropdownId === item._id) {
        this.selectedClientes = item.clientes || null;
      } else {
        this.selectedClientes = null;
      }
    },
    sortDataByDateTime(data: OnuData[]): OnuData[] {
      return data.slice().sort(
        (a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
      );
    },
    toggleModal(item?: OnuData) {
      if (item) {
        this.selectedClientes = item.clientes || null;
      } else {
        this.selectedClientes = null;
      }
      this.showModal = !this.showModal;
    },
  },
  created() {
    this.fetchData();
  },
});
</script>

<style scoped>
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