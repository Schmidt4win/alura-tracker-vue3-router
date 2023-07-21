import axios, {AxiosInstance} from "axios";

const clienteHttp: AxiosInstance = axios.create({
    baseURL: "http://177.136.214.131:3010/",
})

export default clienteHttp;