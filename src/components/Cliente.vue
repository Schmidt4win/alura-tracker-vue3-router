<template>
  <div>
    <div class="search-container">
      <input
        class="input"
        type="text"
        v-model="searchQuery"
        placeholder="Procure pelo nome do cliente"
      />
    </div>
    <div class="client-container">
      <Box v-for="cliente in filteredClientes" :key="cliente._id">
        <div class="columns">
          <div class="column">
            <strong class="label">Nome do Cliente:</strong>
            {{ cliente.nomeCliente }}
          </div>
          <div class="column ">
            <strong class="label">Descrição do serviço:</strong>
           <p class="servico"> {{ cliente.servico }}</p>
          </div>
          <div class="column">
            <strong class="label">Valor: R$:</strong>{{ cliente.valor }}
          </div>
          <button
            class="detalhes-button ml-2 is-danger"
            @click="toggleDropdown(cliente._id)"
          >
            <span class="icon is-small">
              <i class="fa-solid fa-circle-info"></i>
            </span>
          </button>
          <button
            class="editar-button ml-2 is-danger"
            @click="openEditModal(cliente)"
          >
            <span class="icon is-small">
              <i class="fa-regular fa-pen-to-square"></i>
            </span>
          </button>
          <button
            class="deletar-button ml-2 is-danger"
            @click="openDeleteConfirmation(cliente._id)"
          >
            <span class="icon is-small">
              <i class="fas fa-trash"></i>
            </span>
          </button>
        </div>
        <div
          v-if="activeDropdown === cliente._id"
          class="dropdown columns is-30"
        >
          <!-- Dropdown content -->
          <div class="dropdown-content">
            <div class="dropdown-content">
              <div class="table-container">
              <table class="table">
                <tbody>
                <tr>
                  <td>
                    <strong class="label">Cliente:</strong>
                    <Box>{{ cliente.nomeCliente }}</Box>
                  </td>
                  <td>
                    <strong class="label">Serviço:</strong>
                    <Box class=" servico"> {{ cliente.servico }} </Box>
                  </td>
                
                  <td>
                    <strong class="label">Valor:</strong> 
                    <Box>{{ cliente.cidade }}</Box>
                  </td>
                  <td>
                    <strong class="label">Data:</strong> 
                    <Box>{{ cliente.data }}</Box>
                  </td>
                
                  <td>
                    <strong class="label">Cidade:</strong> <Box>
                      {{ cliente.cidade }}
                    </Box>
                  </td>
                  <td></td>
                </tr>
              </tbody>
              </table>
            </div>
            </div>
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
          <p>Deseja excluir este cliente?</p>
        </section>
        <footer class="modal-card-foot">
          <button
            class="button is-danger-modal"
            @click="deleteClienteConfirmation"
          >
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
          <p class="modal-card-title">Editar Cliente:</p>
          <button
            class="delete"
            aria-label="close"
            @click="closeEditModal"
          ></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Nome do Cliente:</label>
            <div class="control">
              <input
                class="input"
                type="text"
                v-model="editedCliente.nomeCliente"
              />
            </div>
          </div>
          <div class="field">
            <label class="label">Descrição do serviço:</label>
            <div class="control">
              <input
                class="input"
                type="text"
                v-model="editedCliente.servico"
              />
            </div>
          </div>
          <div class="field">
            <label class="label">Valor:</label>
            <div class="control">
              <input
                class="input"
                type="number"
                v-model="editedCliente.valor"
              />
            </div>
          </div>
          <div class="field">
            <label class="label">Data:</label>
            <div class="control">
              <input class="input" type="text" v-model="editedCliente.data" />
            </div>
          </div>
          <div class="field">
            <label class="label">Cidade:</label>
            <div class="control">
              <input class="input" type="text" v-model="editedCliente.cidade" />
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success" @click="confirmEditCliente">
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

import ICliente from "../interfaces/ICliente";
import Box from "./Box.vue";
import { TipoNotificacao } from "@/interfaces/INotificação";
import useNotificador from "@/hooks/notificador"
import { useStore } from "@/store";

