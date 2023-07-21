<template>
    <header class="has-background-info">
      <div class="container">
        <div class="columns is-vcentered">
          <div class="column">
            <h1 class="title is-4">
              <img src="../assets/logo.jpg" alt="">
            </h1>
          </div>
          <div class="column is-narrow">
            <button class="button is-dark" :class="{ 'is-active': menuAberto }" @click="toggleMenu">
              <span class="icon is-small">
                <i class="fas fa-bars"></i>
              </span>
            </button>
          </div>
        </div>
      </div>
      <nav class="navbar mt-5" :class="{ 'is-active': menuAberto }">
        <div class="navbar-menu">
          <div class="navbar-start">
            <RouterLink to="/tarefas" class="navbar-item">
              <span class="icon">
                <i class="fas fa-tasks"></i>
              </span>
              <span>Tarefas</span>
            </RouterLink>
            <RouterLink to="/projetos" class="navbar-item">
              <span class="icon">
                <i class="fas fa-project-diagram"></i>
              </span>
              <span>Projetos</span>
            </RouterLink>
            <RouterLink to="/serviço" class="navbar-item">
              <span class="icon">
                <i class="fas fa-pen"></i>
              </span>
              <span>Cadastro de Serviço</span>
            </RouterLink>
            <RouterLink to="/cliente" class="navbar-item">
              <span class="icon">
                <i class="fas fa-users"></i>
              </span>
              <span>Cliente</span>
            </RouterLink>
            <RouterLink to="/ramal" class="navbar-item">
              <span class="icon">
                <i class="fas fa-users"></i>
              </span>
              <span>Ramal</span>
            </RouterLink>
            <RouterLink to="/talao" class="navbar-item">
              <span class="icon">
                <i class="fas fa-pen"></i>
              </span>
              <span>Cadastro de Talao</span>
            </RouterLink>
            <RouterLink to="/talaolista" class="navbar-item">
              <span class="icon">
                <i class="fas fa-pen"></i>
              </span>
              <span>Lista De Talões</span>
            </RouterLink>
          </div>
          <div class="navbar-end">
            <button class="button is-danger" @click="logout">
              <span class="icon">
                <i class="fas fa-sign-out-alt"></i>
              </span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'BarraLateralMobile',
    emits: ['aoTemaAlterado'],
    data() {
      return {
        modoEscuroAtivo: false,
        menuAberto: false
      };
    },
    computed: {
      textoBotao() {
        if (this.modoEscuroAtivo) {
          return "Desativar modo escuro";
        }
        return "Ativar Modo Escuro";
      }
    },
    methods: {
      alterarTema() {
        this.modoEscuroAtivo = !this.modoEscuroAtivo;
        this.$emit('aoTemaAlterado', this.modoEscuroAtivo);
      },
      toggleMenu() {
        this.menuAberto = !this.menuAberto;
      },
      logout() {
        // Limpar os dados de autenticação do local storage
        localStorage.removeItem('authData');
        // Redirecionar para a tela de login ou outra rota desejada
        this.$router.push('/login');
      }
    }
  });
  </script>
  
  <style scoped>
  .header {
    padding: 1rem;
  }
  
  .navbar-burger {
    color: #fff;
  }
  
  .navbar-menu {
    background-color: #496678;
  }
  
  .navbar-start .navbar-item,
  .navbar-end .navbar-item {
    color: #fff;
    padding: 0.5rem;
  }
  
  .navbar-start .navbar-item:hover,
  .navbar-end .navbar-item:hover {
    background-color: #0a537b;
  }
  
  .navbar-item .icon {
    margin-right: 0.5rem;
  }
  
  .logout-button {
    margin-top: 1rem;
  }
  </style>
  