<template>
  <section>
    <router-link to="/projetos/novo" class="button">
      <span class="icon is-small">
        <i class="fas fa-plus"></i>
      </span>
      <span>Novo projeto</span>
    </router-link>
    <table class="table is-fullwidth">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cliente in clientes" :key="cliente._id">
          <td>{{ cliente._id }}</td>
          <td>{{ cliente.nomeCliente }}</td>
          <td>
            <router-link :to="`/projetos/${cliente._id}`" class="button">
              <span class="icon is-small">
                <i class="fas fa-pencil-alt"></i>
              </span>
            </router-link>
            <button class="button ml-2 is-danger" @click="excluir(cliente._id)">
              <span class="icon is-small">
                <i class="fas fa-trash"></i>
              </span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "@/store";
import { EXCLUIR_PROJETO } from "@/store/tipo-mutacoes";
import { GET_CLIENTES } from "@/store/tipo-acoes";

export default defineComponent({
  name: "ListaTeste",
  methods: {
    excluir(id: string) {
        this.store.commit(EXCLUIR_PROJETO, id)
    } 
  },
  setup() {
    const store = useStore();
    store.dispatch(GET_CLIENTES)
    return {
      clientes: computed(() => store.state.clientes),
      store
    };
  },
});
</script>
