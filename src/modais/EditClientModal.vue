
<template>
    <div class="modal" :class="{ 'is-active': isOpen }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Editar Cliente:</p>
          <button class="delete" aria-label="close" @click="onCancel"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Nome do Cliente:</label>
            <div class="control">
              <input class="input" type="text" v-model="editedCliente.nomeCliente" />
            </div>
          </div>
          <div class="field">
            <label class="label">Descrição do serviço:</label>
            <div class="control">
              <input class="input" type="text" v-model="editedCliente.servico" />
            </div>
          </div>
          <div class="field">
            <label class="label">Valor:</label>
            <div class="control">
              <input class="input" type="number" v-model="editedCliente.valor" />
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
          <button class="button is-success" @click="onConfirm">Confirmar</button>
          <button class="button" @click="onCancel">Cancelar</button>
        </footer>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, PropType, ref } from 'vue';
  import ICliente from '../interfaces/ICliente';
  
  export default defineComponent({
    name: 'ModalEdit',
    props: {
      isOpen: {
        type: Boolean as PropType<boolean>,
        required: true,
      },
      cliente: {
        type: Object as PropType<ICliente>,
        required: true,
      },
      onConfirm: {
        type: Function as PropType<() => void>,
        required: true,
      },
      onCancel: {
        type: Function as PropType<() => void>,
        required: true,
      },
    },
    setup(props) {
      const editedCliente = ref({ ...props.cliente });
  
      const confirmEditCliente = () => {
        props.onConfirm();
      };
  
      const closeEditModal = () => {
        props.onCancel();
      };
  
      return {
        editedCliente,
        confirmEditCliente,
        closeEditModal,
      };
    },
  });
  </script>
  
  <style scoped>
  /* Estilos do modal de edição do cliente */
  </style>
  