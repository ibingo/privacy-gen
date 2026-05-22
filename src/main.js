import { createApp } from 'vue'
import 'tdesign-vue-next/es/style/index.css'
import '@tdesign-vue-next/chat/es/style/index.css'
import 'tdesign-mobile-vue/es/style/index.css'
import App from './App.vue'
import router from './router'
import './style.css'

createApp(App).use(router).mount('#app')
