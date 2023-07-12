<template>
  <div class="modal" :class="{ 'is-active': isOpen }">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Confirmação de exclusão</p>
        <button class="delete" aria-label="close" @click="onCancel"></button>
      </header>
      <section class="modal-card-body">
        <p>Deseja excluir este cliente?</p>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-danger-modal" @click="onDeleteConfirmation">Sim</button>
        <button class="button" @click="onCancel">Não</button>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'ModalDelete',
  props: {
    isOpen: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    onDeleteConfirmation: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onCancel: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
});
</script>

<style scoped>
/* Estilos do modal de confirmação de exclusão */
</style>
