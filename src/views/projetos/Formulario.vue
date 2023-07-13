<template>
  <section >
    <h1>Projetos</h1>
    <form @submit.prevent="salvar">
      <div class="field">
        <lable for="nomeDoProjeto" class="lable"> Nome do Projeto </lable>
        <input
          type="text"
          class="input"
          v-model="nomeDoProjeto"
          id="nomeDoProjeto"
        />
        <div class="field">
          <button class="button" type="submit">Salvar</button>
        </div>
      </div>
    </form>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "@/store";
import { ALTERA_PROJETO, ADICIONA_PROJETO} from "@/store/tipo-mutacoes";
import { TipoNotificacao } from "@/interfaces/INotificação";
import useNotificador from "@/hooks/notificador"


export default defineComponent({
  name: "FormularioVue",
  props: {
    id: {
      type: String
    }
  }, 
  

  mounted () {
    if (this.id) {
      const projeto = this.store.state.projetos.find(proj => proj.id == this.id)
      this.nomeDoProjeto = projeto?.nome || ""
    }

  },
  data() {
    return {
      nomeDoProjeto: "",
    };
  },

  methods: {
    salvar() {
      if (this.id) {
        this.store.commit(ALTERA_PROJETO, {
          id: this.id,
          nome: this.nomeDoProjeto
        })
      } else {
        this.store.commit(ADICIONA_PROJETO, this.nomeDoProjeto);
      }      
      this.nomeDoProjeto = "";
      this.notificar(TipoNotificacao.SUCESSO, "exelente!", "o projeto foi cadastrado com sucesso!")
      this.$router.push("/projetos");
    },
    
  },
  setup() {
    const store = useStore();
    const {notificar} = useNotificador()
    return {
      store,
      notificar
    };
  },
});
</script>

