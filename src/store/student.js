import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStudentStore = defineStore('student', () => {
  const students = ref([])
  const selectedStudent = ref(null)

  function setStudents(list) {
    students.value = list
  }

  function setSelectedStudent(student) {
    selectedStudent.value = student
  }

  return {
    students,
    selectedStudent,
    setStudents,
    setSelectedStudent,
  }
})
