/**
 * Form validation rules for Vuetify
 */

export const required = (label = 'This field') => (v) =>
  !!v || `${label} is required`

export const minLength = (min, label = 'This field') => (v) =>
  !v || v.length >= min || `${label} must be at least ${min} characters`

export const maxLength = (max, label = 'This field') => (v) =>
  !v || v.length <= max || `${label} must be at most ${max} characters`

export const email = () => (v) =>
  !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email address'

export const phone = () => (v) =>
  !v || /^[+\d\s\-()]{7,20}$/.test(v) || 'Invalid phone number'

export const numeric = (label = 'This field') => (v) =>
  !v || /^\d+$/.test(v) || `${label} must be a number`

export const positiveNumber = (label = 'Value') => (v) =>
  !v || (Number(v) > 0) || `${label} must be greater than 0`

export const minValue = (min, label = 'Value') => (v) =>
  !v || Number(v) >= min || `${label} must be at least ${min}`

export const maxValue = (max, label = 'Value') => (v) =>
  !v || Number(v) <= max || `${label} must be at most ${max}`

export const date = () => (v) =>
  !v || /^\d{4}-\d{2}-\d{2}$/.test(v) || 'Invalid date format (YYYY-MM-DD)'

export const passwordStrength = () => (v) => {
  if (!v) return true
  if (v.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(v)) return 'Password must contain at least one uppercase letter'
  if (!/[0-9]/.test(v)) return 'Password must contain at least one number'
  return true
}

export const confirmPassword = (password) => (v) =>
  v === password || 'Passwords do not match'

export const studentIdFormat = () => (v) =>
  !v || /^STU-\d{4,8}$/.test(v) || 'Format must be STU-XXXXXX'

export const teacherIdFormat = () => (v) =>
  !v || /^TCH-\d{4,8}$/.test(v) || 'Format must be TCH-XXXXXX'

/**
 * Validate entire form object - returns array of errors
 */
export const validateForm = (data, rules) => {
  const errors = {}
  Object.entries(rules).forEach(([field, fieldRules]) => {
    for (const rule of fieldRules) {
      const result = rule(data[field])
      if (result !== true) {
        errors[field] = result
        break
      }
    }
  })
  return errors
}