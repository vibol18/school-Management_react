import { teacherStorage } from './api'

const SEED_TEACHERS = [
  {
    id: 'tea-001',
    teacherId: 'TEA-0001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@school.edu',
    phone: '+1 555-0201',
    department: 'Mathematics',
    specialization: 'Algebra',
    experience: 8,
    salary: 72000,
    status: 'active',
    joinDate: '2018-09-01',
    avatar: null,
    notes: '',
  },
  {
    id: 'tea-002',
    teacherId: 'TEA-0002',
    firstName: 'Maya',
    lastName: 'Lee',
    email: 'maya.lee@school.edu',
    phone: '+1 555-0202',
    department: 'Science',
    specialization: 'Biology',
    experience: 6,
    salary: 68000,
    status: 'active',
    joinDate: '2019-08-15',
    avatar: null,
    notes: '',
  },
  {
    id: 'tea-003',
    teacherId: 'TEA-0003',
    firstName: 'David',
    lastName: 'Nguyen',
    email: 'david.nguyen@school.edu',
    phone: '+1 555-0203',
    department: 'English',
    specialization: 'Literature',
    experience: 10,
    salary: 76000,
    status: 'active',
    joinDate: '2017-07-01',
    avatar: null,
    notes: '',
  },
  {
    id: 'tea-004',
    teacherId: 'TEA-0004',
    firstName: 'Aisha',
    lastName: 'Khan',
    email: 'aisha.khan@school.edu',
    phone: '+1 555-0204',
    department: 'History',
    specialization: 'World History',
    experience: 5,
    salary: 65000,
    status: 'active',
    joinDate: '2020-01-10',
    avatar: null,
    notes: '',
  },
]

export const teacherService = {
  async getAll(filters = {}) {
    return teacherStorage.getAll(filters)
  },

  async getById(id) {
    return teacherStorage.getById(id)
  },

  async create(data) {
    const existing = await teacherStorage.getAll()
    const count = existing.total + 1
    const teacherId = `TEA-${String(count).padStart(4, '0')}`
    return teacherStorage.create({ ...data, teacherId })
  },

  async update(id, data) {
    return teacherStorage.update(id, data)
  },

  async delete(id) {
    return teacherStorage.delete(id)
  },

  async deleteMany(ids) {
    return teacherStorage.deleteMany(ids)
  },

  async getStats() {
    const { data } = await teacherStorage.getAll()
    const total = data.length
    const active = data.filter((t) => t.status === 'active').length
    const inactive = data.filter((t) => t.status === 'inactive').length
    const onLeave = data.filter((t) => t.status === 'on_leave').length
    const avgExperience = total > 0
      ? (data.reduce((sum, t) => sum + Number(t.experience || 0), 0) / total).toFixed(1)
      : '0.0'

    const byDepartment = data.reduce((acc, t) => {
      acc[t.department] = (acc[t.department] || 0) + 1
      return acc
    }, {})

    return { total, active, inactive, onLeave, avgExperience, byDepartment }
  },

  seed() {
    teacherStorage.seed(SEED_TEACHERS.map((teacher) => ({
      ...teacher,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })))
  },
}

export default teacherService
