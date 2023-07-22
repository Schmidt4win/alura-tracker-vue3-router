import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

import Tarefas from "../views/Tarefas.vue";
import Projetos from "../views/Projetos.vue";
import HomeView from "../views/HomeView.vue"
import ServiceForm from "../views/ServiceForm.vue";
import Login from "../views/Login.vue";
import Cliente from "../components/Cliente.vue";
import Ramal from "../components/Ramal.vue";
import TalaoForm from "@/views/TalaoForm.vue"
import TalaoLista from "@/components/TalaoLista.vue"



import Formulario from "../views/projetos/Formulario.vue"
import Lista from "../views/projetos/Lista.vue"


const rotas: RouteRecordRaw[] = [

  {
    path: "/",
    name: "Home",
    component: HomeView,
    redirect: '/cliente',
    children:
      [
        {
          path: "/",
          name: "Liberar",
          component: Ramal,
        },
      {
        path: "/cliente",
        name: "Cliente",
        component: Cliente,
      },
      {
        path: "/serviço",
        name: "Serviço",
        component: ServiceForm,
      },
      {
        path: "/tarefas",
        name: "Tarefas",
        component: Tarefas,
      },
      {
        path: "/projetos",
        name: "Projetos",
        component: Projetos,
        children: [
          {
            path: "",
            name: "Projetos",
            component: Lista
          },
          {
            path: "novo",
            name: "Novo Projeto",
            component: Formulario,
          },
          {
            path: ":id",
            name: "Editar Projeto",
            component: Formulario,
            props: true
          },
        ]
      },
      {
        path: "/ramal",
        name: "Ramal",
        component: Ramal,
      },
      {
        path: "/talao",
        name: "Talao",
        component: TalaoForm,
      },
      {
        path: "/talaolista",
        name: "Lista de Talões",
        component: TalaoLista,
      },
      
      ]
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },

];

const roteador = createRouter({
  history: createWebHashHistory(),
  routes: rotas,
});

// Add beforeEach navigation guard
roteador.beforeEach((to, from, next) => {
  const authData = localStorage.getItem('authData');
  if (to.name !== 'Login' && (!authData || isTokenExpired(authData))) {
    next('/login');
  } else {
    next();
  }
});

function isTokenExpired(authData: string | null): boolean {
  if (authData) {
    const { expiration } = JSON.parse(authData);
    return new Date().getTime() > expiration;
  }
  return true;
}

export default roteador;
