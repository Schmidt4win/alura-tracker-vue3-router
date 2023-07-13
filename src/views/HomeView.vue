<template>
  <main class="columns is-gapless is-multiline" :class="{ 'modo-escuro': modoEscuroAtivo }">
    <div class="column is-one-quarter">
      <BarraLateral @aoTemaAlterado="trocarTema" />

    </div>
    <div class="column is-three-quarter conteudo">
      <NotificaçõesVue />
      <RouterView></RouterView>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BarraLateral from "../components/BarraLateral.vue"
import NotificaçõesVue from '@/components/Notificações.vue';

// import ServiceForm from './components/ServiceForm.vue';
// import ClientsDashboard from './components/ClientsDashboard.vue';


export default defineComponent({
  name: 'HomeView',
  components: {
    BarraLateral,
    NotificaçõesVue
},
  data() {
    return {
      modoEscuroAtivo: false
    }
  },


  methods: {

    trocarTema(modoEscuroAtivo: boolean) {
      this.modoEscuroAtivo = modoEscuroAtivo
    }
  }
});
</script>

<style>
.lista {
  padding: 1.25rem;
}

main {
  --bg-primario: #fff;
  --texto-primario: #000;
}

main.modo-escuro {
  --bg-primario: #496678;
  --texto-primario: #ddd;
}

.conteudo {
  background-color: var(--bg-primario)
}</style>
