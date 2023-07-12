<template>
    <div class="container">
      <h1>Talão Estatísticas</h1>
      <div class="field">
        <label class="label">Filtrar por Cortador:</label>
        <div class="control">
          <input class="input" type="text" v-model="cortadorFiltro" placeholder="Digite o nome do cortador">
        </div>
      </div>
      <div class="field">
        <label class="label">Quantidade de dias:</label>
        <div class="control">
          <input class="input" type="number" v-model.number="quantidadeDias" min="1" max="30">
        </div>
      </div>
      <button class="button is-primary" @click="filtrarDados">Filtrar</button>
      <div v-if="dadosFiltrados.length > 0">
        <h2>Estatísticas</h2>
        <p>Quantidade de pares feitos pelo cortador {{ cortadorFiltro }} nos últimos {{ quantidadeDias }} dias: {{ quantidadePares }}</p>
      </div>
  
      <div v-if="dadosFiltrados.length > 0">
        <h2>Dados Filtrados</h2>
        <box v-for="talao in dadosFiltrados" :key="talao._id">
          <p>Remessa: {{ talao.remessa }}</p>
          <p>Lote: {{ talao.lote }}</p>
          <p>Modelo: {{ talao.modelo }}</p>
          <p>Quantidade de Pares: {{ talao.quantidadePares }}</p>
          <p>Material: {{ talao.material }}</p>
          <p>Cortador: {{ talao.cortador }}</p>
          <p>Data: {{ talao.data }}</p>
          <p>Data e Hora: {{ talao.data_hora }}</p>
        </box>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import ITalao from "../interfaces/ITalao";
  import Box from "./Box.vue";
  
  export default defineComponent({
    components: {
      Box,
    },
    data() {
      return {
        cortadorFiltro: '',
        quantidadeDias: 30,
        dados: [] as ITalao[],
        dadosFiltrados: [] as ITalao[],
        quantidadePares: 0,
      };
    },
  
    mounted() {
      this.carregarDados();
    },
  
    methods: {
      async carregarDados() {
        try {
          const response = await fetch('http://localhost:3010/talaoget');
          this.dados = await response.json();
        } catch (error) {
          console.error('Erro ao carregar os dados:', error);
        }
      },
  
      filtrarDados() {
        const hoje = new Date();
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - this.quantidadeDias);
  
        this.dadosFiltrados = this.dados.filter((talao) => {
          const dataTalao = new Date(talao.data);
          return (
            talao.cortador === this.cortadorFiltro &&
            dataTalao >= dataLimite &&
            dataTalao <= hoje
          );
        });
  
        this.quantidadePares = this.dadosFiltrados.reduce((total, talao) => {
          return total + talao.quantidadePares;
        }, 0);
      },
    },
  });
  </script>
  
  <style scoped>
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .label {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .button {
    margin-top: 10px;
  }
  </style>
  