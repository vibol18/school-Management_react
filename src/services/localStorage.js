import { STORAGE_KEYS } from '@/utils/constants'

/**
 * LocalStorage service - simulates a REST API with CRUD operations
 * This layer abstracts storage so it can be swapped for real API calls
 */

class StorageService {
  constructor(key, defaultData = []) {
    this.key = key
    this.defaultData = defaultData
  }

  _read() {
    try {
      const raw = localStorage.getItem(this.key)
      return raw ? JSON.parse(raw) : this.defaultData
    } catch {
      return this.defaultData
    }
  }

  _write(data) {
    try {
      localStorage.setItem(this.key, JSON.stringify(data))
      return true
    } catch (e) {
      console.error('Storage write failed:', e)
      return false
    }
  }

  getAll(filters = {}) {
    let data = this._read()
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        data = data.filter((item) => {
          if (typeof value === 'string') {
            return String(item[key]).toLowerCase().includes(value.toLowerCase())
          }
          return item[key] === value
        })
      }
    })
    return Promise.resolve({ data, total: data.length })
  }

  getById(id) {
    const data = this._read()
    const item = data.find((d) => d.id === id)
    if (!item) return Promise.reject({ message: 'Not found', status: 404 })
    return Promise.resolve({ data: item })
  }

  create(payload) {
    const data = this._read()
    const newItem = {
      ...payload,
      id: this._generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    data.push(newItem)
    this._write(data)
    return Promise.resolve({ data: newItem, message: 'Created successfully' })
  }

  update(id, payload) {
    const data = this._read()
    const idx = data.findIndex((d) => d.id === id)
    if (idx === -1) return Promise.reject({ message: 'Not found', status: 404 })
    data[idx] = { ...data[idx], ...payload, updatedAt: new Date().toISOString() }
    this._write(data)
    return Promise.resolve({ data: data[idx], message: 'Updated successfully' })
  }

  delete(id) {
    const data = this._read()
    const filtered = data.filter((d) => d.id !== id)
    if (filtered.length === data.length)
      return Promise.reject({ message: 'Not found', status: 404 })
    this._write(filtered)
    return Promise.resolve({ message: 'Deleted successfully' })
  }

  deleteMany(ids) {
    const data = this._read()
    const filtered = data.filter((d) => !ids.includes(d.id))
    this._write(filtered)
    return Promise.resolve({ message: `${ids.length} records deleted` })
  }

  count(filters = {}) {
    return this.getAll(filters).then(({ total }) => ({ count: total }))
  }

  seed(seedData) {
    const existing = this._read()
    if (existing.length === 0) {
      this._write(seedData)
    }
  }

  clear() {
    localStorage.removeItem(this.key)
  }

  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
  }
}

// Instantiate services for each entity
export const studentStorage = new StorageService(STORAGE_KEYS.STUDENTS)
export const teacherStorage = new StorageService(STORAGE_KEYS.TEACHERS)
export const courseStorage = new StorageService(STORAGE_KEYS.COURSES)
export const paymentStorage = new StorageService(STORAGE_KEYS.PAYMENTS)
export const attendanceStorage = new StorageService(STORAGE_KEYS.ATTENDANCE)

export default StorageService