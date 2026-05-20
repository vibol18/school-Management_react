import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTeacherStore = defineStore('teacher', () => {
  const teachers = ref([])
  const selectedTeacher = ref(null)

  function setTeachers(list) {
    teachers.value = list
  }

  function setSelectedTeacher(teacher) {
    selectedTeacher.value = teacher
  }

  return {
    teachers,
    selectedTeacher,
    setTeachers,
    setSelectedTeacher,
  }
})
