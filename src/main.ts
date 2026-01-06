import { createApp } from 'vue'
import './components/gantt/tailwind.css'
import './style.css'
import App from './App.vue'
import DateUtils from './components/gantt/utils/dateUtils'

DateUtils.setLocale('zh-CN')

const app = createApp(App)
app.provide('DateUtils', DateUtils)
app.mount('#app')