export default defineComponent({
  name: "ClienteTeste",
  components: {
    Box,
  },
  data() {
    return {
      fetchedClientes: [] as ICliente[],
      activeDropdown: null as string | null,
      searchQuery: "",
      isDeleteModalOpen: false,
      clienteToDelete: null as string | null,
      isEditModalOpen: false,
      editedCliente: {
        _id: "",
        nomeCliente: "",
        servico: "",
        valor: 0,
        data: "",
        cidade: "",
      },
    };
  },
  beforeMount() {
    this.fetchClienteData();
  },
  created() {
    this.fetchClienteData();
  },
  computed: {
    filteredClientes(): ICliente[] {
      if (!this.searchQuery) {
        return this.fetchedClientes;
      } else {
        const query = this.searchQuery.toLowerCase();
        return this.fetchedClientes.filter((cliente: ICliente) => {
          const { nomeCliente, cidade, telefone, servico, valor, data } =
            cliente;
          return (
            nomeCliente.toLowerCase().includes(query) ||
            cidade.toLowerCase().includes(query) ||
            telefone.toLowerCase().includes(query) ||
            servico.toLowerCase().includes(query) ||
            valor.toString().includes(query) ||
            data.toLowerCase().includes(query)
          );
        });
      }
    },
  },
  methods: {
    async fetchClienteData() {
      try {
        const response = await fetch(
          "http://177.136.214.131:3010/cadastroclientesget"
        );
        const data = await response.json();
        console.log(data);
        this.fetchedClientes = data;
      } catch (error) {
        console.error("Error fetching cliente data:", error);
      }
    },
    toggleDropdown(clienteId: string) {
      if (this.activeDropdown === clienteId) {
        this.activeDropdown = null;
      } else {
        this.activeDropdown = clienteId;
      }
    },
    openDeleteConfirmation(clienteId: string) {
      this.clienteToDelete = clienteId;
      this.isDeleteModalOpen = true;
    },
    closeDeleteConfirmation() {
      this.clienteToDelete = null;
      this.isDeleteModalOpen = false;
    },
    async deleteCliente(clienteId: string) {
      try {
        const response = await fetch(
          `http://177.136.214.131:3010/cadastroclientesdelete/${clienteId}`,
          { method: "DELETE" }
        );
        const data = await response.json();
        if (response.ok) {
          console.log(data.message);
          this.fetchClienteData();
        } else {
          console.error("Erro ao excluir cliente:", data.error);
        }
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
      }
    },
    deleteClienteConfirmation() {
      if (this.clienteToDelete) {
        this.deleteCliente(this.clienteToDelete);
        this.closeDeleteConfirmation();
      }
    },
    openEditModal(cliente: ICliente) {
      this.editedCliente = { ...cliente };
      this.isEditModalOpen = true;
    },
    closeEditModal() {
      this.isEditModalOpen = false;
      this.editedCliente = {
        _id: "",
        nomeCliente: "",
        servico: "",
        valor: 0,
        data: "",
        cidade: "",
      };
    },
    async confirmEditCliente() {
      try {
        const response = await fetch(
          `http://177.136.214.131:3010/cadastroclientesput/${this.editedCliente._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.editedCliente),
          }
        );
        const data = await response.json();
        if (response.ok) {
          console.log(data.message);
          this.fetchClienteData();
          this.notificar(TipoNotificacao.SUCESSO, "EXELENTE!", `o cliente ${this.editedCliente.nomeCliente.toLocaleLowerCase()} foi editado com sucesso!`)
        } else {
          console.error("Erro ao editar cliente:", data.error);
        }
      } catch (error) {
        console.error("Erro ao editar cliente:", error);
      }
      this.closeEditModal();
    },
  },
  setup() {
    const store = useStore();
    const {notificar} = useNotificador()
    return {
      store,
      notificar
    };
  },
});
</script>

<style scoped>
.search-container {
  padding: 1.5rem 0;
}

.servico {
  overflow-y: auto;
  max-width: 200px;
  max-height: 65px;
  word-break: break-all
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

.modal-card-title {
  color: #e96d13;
  font-weight: bold;
}

.is-danger-modal {
  background-color: #e96d13;
  color: #fff;
}
</style>
