import { STORAGE_KEYS, ROLES } from '@/utils/constants'

const DEMO_USERS = [
  {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@school.edu',
    password: 'Admin@123',
    role: ROLES.ADMIN,
    avatar: null,
    phone: '+1 555-0100',
    department: 'Administration',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'teacher-001',
    name: 'John Smith',
    email: 'teacher@school.edu',
    password: 'Teacher@123',
    role: ROLES.TEACHER,
    avatar: null,
    phone: '+1 555-0101',
    department: 'Mathematics',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'student-001',
    name: 'Alice Johnson',
    email: 'student@school.edu',
    password: 'Student@123',
    role: ROLES.STUDENT,
    avatar: null,
    phone: '+1 555-0102',
    gradeLevel: 'Grade 10',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
]

class AuthService {
  login({ email, password }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = DEMO_USERS.find(
          (u) => u.email === email && u.password === password
        )
        if (user) {
          const { password: _, ...safeUser } = user
          const token = btoa(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 }))
          localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(safeUser))
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
          resolve({ user: safeUser, token, message: 'Login successful' })
        } else {
          reject({ message: 'Invalid email or password', status: 401 })
        }
      }, 600) // simulate network delay
    })
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    return Promise.resolve({ message: 'Logged out' })
  }

  register({ name, email, password, role = ROLES.STUDENT }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existing = DEMO_USERS.find((u) => u.email === email)
        if (existing) {
          reject({ message: 'Email already registered', status: 409 })
          return
        }
        const newUser = {
          id: Date.now().toString(36),
          name,
          email,
          role,
          avatar: null,
          createdAt: new Date().toISOString(),
        }
        const token = btoa(JSON.stringify({ id: newUser.id, role: newUser.role, exp: Date.now() + 86400000 }))
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(newUser))
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
        resolve({ user: newUser, token, message: 'Registration successful' })
      }, 600)
    })
  }

  getCurrentUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER)
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      if (!raw || !token) return null
      const user = JSON.parse(raw)
      // Validate token expiry
      const payload = JSON.parse(atob(token))
      if (Date.now() > payload.exp) {
        this.logout()
        return null
      }
      return user
    } catch {
      return null
    }
  }

  isAuthenticated() {
    return !!this.getCurrentUser()
  }

  updateProfile(updates) {
    const user = this.getCurrentUser()
    if (!user) return Promise.reject({ message: 'Not authenticated' })
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updated))
    return Promise.resolve({ user: updated, message: 'Profile updated' })
  }

  getDemoCredentials() {
    return DEMO_USERS.map(({ email, password, role, name }) => ({ email, password, role, name }))
  }
}

export const authService = new AuthService()
export default authService