import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

import Tarefas from "../views/Tarefas.vue";
import Projetos from "../views/Projetos.vue";
import HomeView from "../views/HomeView.vue"
import ServiceForm from "../views/ServiceForm.vue";
import Login from "../views/Login.vue";
import OnuList from "../components/OnuList.vue";
import Ramal from "../components/Ramal.vue";
import TalaoForm from "@/views/TalaoForm.vue"
import TalaoLista from "@/components/TalaoLista.vue"
import PonSignal from "@/components/PonSignal.vue"
import PonOnu from "@/components/PonOnu.vue"
import OnuLog from "@/components/OnuLog.vue"
import LiberarCliente from "@/components/LiberarClientes.vue"
import ListaData from "@/components/ListaData.vue"
import TabelaPon from "@/components/TabelaPon.vue"



import Formulario from "../views/projetos/Formulario.vue"
import Lista from "../views/projetos/Lista.vue"


const rotas: RouteRecordRaw[] = [

  {
    path: "/",
    name: "Home",
    component: HomeView,
    redirect: '/liberarclientes',
    children:
      [
        {
          path: "/",
          name: "liberarclientes",
          component: LiberarCliente,
        },
      {
        path: "/onulist",
        name: "OnuList",
        component: OnuList,
      },
      {
        path: "/ponsignal",
        name: "Sinal do ramal",
        component: PonSignal,
      },
      {
        path: "/pononu",
        name: "Verificar Olt Nomes",
        component: PonOnu,
      },
      {
        path: "/onulog",
        name: "Onu Log",
        component: OnuLog,       
      },
      {
        path: "/listadata",
        name: "ListaData",
        component: ListaData,
      },
      {
        path: "/liberarclientes",
        name: "Liberar Clients",
        component: LiberarCliente,
      },
      {
        path: "/tabelapon",
        name: "Tabela Pon",
        component: TabelaPon,
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
