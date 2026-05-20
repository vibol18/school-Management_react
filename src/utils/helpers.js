/**
 * Format date to display string
 */
export const formatDate = (date, format = 'MMM DD, YYYY') => {
  if (!date) return '—'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '—'

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = String(parsed.getDate()).padStart(2, '0')
  const year = parsed.getFullYear()
  return `${monthNames[parsed.getMonth()]} ${day}, ${year}`
}

/**
 * Format date to relative time (e.g. "3 days ago")
 */
export const fromNow = (date) => {
  if (!date) return '—'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '—'

  const diffSeconds = Math.floor((parsed.getTime() - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const divisions = [
    { amount: 60, name: 'seconds' },
    { amount: 60, name: 'minutes' },
    { amount: 24, name: 'hours' },
    { amount: 7, name: 'days' },
    { amount: 4.34524, name: 'weeks' },
    { amount: 12, name: 'months' },
    { amount: Number.POSITIVE_INFINITY, name: 'years' },
  ]

  let duration = diffSeconds
  for (let i = 0; i < divisions.length; i += 1) {
    const { amount, name } = divisions[i]
    if (Math.abs(duration) < amount || i === divisions.length - 1) {
      return rtf.format(Math.round(duration), name)
    }
    duration /= amount
  }

  return '—'
}

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '—'
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Generate avatar color based on name
 */
export const getAvatarColor = (name) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#76D7C4',
    '#F0B27A', '#82E0AA', '#85C1E9', '#F1948A', '#A9CCE3',
  ]
  if (!name) return colors[0]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

/**
 * Truncate text
 */
export const truncate = (text, length = 50) => {
  if (!text) return ''
  return text.length > length ? `${text.slice(0, length)}...` : text
}

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Slugify string
 */
export const slugify = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dob) => {
  if (!dob) return null
  const birth = new Date(dob)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDelta = today.getMonth() - birth.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

/**
 * Generate random ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Debounce function
 */
export const debounce = (fn, delay = 300) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Sort array by field
 */
export const sortBy = (arr, field, order = 'asc') => {
  return [...arr].sort((a, b) => {
    const valA = a[field]
    const valB = b[field]
    if (valA < valB) return order === 'asc' ? -1 : 1
    if (valA > valB) return order === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Filter array by search term across multiple fields
 */
export const filterBySearch = (arr, search, fields) => {
  if (!search) return arr
  const term = search.toLowerCase()
  return arr.filter((item) =>
    fields.some((field) => {
      const val = item[field]
      return val && String(val).toLowerCase().includes(term)
    })
  )
}


export const getPercentage = (value, total) => {
  if (!total) return 0
  return Math.round((value / total) * 100)
}


export const downloadCSV = (data, filename = 'export') => {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
    ),
  ]
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Get current school year
 */
export const getCurrentSchoolYear = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  if (month >= 9) return `${year}-${year + 1}`
  return `${year - 1}-${year}`
}