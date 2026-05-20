import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import { vuetify } from './plugins/vuetify'

// Seed demo data on first load
import { studentService } from './services/studentService'
import { teacherService } from './services/teacherServiceImpl'
import { paymentService } from './services/paymentService'

studentService.seed()
teacherService.seed()
paymentService.seed()

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify)

app.mount('#app')