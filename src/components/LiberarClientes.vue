<template>
  <div class="conter">
    <!-- Remove the 'columns' and 'column' classes -->
    <div class="caixa">
      <!-- v-for loop to create each item -->
      <Box class="box" v-for="result in apiResults" :key="result.onuMac">
        <div class="is-flex is-justify-content-space-between">
          <div>
            <p>
              <strong>ONU MAC:</strong>
              {{ result.onuMac.toLocaleUpperCase() }}
            </p>
            <p><strong>ONU Model:</strong> {{ result.onuModel }}</p>
            <p><strong>OLT Ramal:</strong> {{ result.oltRamal }}</p>
            <p><strong>OLT Name:</strong> {{ result.oltName }}</p>
          </div>
          <div class="buttons is-flex">
            <button
              class="button is-primary is-fullwidth"
              @click="openLiberationModal(result)"
            >
              Liberar
            </button>
            <button
              class="button is-primary is-fullwidth"
              @click="verificarSinal(result)"
            >
              Verificar Sinal
            </button>
          </div>
        </div>
      </Box>
      
    </div>
    <div class="modal" :class="{ 'is-active': showLiberationModal }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Liberar ONU</p>
          <button
            class="delete"
            aria-label="close"
            @click="closeLiberationModal"
          ></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Nome do cliente</label>
            <div class="control">
              <input
                class="input"
                type="text"
                v-model="onu.onuAlias"
                placeholder="Nome do cliente"
                name="onuAlias"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Nome da CTO</label>
            <div class="control">
              <input
                class="input"
                type="text"
                v-model="onu.Cto"
                placeholder="Nome da CTO"
                name="Cto"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Nome do Técnico</label>
            <div class="control">
              <input
                class="input"
                type="text"
                v-model="onu.Tecnico"
                placeholder="Nome do Técnico"
                name="Tecnico"
                required
              />
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-primary" @click="cadastrarOnu">
            Cadastrar
          </button>
          <button class="button" @click="closeLiberationModal">Cancelar</button>
        </footer>
      </div>
    </div>
    <SignalModal
      :showModal="showSignalModal"
      :selectedOnu="selectedOnu"
      @close="closeSignalModal"
    />
  </div>

  <div class="modal is-active" v-if="loading">
    <div class="modal-background"></div>
    <div class="modal-content">
      <progress class="progress is-info is-primary" max="100"></progress>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import IAllOnuLiberarData from "@/interfaces/IAllOnuLiberar";
import axios from "axios";
import Box from "./Box.vue";
import IOnuDataResponse from "../interfaces/IOnuDataResponse";
import SignalModal from "@/views/modais/SignalModal.vue";
import IAuthData from "@/interfaces/IAuthData";
import { TipoNotificacao } from "@/interfaces/INotificação";
import useNotificador from "@/hooks/notificador";
import { useStore } from "@/store";
import IOnuData from "@/interfaces/IOnuData";

