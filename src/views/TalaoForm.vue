<template>
    <div>
      <section class="section">
        <div class="container">
          <h1 class="title has-text-centered mb-5">Cadastro de Talao</h1>
          <form @submit.prevent="submitForm">
            <div class="columns">
              <div class="column">
                <div class="field">
                  <label for="remessa" class="label">Remessa:</label>
                  <div class="control">
                    <input type="text" class="input" v-model="remessa" required>
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label for="lote" class="label">Lote:</label>
                  <div class="control">
                    <input type="text" class="input" v-model="lote" required>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="columns">
              <div class="column">
                <div class="field">
                  <label for="modelo" class="label">Modelo:</label>
                  <div class="control">
                    <input type="text" class="input" v-model="modelo" required>
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label for="quantidadePares" class="label">Quantidade de Pares:</label>
                  <div class="control">
                    <input type="number" class="input" v-model="quantidadePares" required>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="columns">
              <div class="column">
                <div class="field">
                  <label for="material" class="label">Material:</label>
                  <div class="control">
                    <input type="text" class="input" v-model="material" required>
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label for="cortador" class="label">Cortador:</label>
                  <div class="control">
                    <input type="text" class="input" v-model="cortador" required>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="field is-grouped is-grouped-centered">
              <div class="control has-text-centered">
                <button type="submit" class="button is-primary">Enviar</button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import ITalao from "../interfaces/ITalao";
  
  export default defineComponent({
    data() {
      return {
        remessa: '',
        lote: '',
        modelo: '',
        quantidadePares: 0,
        material: '',
        cortador: '',
      };
    },
    methods: {
      submitForm(): void {
        const data = {
          remessa: this.remessa,
          lote: this.lote,
          modelo: this.modelo,
          quantidadePares: this.quantidadePares,
          material: this.material,
          cortador: this.cortador,
          data: new Date().toLocaleDateString('pt-BR'), // Data no formato brasileiro, exemplo: 10/07/2023
          data_hora: new Date().toLocaleString('pt-BR'), // Data e hora no formato brasileiro
        };
  
        console.log(data);
  
        fetch('http://localhost:3010/cadastrotalaopost', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
          .then(response => response.json())
          .then(data => {
            console.log('Dados enviados com sucesso:', data);
            // Realizar ações adicionais, se necessário
            this.resetForm();
          })
          .catch(error => {
            console.error('Erro ao enviar os dados:', error);
            // Lidar com o erro adequadamente
          });
      },
      resetForm(): void {
        this.remessa = '';
        this.lote = '';
        this.modelo = '';
        this.quantidadePares = 0;
        this.material = '';
        this.cortador = '';
      }
    }
  });
  </script>
  
  <style scoped>
  .container {
    max-width: 500px;
    margin: 60px auto;
    padding: 40px;
    background-color: #ffffff;
    border-radius: 10px;
  }  
      
  .title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  .label {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 5px;
  }
  
  .input {
    width: 100%;
    height: 40px;
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .button {
    display: block;
    width: 100%;
    height: 40px;
    padding: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    background-color: #e96d13;
    border: none;
    border-radius: 20px;
    transition: background-color 0.3s ease;
    margin-top: 10px;
  }
  
  .button:hover {
    background-color: #0056b3;
  }
  
  @media screen and (max-width: 400px) {
    .container {
      width: 100%;
      margin: 0;
      border-radius: 0;
      box-shadow: none;
      padding: 20px;
    }
  }
  
  .columns {
    margin-bottom: 1rem;
  }
  
  @media screen and (max-width: 768px) {
    .columns {
      flex-direction: column;
    }
  }
  </style>
  