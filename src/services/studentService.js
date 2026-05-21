import { studentStorage } from './api'
import { generateId } from '@/utils/helpers'

// Seed data
const SEED_STUDENTS = [
  { id: 'stu-001', studentId: 'STU-0001', firstName: 'Emma', lastName: 'Wilson', email: 'emma.wilson@school.edu', phone: '+1 555-1001', gender: 'female', dateOfBirth: '2008-03-15', address: '123 Maple St, Springfield', gradeLevel: 'Grade 10', status: 'active', enrollmentDate: '2023-09-01', guardianName: 'Robert Wilson', guardianPhone: '+1 555-1000', guardianEmail: 'r.wilson@email.com', gpa: 3.8, photo: null, notes: '' },
  { id: 'stu-002', studentId: 'STU-0002', firstName: 'Liam', lastName: 'Johnson', email: 'liam.j@school.edu', phone: '+1 555-1002', gender: 'male', dateOfBirth: '2007-07-22', address: '456 Oak Ave, Springfield', gradeLevel: 'Grade 11', status: 'active', enrollmentDate: '2022-09-01', guardianName: 'Sarah Johnson', guardianPhone: '+1 555-1002', guardianEmail: 's.johnson@email.com', gpa: 3.2, photo: null, notes: '' },
  { id: 'stu-003', studentId: 'STU-0003', firstName: 'Olivia', lastName: 'Brown', email: 'olivia.b@school.edu', phone: '+1 555-1003', gender: 'female', dateOfBirth: '2009-11-08', address: '789 Pine Rd, Springfield', gradeLevel: 'Grade 9', status: 'active', enrollmentDate: '2024-09-01', guardianName: 'Michael Brown', guardianPhone: '+1 555-1003', guardianEmail: 'm.brown@email.com', gpa: 3.9, photo: null, notes: '' },
  { id: 'stu-004', studentId: 'STU-0004', firstName: 'Noah', lastName: 'Davis', email: 'noah.d@school.edu', phone: '+1 555-1004', gender: 'male', dateOfBirth: '2008-05-19', address: '321 Elm St, Springfield', gradeLevel: 'Grade 10', status: 'inactive', enrollmentDate: '2023-09-01', guardianName: 'Jennifer Davis', guardianPhone: '+1 555-1004', guardianEmail: 'j.davis@email.com', gpa: 2.7, photo: null, notes: 'On medical leave' },
  { id: 'stu-005', studentId: 'STU-0005', firstName: 'Ava', lastName: 'Martinez', email: 'ava.m@school.edu', phone: '+1 555-1005', gender: 'female', dateOfBirth: '2007-01-30', address: '654 Cedar Blvd, Springfield', gradeLevel: 'Grade 11', status: 'active', enrollmentDate: '2022-09-01', guardianName: 'Carlos Martinez', guardianPhone: '+1 555-1005', guardianEmail: 'c.martinez@email.com', gpa: 3.6, photo: null, notes: '' },
  { id: 'stu-006', studentId: 'STU-0006', firstName: 'William', lastName: 'Garcia', email: 'will.g@school.edu', phone: '+1 555-1006', gender: 'male', dateOfBirth: '2006-09-14', address: '987 Birch Ln, Springfield', gradeLevel: 'Grade 12', status: 'active', enrollmentDate: '2021-09-01', guardianName: 'Maria Garcia', guardianPhone: '+1 555-1006', guardianEmail: 'm.garcia@email.com', gpa: 4.0, photo: null, notes: 'Valedictorian candidate' },
  { id: 'stu-007', studentId: 'STU-0007', firstName: 'Sophia', lastName: 'Rodriguez', email: 'sophia.r@school.edu', phone: '+1 555-1007', gender: 'female', dateOfBirth: '2009-06-25', address: '147 Walnut Dr, Springfield', gradeLevel: 'Grade 9', status: 'active', enrollmentDate: '2024-09-01', guardianName: 'Luis Rodriguez', guardianPhone: '+1 555-1007', guardianEmail: 'l.rodriguez@email.com', gpa: 3.4, photo: null, notes: '' },--
  { id: 'stu-008', studentId: 'STU-0008', firstName: 'James', lastName: 'Lee', email: 'james.l@school.edu', phone: '+1 555-1008', gender: 'male', dateOfBirth: '2008-12-03', address: '258 Spruce Way, Springfield', gradeLevel: 'Grade 10', status: 'suspended', enrollmentDate: '2023-09-01', guardianName: 'Helen Lee', guardianPhone: '+1 555-1008', guardianEmail: 'h.lee@email.com', gpa: 2.1, photo: null, notes: 'Disciplinary suspension until Jan 2025' },
]

export const studentService = {
  async getAll(filters = {}) {
    return studentStorage.getAll(filters)
  },

  async getById(id) {
    return studentStorage.getById(id)
  },

  async create(data) {
    // Auto-generate student ID
    const existing = await studentStorage.getAll()
    const count = existing.total + 1
    const studentId = `STU-${String(count).padStart(4, '0')}`
    return studentStorage.create({ ...data, studentId })
  },

  async update(id, data) {
    return studentStorage.update(id, data)
  },
  async delete(id) {
    return studentStorage.delete(id)
  },

  async deleteMany(ids) {
    return studentStorage.deleteMany(ids)
  },

  async getStats() {
    const { data } = await studentStorage.getAll()
    const total = data.length
    const active = data.filter((s) => s.status === 'active').length
    const inactive = data.filter((s) => s.status === 'inactive').length
    const graduated = data.filter((s) => s.status === 'graduated').length
    const suspended = data.filter((s) => s.status === 'suspended').length
    const avgGpa = total > 0
      ? (data.reduce((sum, s) => sum + (Number(s.gpa) || 0), 0) / total).toFixed(2)
      : 0

    const byGrade = data.reduce((acc, s) => {
      acc[s.gradeLevel] = (acc[s.gradeLevel] || 0) + 1
      return acc
    }, {})

    const byGender = data.reduce((acc, s) => {
      acc[s.gender] = (acc[s.gender] || 0) + 1
      return acc
    }, {})

    return { total, active, inactive, graduated, suspended, avgGpa, byGrade, byGender }
  },

  seed() {
    studentStorage.seed(SEED_STUDENTS.map(s => ({ ...s, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })))
  },
}

export default studentService