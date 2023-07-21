<template>
  <main class="columns is-gapless is-multiline" :class="{ 'modo-escuro': modoEscuroAtivo }">
    <div class="column is-one-quarter">
      <template v-if="isMobile">
        <BarraLateralMobile @aoTemaAlterado="trocarTema" />
      </template>
      <template v-else>
        <BarraLateral @aoTemaAlterado="trocarTema" />
      </template>
    </div>
    <div class="column is-three-quarter conteudo">
      <NotificaçõesVue />
      <RouterView></RouterView>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import BarraLateralMobile from "../components/BarraLateralMobile.vue"
import BarraLateral from "../components/BarraLateral.vue"
import NotificaçõesVue from '@/components/Notificações.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    BarraLateralMobile,
    BarraLateral,
    NotificaçõesVue
  },
  data() {
    return {
      modoEscuroAtivo: true
    }
  },
  computed: {
    isMobile() {
      return window.innerWidth <= 768; // Altere o valor conforme sua necessidade
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
}
</style>
