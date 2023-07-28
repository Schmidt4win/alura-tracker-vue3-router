<template>
    <div class="modal" :class="{ 'is-active': showModal }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Detalhes da ONU</p>
          <button class="delete" aria-label="close" @click="closeModal"></button>
        </header>
        <section class="modal-card-body">
          <div v-if="selectedOnu">
            
            <p><strong>Serial:</strong> {{ selectedOnu.Serial }}</p>
            <p><strong>Alias:</strong> {{ selectedOnu.Alias || "SEM-NOME"}}</p>
            <p><strong>Model:</strong> {{ selectedOnu.Model }}</p>
            <p><strong>Status:</strong> {{ selectedOnu.Status }}</p>
            <p><strong>Power Level:</strong> {{ selectedOnu['Power Level'] }}</p>
            <p><strong>RSSI:</strong> {{ selectedOnu.RSSI }}</p>
            <p><strong>Distance:</strong> {{ selectedOnu.Distance }}</p>
            <p><strong>Firmware Version:</strong> {{ selectedOnu['Firmware Version'] }}</p>
            <p><strong>Last Update:</strong> {{ selectedOnu['Last Update'] }}</p>            
           </div>
        </section>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, Prop, ref } from 'vue';
  import IOnuDataResponse from '@/interfaces/IOnuDataResponse';
  
  export default defineComponent({
    props: {
      showModal: Boolean,
      selectedOnu: {
        type: Object as () => IOnuDataResponse,
        default: null,
      },
    },
    methods: {
      closeModal() {
        this.$emit('close');
      },
    },
  });
  </script>
  
  <style>
  /* Modal styles go here */
  </style>
  