export default defineComponent({
  name: "LiberarCliente",
  components: { SignalModal },
  data() {
    return {
      showModal: false,
      showSignalModal: false,
      apiResults: [] as IAllOnuLiberarData[],
      selectedOnu: {} as IOnuDataResponse,
      onu: {
        onuAlias: "",
        Cto: "",
        Tecnico: "",
      },
      jsonData: {} as Record<string, IOnuData>,
      showJsonModal: false,
      showLiberationModal: false,
      loading: false,
    };
  },
  computed: {},
  methods: {
    async fetchData() {
      this.notificar(
        TipoNotificacao.ATENCAO,
        "EXCELENTE!",
        `As Olts estão sendo consultadas. Aguarde alguns segundos!`
      );
      this.loading = true;
      const apiCalls: IAllOnuLiberarData[] = [];
      const baseIp = "192.168.";
      const startRange = 202;
      const endRange = 209;

      for (let i = startRange; i <= endRange; i++) {
        const oltIp = baseIp + i + ".2";
        const apiUrl =
          "https://api.heatmap.conectnet.net/verificar-ramal-onu-configurar";

        try {
          const response = await axios.post(apiUrl, { oltIp });
          const data = response.data;

          // Add the oltIp to each object containing onuMac, gpon, and onuModel properties
          const resultData: IAllOnuLiberarData[] = data.map(
            (item: IAllOnuLiberarData) => ({ ...item, oltIp })
          );

          // Push the combined data into the apiCalls array
          apiCalls.push(...resultData);
        } catch (error: any) {
          console.error(`Error for OLT IP ${oltIp}:`, error.message);
        }
      }

      // Make the second GET request
      try {
        const secondResponse = await axios.get(
          "https://api.heatmap.conectnet.net/ramais"
        );
        const secondData = secondResponse.data;

        // Associating data from the first and second requests based on oltIp and gpon
        const mergedData = apiCalls.map((apiData) => {
          const matchingData = secondData.find(
            (secondDataItem: IAllOnuLiberarData) =>
              secondDataItem.oltIp === apiData.oltIp &&
              secondDataItem.oltPon === apiData.gpon
          );

          return matchingData ? { ...apiData, ...matchingData } : apiData;
        });

        // Set the results in apiResults
        this.apiResults = mergedData;

        this.notificar(
          TipoNotificacao.SUCESSO,
          "EXCELENTE!",
          `Já pode dale meu consagrated!`
        );
        this.loading = false;
        // Show the modal after obtaining the results
        console.log(mergedData);
      } catch (error: any) {
        console.error("Error in second GET request:", error.message);
      }
    },
    async verificarSinal(cliente: any) {
  try {
    console.log("Verifying signal for ONU:", cliente);

    // Make the request to get the ONU signal data
    const response = await axios.post(
      "https://api.heatmap.conectnet.net/verificar-onu-completo",
      {
        oltIp: cliente.oltIp,
        onuAlias: cliente.onuMac,
      }
    );
    const responseData = response.data;

    // Show the signal modal with the data
    this.selectedOnu = responseData;
    this.showSignalModal = true;
  } catch (error) {
    console.error("Error verifying signal:", error);
  }
},
    closeSignalModal() {
      this.showSignalModal = false;
    },

    openLiberationModal(result: any) {
      this.showLiberationModal = true;
      this.selectedOnu = result; // Set the selectedOnu to the clicked result
    },

    // Method to close the Liberation Modal
    closeLiberationModal() {
      this.showLiberationModal = false;
      this.resetOnuFields(); // Reset the input fields when closing the modal
    },

    // Method to reset the input fields
    resetOnuFields() {
      this.onu.onuAlias = "";
      this.onu.Cto = "";
      this.onu.Tecnico = "";
    },

    async cadastrarOnu(result: any) {
  // Check if all fields are filled
  if (!this.onu.onuAlias || !this.onu.Cto || !this.onu.Tecnico) {
    this.showLiberationModal = true;
    return;
  }

  const authData = localStorage.getItem("authData");
  if (authData === null) {
    console.error("Authentication data is missing from localStorage.");
    return;
  }

  const { username } = JSON.parse(authData) as IAuthData;
  const user = username ?? "Unknown User";
  console.log(user);

  // Convert spaces to hyphens and uppercase the values
  this.onu.onuAlias = this.onu.onuAlias.replace(/\s+/g, "-").toUpperCase();
  this.onu.Cto = this.onu.Cto.replace(/\s+/g, "-").toUpperCase();
  this.onu.Tecnico = this.onu.Tecnico.replace(/\s+/g, "-").toUpperCase();

  // Combine the data with selectedOnu and other necessary fields
  const combinedData: any = {
    oltIp: this.selectedOnu.oltIp,
    oltPon: this.selectedOnu.oltPon,
    onuVlan: this.selectedOnu.ponVlan,
    cto: this.onu.Cto,
    tecnico: this.onu.Tecnico,
    onuSerial: this.selectedOnu.onuMac,
    user: user,
    // Add the necessary properties from this.selectedOnu
    onuMac: this.selectedOnu.onuMac,
    gpon: this.selectedOnu.gpon,
    onuModel: this.selectedOnu.onuModel,
    oltRamal: this.selectedOnu.oltRamal,
    onuAlias: this.onu.onuAlias,
  };

  console.log("Combined Data:", combinedData);

  // Send a POST request to the endpoint
  try {
    this.showLiberationModal = false;
    this.notificar(
      TipoNotificacao.ATENCAO,
      "EXCELENTE!",
      `O cliente está sendo cadastrado. Aguarde alguns segundos!`
    );
    this.loading = true;
    const response = await axios.post(
      "https://api.heatmap.conectnet.net/liberar-onu",
      combinedData
    );

    if (response.status === 200) {
      this.loading = false;
    }
    this.notificar(
      TipoNotificacao.SUCESSO,
      "EXCELENTE!",
      `Dados sendo aferidos...`
    );

    let cliente = this.selectedOnu;
    this.verificarSinal(cliente);

    // Handle the response here
    console.log("Response from API:", response.data);

    // Close the Liberation Modal after processing the response
  } catch (error) {
    console.error("Error in POST request:", error);
    alert(
      "Ocorreu um erro ao cadastrar a ONU. Por favor, tente novamente mais tarde."
    );
  }
}
  },
  beforeMount() {
    this.fetchData();
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
.button {
  background-color: rgb(34, 130, 214);
  padding: 1.5rem;
  color: aliceblue;
}

.button:hover {
  background-color: #e96d13; /* Change the background color on hover */
}

.container {
  max-width: 300px;
}

.box {
  max-width: 700px;
  border: 2px solid rgb(34, 130, 214);
}

.caixa {
  padding: 1.25rem;
  margin-bottom: 1rem;
  max-height: 1000px; /* Set the maximum height of the container */
  overflow-y: auto; /* Add a vertical scrollbar when content exceeds the height */
}

.conter {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 100px); /* Set the maximum height of the entire content */
}
</style>
