import './main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 1. Cài đặt các plugin trước
app.use(createPinia())
app.use(router)

// 2. Sau đó mới mount ứng dụng
app.mount('#app')
