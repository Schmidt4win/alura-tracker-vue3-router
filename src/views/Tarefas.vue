<template>
        
        <Formulario @aoSalvarTarefa="salvarTarefa"/>
  
        <div class="lista">
          <Tarefa v-for="(tarefa, index) in tarefas" :key="index" :tarefa="tarefa"/>
          <Box v-if="listaEstaVazia">
            You have no enemies.
          </Box>  
        </div>
          
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  import Formulario from "../components/Formulario.vue"
  import Tarefa from '../components/Tarefa.vue';
  import ITarefa from "../interfaces/ITarefa"
  import Box from '../components/Box.vue';
  // import ServiceForm from './components/ServiceForm.vue';
  // import ClientsDashboard from './components/ClientsDashboard.vue';
  
  
  export default defineComponent({
    name: 'App',
    components: {
      Formulario,
      Tarefa,
      Box
  },
    data () {
      return {
        tarefas: [] as ITarefa[],
        }
    },
    computed: {
      listaEstaVazia (): boolean {
        return this.tarefas.length === 0
      }
    },
    methods: {
      salvarTarefa(tarefa: ITarefa) {
        this.tarefas.push(tarefa)
        
      },
     
    }
    });
  </script>
  
  