import { createApp } from 'vue'
import App from './App.vue'
import '@arco-design/web-vue/dist/arco.css'
import ArcoVue from '@arco-design/web-vue'
import { createPinia } from 'pinia'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(ArcoVue)
app.use(pinia)
app.use(router)

app.mount('#app')
