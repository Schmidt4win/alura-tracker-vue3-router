import { createApp } from 'vue';
import App from './App.vue';
import '@fortawesome/fontawesome-free/css/all.css';
import roteador from './roteador';
import { key, store } from './store';
import { createPinia } from 'pinia';


const pinia = createPinia()
const app = createApp(App);
app.use(roteador)
app.use(pinia)
app.use(store, key)
app.mount('#app');
