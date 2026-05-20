export const STORAGE_PREFIX = import.meta.env.VITE_STORAGE_PREFIX || 'school_mgmt_'

export const STORAGE_KEYS = {
  AUTH_USER: `${STORAGE_PREFIX}auth_user`,
  AUTH_TOKEN: `${STORAGE_PREFIX}auth_token`,
  STUDENTS: `${STORAGE_PREFIX}students`,
  TEACHERS: `${STORAGE_PREFIX}teachers`,
  COURSES: `${STORAGE_PREFIX}courses`,
  PAYMENTS: `${STORAGE_PREFIX}payments`,
  ATTENDANCE: `${STORAGE_PREFIX}attendance`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  THEME: `${STORAGE_PREFIX}theme`,
}

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
}

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
}

export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
  SUSPENDED: 'suspended',
}

export const TEACHER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on_leave',
}

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  PARTIAL: 'partial',
}

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
}

export const GRADE_LEVELS = [
  'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
  'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9',
  'Grade 10', 'Grade 11', 'Grade 12',
]

export const DEPARTMENTS = [
  'Mathematics', 'Science', 'English', 'History', 'Geography',
  'Physical Education', 'Arts', 'Music', 'Computer Science',
  'Languages', 'Social Studies', 'Economics',
]

export const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50, 100]
export const DEFAULT_ITEMS_PER_PAGE = 10

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const STATUS_COLORS = {
  active: 'success',
  inactive: 'error',
  graduated: 'info',
  suspended: 'warning',
  on_leave: 'warning',
  paid: 'success',
  pending: 'warning',
  overdue: 'error',
  partial: 'info',
  present: 'success',
  absent: 'error',
  late: 'warning',
  excused: 'info',
}