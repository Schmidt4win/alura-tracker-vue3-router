import IProjeto from "@/interfaces/IProjeto";
import { createStore, Store, useStore as vuexUseStore } from "vuex";
import { InjectionKey } from "vue";
import { ADICIONA_PROJETO, ALTERA_PROJETO, EXCLUIR_PROJETO, NOTIFICAR, PUT_STATE_CLIENTE } from "./tipo-mutacoes";
import { INotificação, } from "@/interfaces/INotificação";
import {GET_CLIENTES} from "./tipo-acoes"
import http from "@/http"
import ICliente from "@/interfaces/ICliente";


interface Estado {
    projetos: IProjeto[],
    notificacoes: INotificação[],
    clientes: ICliente[]
}

export const key: InjectionKey<Estado> = Symbol()

export const store = createStore<Estado>({
    state: {
        projetos: [
            
        ],
        notificacoes: [
            
        ],
        clientes: [
            
        ]
    },
    mutations:
    {
        [ADICIONA_PROJETO](state, nomeDoProjeto: string) {
            const projeto = {
                id: new Date().toISOString(),
                nome: nomeDoProjeto
            } as IProjeto
            state.projetos.push(projeto)
        },
        [ALTERA_PROJETO](state, projeto: IProjeto) {
            const index = state.projetos.findIndex(proj => proj.id== projeto.id)
            state.projetos[index] = projeto
        },
        [EXCLUIR_PROJETO](state, id: string) {
            state.projetos = state.projetos.filter(proj => proj.id != id)
        },
        [PUT_STATE_CLIENTE](state, clientes: ICliente[]) {
            state.clientes = clientes
        },
        [NOTIFICAR](state, novaNotificação: INotificação) {
            novaNotificação.id = new Date().getTime()
            state.notificacoes.push(novaNotificação)
            setTimeout(() => {
                state.notificacoes = state.notificacoes.filter(notificacao => notificacao.id != novaNotificação.id)
            }, 3000)
        }

    },
    actions: {
        [GET_CLIENTES] ({commit}) {
            http.get('cadastroclientesget')
            .then(resposta => commit(PUT_STATE_CLIENTE, resposta.data))
        }
    }
})

export function useStore(): Store<Estado> {
    return vuexUseStore(key);
  }