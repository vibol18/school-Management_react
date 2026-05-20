import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

export { useAuthStore } from './auth'
export { useStudentStore } from './student'
export { useTeacherStore } from './teacher'