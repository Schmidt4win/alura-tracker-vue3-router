<template>
  <div class="box formulario">
    <div class="columns">
      <div
        class="column is-5"
        role="form"
        aria-label="Formulário para criação de uma nova tarefa"
      >
        <input
          type="text"
          class="input"
          placeholder="Já pensou em ler algo novo hoje?"
          v-model="descricao"
        />
      </div>
      <div class="column is-3">
        <div class="select">
          <select v-model="idProjeto">
            <option value="">Selecione o projeto</option>
            <option
              :value="projeto.id"
              v-for="projeto in projetos"
              :key="projeto.id"
            >
              {{ projeto.nome }}
            </option>
          </select>
        </div>
      </div>
      <div class="column">
        <TemporizadorTeste @aoTemporizadorFinalizado="finalizarTarefa" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import TemporizadorTeste from "./Temporizador.vue";
import { useStore } from "vuex";
import { key } from "../store"

export default defineComponent({
  name: "FormulárioTeste",
  emits: ["aoSalvarTarefa"],
  components: {
    TemporizadorTeste,
  },
  data() {
    return {
      descricao: "",
      idProjeto: "",
        };
  },
  methods: {
    finalizarTarefa(tempoDecorrido: number): void {
      this.$emit("aoSalvarTarefa", {
        duracaoEmSegundos: tempoDecorrido,
        descricao: this.descricao,
        projeto: this.projetos.find((proj: { id: string }) => proj.id === this.idProjeto)
      });
      this.descricao = "";
    },
  },

  setup () {
    const store = useStore(key)
    return {
      projetos: computed(() => store.state.projetos)
    }
  }

});
</script>

<style scoped>
.formulario {
  color: var(--texto-primario);
  background-color: var(--bg-primario);
}
</style>
