<template>
    <div class="box has-text-weight-bold" >
      <slot></slot>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: "BoxTeste",
    data() {
      return {
        estilos: {
          backgroundColor: "background:  darkblue"
        }
      };
    }
  });
  </script>

  <style scoped>
  .box{
    background-color: aliceblue;
  }

   </style>
  