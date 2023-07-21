<template>
  <main :class="{ 'modo-escuro': modoEscuroAtivo }">
     <div >
      <RouterView></RouterView>
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';






export default defineComponent({
  name: 'App',
 
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
  --bg-primario: #2b2d42;
  --texto-primario: #ddd;
}

.conteudo {
  background-color: var(--bg-primario)
}</style>
