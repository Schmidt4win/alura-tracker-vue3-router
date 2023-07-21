<template>
  <div>
    <div class="search-container">
      <input
        class="input"
        type="text"
        v-model="searchQuery"
        placeholder="Procure pelo Ramal"
      />
    </div>
    <div class="client-container">
      <Box v-for="ramal in filteredRamais" :key="ramal._id">
        <div class="columns">
          <div class="column">
            <strong class="label">OLT Ramal:</strong> {{ ramal.oltRamal }}
          </div>
          <div class="column">
            <strong class="label">OLT IP:</strong> {{ ramal.oltIp }}
          </div>
          <div class="column">
            <strong class="label">OLT PON:</strong> {{ ramal.oltPon }}
          </div>
          <div class="column">
            <button class="button is-primary" @click="openModal(ramal)">
              Open Modal
            </button>
          </div>
        </div>
      </Box>
    </div>

    <div class="modal-overlay" v-if="showModal">
      <div class="modal is-active">
        <button
          class="delete modal-close"
          aria-label="close"
          @click="closeModal"
        ></button>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">ONUs:</p>
          </header>
          <section class="modal-card-body">
            <table class="table">
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
                  <td>{{ onu.onuMac }}</td>
                  <td>{{ onu.gpon }}</td>
                  <td>{{ onu.onuModel }}</td>
                  <td>
                    <input
                      class="input"
                      type="text"
                      v-model="onu.onuAlias"
                      placeholder="Nome do cliente"
                      name="onuAlias"
                    />
                  </td>
                  <button @click="registerOnu(onu)">Cadastrar</button>
                </tr>
              </tbody>
              <tfoot></tfoot>
            </table>
          </section>
          <footer class="modal-card-foot">
            <button class="button" @click="closeModal">Fechar</button>
          </footer>
        </div>
      </div>
    </div>
    <div class="modal-overlay" v-if="showJsonModal">
      <div class="modal is-active json-modal">
        <button class="delete modal-close" aria-label="close" @click="closeJsonModal"></button>
        <div class="modal-card json-modal-card">
          <header class="modal-card-head json-modal-header custom-background">
            <p class="modal-card-title custom-text-color">ONU LIBERADA COM SUCESSO</p>
          </header>
          <section class="modal-card-body json-modal-body custom-terminal-background custom-text-color">
            <pre class="teste-asul">{{ jsonData }}</pre>
          </section>
          <footer class="modal-card-foot json-modal-footer custom-background">
            <button class="button" @click="closeJsonModal">Fechar</button>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";
import IRamal from "../interfaces/IRamal";
import IOnu from "../interfaces/IOnu";
import IStatus from "../interfaces/IStatus";
import Box from "./Box.vue";

export default defineComponent({
  name: "RamalTeste",
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
      selectedOltIp: "", // Holds the selected OLT IP
      selectedOltPon: "", // Holds the selected OLT PON
      selectedPonVlan: "",
      onuAlias: "", // Holds the value of the input field for onuAlias
      showJsonModal: false, // New data property for controlling the JSON modal
      jsonData: {}, // New data property to store the JSON data
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
        const response = await fetch(
          "https://api.heatmap.conectnet.net/ramais"
        );
        const data = await response.json();
        this.fetchedRamais = data;
      } catch (error) {
        console.error("Error fetching ramal data:", error);
      }
    },
    openJsonModal(data: IStatus) {
      this.jsonData = data;
      this.showJsonModal = true;
    },
    closeJsonModal() {
      this.showJsonModal = false;
    },
    async openModal(ramal: IRamal) {
      try {
        const response = await fetch(
          "https://api.heatmap.conectnet.net/listar-onu",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ oltIp: ramal.oltIp }),
          }
        );
        const data = await response.json();
        this.onus = data.map((onu: IOnu) => ({
          ...onu,
          onuAlias: "", // Initialize onuAlias for each onu object
        }));
        this.selectedOltIp = ramal.oltIp;
        this.selectedOltPon = ramal.oltPon;
        this.selectedPonVlan = ramal.ponVlan;
        this.showModal = true;
      } catch (error) {
        console.error("Error fetching ONU data:", error);
      }
    },
    closeModal() {
      this.showModal = false;
    },
    async registerOnu(onu: IOnu) {
  try {
    const data = {
      oltIp: this.selectedOltIp,
      oltPon: onu.gpon,
      onuVlan: this.selectedPonVlan,
      onuSerial: onu.onuMac,
      onuAlias: onu.onuAlias,
    };

    // Send the HTTP POST request using axios
    const response = await axios.post(
      "https://api.heatmap.conectnet.net/liberar-onu",
      data
    );

    // Check if the HTTP request is successful (status code 200) and open the JSON modal with the response data
    if (response.status === 200) {
      this.openJsonModal(response.data);
    }

    // Optional: You can show a success message or perform any other action after successful registration.
    console.log("ONU registered successfully:", data);

    // Close the modal after successful registration.
    this.showModal = false;
  } catch (error) {
    console.error("Error registering ONU:", error);
    // Handle error cases here if needed.
  }
},
  },
});
</script>
<style scoped>
.custom-background {
  background-color: aliceblue;
}

.teste-asul {
  color: aliceblue;
  background-color: black
}
.custom-text-color {
  color: black;
}

.custom-terminal-background {
  background-color: black;
}
.search-container {
  padding: 1.5rem 0;
}

.label {
  color: #e96d13;
  font-weight: bold;
}

.client-container {
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding: 1.25rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5); /* Add transparency to the background */
}

.modal.is-active {
  display: flex !important; /* Force the modal to be visible */
}

.modal-card {
  background-color: white;
  border-radius: 5px;
  max-width: 80%; /* Adjust the width as needed */
  max-height: 80%; /* Adjust the height as needed */
  overflow-y: auto; /* Add scroll if the modal content exceeds the height */
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
  display: block !important; /* Force the background to be visible */
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
</style>
