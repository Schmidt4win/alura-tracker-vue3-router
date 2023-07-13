export enum TipoNotificacao {
    SUCESSO,
    FALHA,
    ATENCAO
}




export interface INotificação {
    titulo: string
    texto: string
    tipo: TipoNotificacao
    id: number
}