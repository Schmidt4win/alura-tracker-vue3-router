<template>
  <div>
    <div class="search-container">
      <input
        class="input"
        type="text"
        v-model="searchQuery"
        placeholder="Procure pelo número do talão"
      />
    </div>
    <div class="talao-container">
      <Box v-for="talao in filteredTaloes" :key="talao._id">
        <div class="columns" >
          <div class="column">
            <strong class="label">Remessa:</strong> {{ talao.remessa }}
          </div>
          <div class="column">
            <strong class="label">Quantidade de Pares:</strong>
            {{ talao.quantidadePares }}
          </div>

          <div class="column">
            <strong class="label">Cortador:</strong> {{ talao.cortador }}
          </div>
          <button
            class="detalhes-button ml-2 is-danger"
            @click="toggleDropdown(talao._id)"
          >
            <span class="icon is-small">
              <i class="fa-solid fa-circle-info"></i>
            </span>
          </button>
          
          <button
            class="editar-button ml-2 is-danger"
            @click="openEditModal(talao)"
          >
            <span class="icon is-small">
              <i class="fa-regular fa-pen-to-square"></i>
            </span>
          </button>
          <button
            class="deletar-button ml-2 is-danger"
            @click="openDeleteConfirmation(talao._id)"
          >
            <span class="icon is-small">
              <i class="fas fa-trash"></i>
            </span>
          </button>
        </div>
        <div v-if="activeDropdown === talao._id" class="dropdown columns is-30">
          <!-- Dropdown content -->
          <div class="dropdown-content">
            <table class="table">
              <tr>
                <td><strong class="label">Remessa:</strong></td>
                <td>{{ talao.remessa }}</td>
              </tr>
              <tr>
                <td><strong class="label">Lote:</strong></td>
                <td>{{ talao.lote }}</td>
              </tr>
              <tr>
                <td><strong class="label">Modelo:</strong></td>
                <td>{{ talao.modelo }}</td>
              </tr>
              <tr>
                <td><strong class="label">Quantidade de Pares:</strong></td>
                <td>{{ talao.quantidadePares }}</td>
              </tr>
              <tr>
                <td><strong class="label">Material:</strong></td>
                <td>{{ talao.material }}</td>
              </tr>
              <tr>
                <td><strong class="label">Cortador:</strong></td>
                <td>{{ talao.cortador }}</td>
              </tr>
              <tr>
                <td><strong class="label">Data:</strong></td>
                <td>{{ talao.data }}</td>
              </tr>
            </table>
          </div>
        </div>
      </Box>
    </div>

    <!-- Delete confirmation modal -->
    <div class="modal" :class="{ 'is-active': isDeleteModalOpen }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Confirmação de exclusão</p>
          <button
            class="delete"
            aria-label="close"
            @click="closeDeleteConfirmation"
          ></button>
        </header>
        <section class="modal-card-body">
          <p>Deseja excluir este talão?</p>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-danger-modal" @click="deleteTalaoConfirmation">
            Sim
          </button>
          <button class="button" @click="closeDeleteConfirmation">Não</button>
        </footer>
      </div>
    </div>

    <!-- Edit modal -->
    <div class="modal" :class="{ 'is-active': isEditModalOpen }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Editar Talão:</p>
          <button
            class="delete"
            aria-label="close"
            @click="closeEditModal"
          ></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Remessa:</label>
            <div class="control">
              <input
                class="input"
                type="text"
                v-model="editedTalao.remessa"
              />
            </div>
          </div>
          <div class="field">
            <label class="label">Lote:</label>
            <div class="control">
              <input class="input" type="text" v-model="editedTalao.lote" />
            </div>
          </div>
          <div class="field">
            <label class="label">Modelo:</label>
            <div class="control">
              <input
                class="input"
                type="text"
                v-model="editedTalao.modelo"
              />
            </div>
          </div>
          <div class="field">
            <label class="label">Quantidade de Pares:</label>
            <div class="control">
              <input
                class="input"
                type="number"
                v-model="editedTalao.quantidadePares"
              />
            </div>
          </div>
          <div class="field">
            <label class="label">Material:</label>
            <div class="control">
              <input
                class="input"
                type="text"
                v-model="editedTalao.material"
              />
            </div>
          </div>
          <div class="field">
            <label class="label">Cortador:</label>
            <div class="control">
              <input
                class="input"
                type="text"
                v-model="editedTalao.cortador"
              />
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success" @click="confirmEditTalao">
            Confirmar
          </button>
          <button class="button" @click="closeEditModal">Cancelar</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

