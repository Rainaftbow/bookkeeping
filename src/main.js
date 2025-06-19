import 'element-plus/dist/index.css'

import { createApp } from 'vue'

import App from './App.vue'

import router from './router/index.js'
import pinia from './stores/index.js';

import ElementPlus from 'element-plus'
import * as ElIconList from '@element-plus/icons-vue'
import {zhCn} from "element-plus/es/locale/index";

const app = createApp(App)
// 导入icon组件
for (const name in ElIconList) {
    app.component(name, ElIconList[name])
}

app
    .use(pinia)
    .use(router)
    .use(ElementPlus, { locale: zhCn })
    .mount('#app')
