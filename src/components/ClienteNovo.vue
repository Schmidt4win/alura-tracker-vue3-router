<template>
    <div>
      <div class="search-container">
        <input class="input" type="text" v-model="searchQuery" placeholder="Procure pelo nome do cliente" />
      </div>
      <div class="client-container">
        <Box v-for="cliente in filteredClientes" :key="cliente._id">
          <div class="columns">
            <div class="column">
              <strong class="label">Nome do Cliente:</strong> {{ cliente.nomeCliente }}
            </div>
            <div class="column">
              <strong class="label">Descrição do serviço:</strong>  {{ cliente.servico }}
            </div>
            <div class="column">
              <strong class="label">Valor: R$:</strong>{{ cliente.valor }}
            </div>
            <button class="detalhes-button ml-2 is-danger" @click="toggleDropdown(cliente._id)">
              <span class="icon is-small">
                <i class="fa-solid fa-circle-info"></i>
              </span>
            </button>
            <button class="editar-button ml-2 is-danger" @click="openEditModal(cliente)">
              <span class="icon is-small">
                <i class="fa-regular fa-pen-to-square"></i>
              </span>
            </button>
            <button class="deletar-button ml-2 is-danger" @click="openDeleteConfirmation(cliente._id)">
              <span class="icon is-small">
                <i class="fas fa-trash"></i>
              </span>
            </button>
          </div>
          <div v-if="activeDropdown === cliente._id" class="dropdown columns is-30">
            <!-- Dropdown content -->
            <div class="dropdown-content">
              <table class="table">
                <tr>
                  <td><strong class="label">Cliente:</strong></td>
                  <td>{{ cliente.nomeCliente }}</td>
                </tr>
                <tr>
                  <td><strong class="label">Serviço:</strong></td>
                  <td>{{ cliente.servico }}</td>
                </tr>
                <tr>
                  <td><strong class="label">Valor:</strong></td>
                  <td>{{ cliente.valor }}</td>
                </tr>
                <tr>
                  <td><strong class="label">Data:</strong></td>
                  <td>{{ cliente.data }}</td>
                </tr>
                <tr>
                  <td><strong class="label">Cidade:</strong></td>
                  <td>{{ cliente.cidade }}</td>
                </tr>
              </table>
            </div>
          </div>
        </Box>
      </div>
  
      <ModalDeleteConfirmation
        :isOpen="isDeleteModalOpen"
        :onDeleteConfirmation="deleteClienteConfirmation"
        :onCancel="closeDeleteConfirmation"
      />
  
      <ModalEditCliente
        :isOpen="isEditModalOpen"
        :cliente="editedCliente"
        :onConfirm="confirmEditCliente"
        :onCancel="closeEditModal"
      />
    </div>
  </template>
  
  
<script lang="ts">
import { defineComponent, computed } from 'vue';

import ICliente from '../interfaces/ICliente';
import Box from './Box.vue';
import ModalDeleteConfirmation from '../modais/DeleteClientModal.vue';
import ModalEditCliente from '../modais/EditClientModal.vue';
import ClienteApi from "../mixins/ClienteApi";

export default defineComponent({
  name: 'ClienteTeste',
  components: {
    Box,
    ModalDeleteConfirmation,
    ModalEditCliente,
  },
  data() {
    return {
      fetchedClientes: [] as ICliente[],
      activeDropdown: null as string | null,
      searchQuery: '',
      isDeleteModalOpen: false,
      clienteToDelete: null as string | null,
      isEditModalOpen: false,
      editedCliente: {
        _id: '',
        nomeCliente: '',
        servico: '',
        valor: 0,
        data: '',
        cidade: '',
        telefone: '',
        data_hora: '',
      } as ICliente,
      clienteApi: new ClienteApi(),
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
            const { nomeCliente, cidade, servico, valor, data } = cliente;
            return (
              nomeCliente.toLowerCase().includes(query) ||
              cidade.toLowerCase().includes(query) ||
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
          this.fetchedClientes = await this.clienteApi.fetchClienteData();
        } catch (error) {
          console.error('Error fetching cliente data:', error);
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
          await this.clienteApi.deleteCliente(clienteId);
          console.log('Cliente excluído com sucesso');
          this.fetchClienteData();
        } catch (error) {
          console.error('Erro ao excluir cliente:', error);
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
          _id: '',
          nomeCliente: '',
          servico: '',
          valor: 0,
          data: '',
          cidade: '',
          telefone: '',
          data_hora: '',
          };
      },
      async confirmEditCliente() {
        try {
          await this.clienteApi.updateCliente(this.editedCliente);
          console.log('Cliente atualizado com sucesso');
          this.fetchClienteData();
        } catch (error) {
          console.error('Erro ao editar cliente:', error);
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