import ITalao from "../interfaces/ITalao";
import Box from "./Box.vue";

export default defineComponent({
  name: "TalaoLista",
  components: {
    Box,
  },
  data() {
    return {
      fetchedTaloes: [] as ITalao[],
      activeDropdown: null as string | null,
      searchQuery: "",
      isDeleteModalOpen: false,
      talaoToDelete: null as string | null,
      isEditModalOpen: false,
      editedTalao: {
        _id: "",
        remessa: "",
        lote: "",
        modelo: "",
        quantidadePares: 0,
        material: "",
        cortador: "",
      },
    };
  },
  beforeMount() {
    this.fetchTalaoData();
  },
  created() {
    this.fetchTalaoData();
  },
  computed: {
    filteredTaloes(): ITalao[] {
      if (!this.searchQuery) {
        return this.fetchedTaloes;
      } else {
        const query = this.searchQuery.toLowerCase();
        return this.fetchedTaloes.filter((talao: ITalao) => {
          const {
            remessa,
            lote,
            modelo,
            quantidadePares,
            material,
            cortador,
            data,
          } = talao;
          return (
            remessa.toLowerCase().includes(query) ||
            lote.toLowerCase().includes(query) ||
            modelo.toLowerCase().includes(query) ||
            quantidadePares.toString().includes(query) ||
            material.toLowerCase().includes(query) ||
            (cortador && cortador.toLowerCase().includes(query)) ||
            (data && data.toLowerCase().includes(query)) // Adicionada verificação para data
          );
        });
      }
    },
  },
  methods: {
    async fetchTalaoData() {
      try {
        const response = await fetch("http://localhost:3010/talaoget");
        const data = await response.json();
        this.fetchedTaloes = data;
      } catch (error) {
        console.error("Error fetching talao data:", error);
      }
    },

    async deleteTalao(talaoId: string) {
      try {
        const response = await fetch(
          `http://localhost:3010/talaodelete/${talaoId}`,
          { method: "DELETE" }
        );
        const data = await response.json();
        if (response.ok) {
          // Talao removido com sucesso
          console.log(data.message);
          // Atualize a lista de talões após a exclusão
          this.fetchTalaoData();
        } else {
          console.error("Erro ao excluir talao:", data.error);
        }
      } catch (error) {
        console.error("Erro ao excluir talao:", error);
      }
    },

    toggleDropdown(talaoId: string) {
      if (this.activeDropdown === talaoId) {
        this.activeDropdown = null;
      } else {
        this.activeDropdown = talaoId;
      }
    },

    openDeleteConfirmation(talaoId: string) {
      this.talaoToDelete = talaoId;
      this.isDeleteModalOpen = true;
    },

    closeDeleteConfirmation() {
      this.talaoToDelete = null;
      this.isDeleteModalOpen = false;
    },

    deleteTalaoConfirmation() {
      if (this.talaoToDelete) {
        this.deleteTalao(this.talaoToDelete);
        this.closeDeleteConfirmation();
      }
    },

    openEditModal(talao: ITalao) {
      this.editedTalao = { ...talao };
      this.isEditModalOpen = true;
    },

    closeEditModal() {
      this.isEditModalOpen = false;
      this.editedTalao = {
        _id: "",
        remessa: "",
        lote: "",
        modelo: "",
        quantidadePares: 0,
        material: "",
        cortador: "",
      };
    },

    async confirmEditTalao() {
      try {
        const response = await fetch(
          `http://localhost:3010/talaoput/${this.editedTalao._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.editedTalao),
          }
        );
        const data = await response.json();
        if (response.ok) {
          console.log(data.message);
          this.fetchTalaoData();
        } else {
          console.error("Erro ao editar talao:", data.error);
        }
      } catch (error) {
        console.error("Erro ao editar talao:", error);
      }
      this.closeEditModal();
    },
  },
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

.talao-container {
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding: 1.25rem;
}


/* BOTOES */
.detalhes-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.detalhes-button .icon {
  color: #e96d13;
}

.editar-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.editar-button .icon {
  color: #e96d13;
}

.deletar-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.deletar-button .icon {
  color: #e96d13;
}


/* Modal styles */
.modal-card-foot {
  justify-content: flex-end;
}

.modal-card-foot .button {
  margin-left: 0.5rem;
  
}

.is-success {  
  background-color:#e96d13;
}

.modal-card-title {
  color: #e96d13;
  font-weight: bold;
}

.is-danger-modal{
  background-color:#e96d13;
  color: #fff;
}
</style>
