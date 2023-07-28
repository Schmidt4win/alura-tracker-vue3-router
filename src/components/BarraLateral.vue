<template>
  <header class="conter">
    <div>
      <img class="logo-container" src="../assets/logo.jpg" alt="">
    </div>
    <button class="button" :class="{ 'is-dark': modoEscuroAtivo }" @click="alterarTema">
      {{ textoBotao }}
    </button>
    <nav class="panel mt-5">
      <ul>
        <!-- <li>
          <RouterLink to="/tarefas" class="link">
            <i class="fas fa-tasks"></i> Tarefas
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/projetos" class="link">
            <i class="fas fa-project-diagram"></i> Projetos
          </RouterLink>
        </li> -->
        <li>
          <RouterLink to="/liberarclientes" class="link">
            <i class="fas fa-users"></i> Clientes por OLT e PON
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/pononu" class="link">
            <i class="fas fa-users"></i> Clientes por OLT e PON
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/ponsignal" class="link">
            <i class="fa-solid fa-signal"></i> Sinal por Ramal
          </RouterLink>
        </li>
         <li>
          <RouterLink to="/onulist" class="link">
            <i class="fa-solid fa-screwdriver-wrench"></i> Todos os clientes
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/ramal" class="link">
            <i class="fa-solid fa-gear"></i> Liberar Clientes
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/onulog" class="link">
            <i class="fa-solid fa-list"></i> Logs de cadastro
          </RouterLink>
        </li>
        <!-- <li>
          <RouterLink to="/talao" class="link">
            <i class="fas fa-pen"></i> Cadastro de Talao
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/talaolista" class="link">
            <i class="fas fa-pen"></i> Lista De Talões
          </RouterLink>
        </li> -->
        
      </ul>
      
    </nav>
    <button class="button logout-button" @click="logout">
      <i class="fas fa-sign-out-alt"></i> Logout
    </button>
  </header>
</template>
 
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BarraLateral',
  emits: ['aoTemaAlterado'],
  data () {
    return {
      modoEscuroAtivo: true
    }
  },
  computed: {
    textoBotao () {
      if (this.modoEscuroAtivo) {
        return "Desativar modo escuro"
      }
      return "Ativar Modo Escuro"
    }
  },
  methods: {
    alterarTema() {
      this.modoEscuroAtivo = !this.modoEscuroAtivo
      this.$emit('aoTemaAlterado', this.modoEscuroAtivo)
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
header {
  padding: 1rem;
  background: #ff811a;
  width: 100%;
  height: 100vh;
  text-align: center;
}

header {
  padding: 1rem;
  background:  rgb(12, 1, 73);
  text-align: center;
}

@media only screen and (max-width: 768px) {
  header {
    padding: 2.5rem;
    height: auto;
  }
}

/* Estilos para dispositivos móveis */
@media only screen and (max-width: 480px) {
  header {
    padding: 1rem;
  }
   .button {
    font-size: 0.8rem;
  }

  .panel {
    margin-top: 0.5rem;
  }

  .link {
    font-size: 0.9rem;
  }

  .logout-button {
    margin-top: 0.5rem;
  }
}

.social-buttons {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.logo-container {
   
   margin-bottom: 1.5rem;
   padding: 1.50rem;
   border-radius: 50%;
   max-width: 300px;
   max-height: 300px;
   background-color: aliceblue;
   }
.social-buttons {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.social-button {
  display: inline-block;
  margin: 0 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  text-align: center;
  text-decoration: none;
  color: white;
  background-color: #722024;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.social-button:hover {
  background-color: #e96d13;
}

.panel li {
  margin: 8px 0;
}

.link {
  color: #fff;
  display: block; /* Adicionado para que os itens sejam exibidos como blocos */
  text-align: left; /* Alinha o texto à esquerda */
}

.link:hover {
  color: #faf0ca;
}

.link.router-link-active {
  color: #faf0ca;
}

.logout-button {
  margin-top: 1rem;
  background-color: #ff261b;
  color: #fff;
}

.logout-button:hover {
  background-color: #e96d13;
  color: #faf0ca;
}

.conter {
    
    max-height: 100%;
  }
</style>
