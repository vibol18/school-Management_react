import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { STORAGE_KEYS } from '@/utils/constants'

const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light'

const lightTheme = {
  dark: false,
  colors: {
    primary: '#3B5BDB',
    'primary-darken-1': '#2F4AC5',
    secondary: '#7048E8',
    accent: '#F59F00',
    error: '#F03E3E',
    warning: '#F59F00',
    info: '#1C7ED6',
    success: '#2F9E44',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    'surface-variant': '#F1F3F5',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
  },
}

const darkTheme = {
  dark: true,
  colors: {
    primary: '#748FFC',
    'primary-darken-1': '#5C7CFA',
    secondary: '#9775FA',
    accent: '#FAB005',
    error: '#FF6B6B',
    warning: '#FAB005',
    info: '#4DABF7',
    success: '#69DB7C',
    background: '#0D1117',
    surface: '#161B22',
    'surface-variant': '#21262D',
    'on-primary': '#0D1117',
    'on-secondary': '#0D1117',
  },
}

export const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: savedTheme,
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
      fontWeight: '600',
    },
    VCard: {
      rounded: 'xl',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VChip: {
      rounded: 'lg',
    },
  },
})

export default vuetify