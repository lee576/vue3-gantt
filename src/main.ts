import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import dayjs from 'dayjs'; 
import 'dayjs/locale/zh-cn'; 
 
dayjs.locale('zh-cn');  
 
const app = createApp(App); 
app.provide('dayjs', dayjs);
app.mount('#app');  
