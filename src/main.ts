import './main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n' // Import cấu hình i18n

const app = createApp(App)

// 1. Cài đặt các plugin trước
app.use(createPinia())
app.use(router)
app.use(i18n) // <--- Đưa dòng này lên trước mount

// 2. Sau đó mới mount ứng dụng
app.mount('#app')
