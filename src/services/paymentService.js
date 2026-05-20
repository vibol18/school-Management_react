import { paymentStorage } from './api'

const SEED_PAYMENTS = [
  { id: 'pay-001', paymentId: 'PAY-0001', studentId: 'stu-001', studentName: 'Emma Wilson', type: 'tuition', amount: 2500, status: 'paid', dueDate: '2024-09-15', paidDate: '2024-09-10', method: 'bank_transfer', semester: 'Fall 2024', notes: '' },
  { id: 'pay-002', paymentId: 'PAY-0002', studentId: 'stu-002', studentName: 'Liam Johnson', type: 'tuition', amount: 2500, status: 'paid', dueDate: '2024-09-15', paidDate: '2024-09-14', method: 'credit_card', semester: 'Fall 2024', notes: '' },
  { id: 'pay-003', paymentId: 'PAY-0003', studentId: 'stu-003', studentName: 'Olivia Brown', type: 'tuition', amount: 2500, status: 'pending', dueDate: '2024-10-15', paidDate: null, method: null, semester: 'Fall 2024', notes: '' },
  { id: 'pay-004', paymentId: 'PAY-0004', studentId: 'stu-004', studentName: 'Noah Davis', type: 'tuition', amount: 2500, status: 'overdue', dueDate: '2024-09-15', paidDate: null, method: null, semester: 'Fall 2024', notes: 'Sent reminder 3x' },
  { id: 'pay-005', paymentId: 'PAY-0005', studentId: 'stu-005', studentName: 'Ava Martinez', type: 'library_fee', amount: 50, status: 'paid', dueDate: '2024-09-30', paidDate: '2024-09-25', method: 'cash', semester: 'Fall 2024', notes: '' },
  { id: 'pay-006', paymentId: 'PAY-0006', studentId: 'stu-006', studentName: 'William Garcia', type: 'tuition', amount: 2500, status: 'partial', dueDate: '2024-09-15', paidDate: '2024-09-12', method: 'check', semester: 'Fall 2024', notes: 'Paid $1500, balance $1000 due Nov 1' },
  { id: 'pay-007', paymentId: 'PAY-0007', studentId: 'stu-007', studentName: 'Sophia Rodriguez', type: 'activity_fee', amount: 150, status: 'paid', dueDate: '2024-09-30', paidDate: '2024-09-20', method: 'bank_transfer', semester: 'Fall 2024', notes: '' },
  { id: 'pay-008', paymentId: 'PAY-0008', studentId: 'stu-001', studentName: 'Emma Wilson', type: 'lab_fee', amount: 75, status: 'paid', dueDate: '2024-09-30', paidDate: '2024-09-10', method: 'bank_transfer', semester: 'Fall 2024', notes: '' },
]

export const paymentService = {
  async getAll(filters = {}) {
    return paymentStorage.getAll(filters)
  },

  async getById(id) {
    return paymentStorage.getById(id)
  },

  async create(data) {
    const existing = await paymentStorage.getAll()
    const count = existing.total + 1
    const paymentId = `PAY-${String(count).padStart(4, '0')}`
    return paymentStorage.create({ ...data, paymentId })
  },

  async update(id, data) {
    return paymentStorage.update(id, data)
  },

  async delete(id) {
    return paymentStorage.delete(id)
  },

  async markAsPaid(id, method = 'cash') {
    return paymentStorage.update(id, {
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
      method,
    })
  },

  async getStats() {
    const { data } = await paymentStorage.getAll()
    const total = data.reduce((sum, p) => sum + Number(p.amount), 0)
    const collected = data
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0)
    const pending = data
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount), 0)
    const overdue = data
      .filter((p) => p.status === 'overdue')
      .reduce((sum, p) => sum + Number(p.amount), 0)

    const byType = data.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + Number(p.amount)
      return acc
    }, {})

    const byStatus = data.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1
      return acc
    }, {})

    return { total, collected, pending, overdue, byType, byStatus }
  },

  seed() {
    paymentStorage.seed(SEED_PAYMENTS.map(p => ({ ...p, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })))
  },
}

export default paymentService