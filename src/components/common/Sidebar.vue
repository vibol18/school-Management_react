<template>
  <v-navigation-drawer
    :model-value="modelValue"
    :rail="rail"
    permanent
    :width="260"
    class="sidebar"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- Logo -->
    <div class="sidebar-logo d-flex align-center ga-3 px-4 py-5">
      <v-avatar color="primary" size="36" rounded="lg">
        <v-icon color="white" size="20">mdi-school</v-icon>
      </v-avatar>
      <Transition name="fade">
        <div v-if="!rail">
          <div class="text-subtitle-1 font-weight-bold">EduManage</div>
          <div class="text-caption text-medium-emphasis">Pro Edition</div>
        </div>
      </Transition>
    </div>

    <v-divider class="mb-2" />

    <!-- Navigation Items -->
    <v-list nav density="compact" class="px-2">
      <template v-for="(group, gi) in navGroups" :key="gi">
        <!-- Group Label -->
        <div v-if="!rail && group.label" class="nav-group-label text-caption font-weight-bold text-medium-emphasis px-2 mt-3 mb-1">
          {{ group.label }}
        </div>

        <v-list-item
          v-for="item in group.items"
          :key="item.name"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.name"
          rounded="lg"
          class="nav-item mb-1"
          active-class="nav-item-active"
          :class="{ 'nav-item-restricted': item.roles && !hasRole(item.roles) }"
        >
          <template v-if="!rail && item.badge" #append>
            <v-badge :content="item.badge" color="error" inline />
          </template>
        </v-list-item>
      </template>
    </v-list>

    <!-- Bottom section -->
    <template #append>
      <v-divider />
      <div class="pa-2">
        <!-- Theme toggle -->
        <v-list-item
          :prepend-icon="isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"
          :title="isDark ? 'Light Mode' : 'Dark Mode'"
          rounded="lg"
          class="nav-item mb-1"
          @click="toggleTheme"
        />
        <!-- Collapse toggle (desktop) -->
        <v-list-item
          :prepend-icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          :title="rail ? 'Expand' : 'Collapse'"
          rounded="lg"
          class="nav-item d-none d-md-flex"
          @click="$emit('toggle-rail')"
        />
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/store/auth'
import { STORAGE_KEYS, ROLES } from '@/utils/constants'

const props = defineProps({ modelValue: Boolean, rail: Boolean })
const emit = defineEmits(['update:modelValue', 'toggle-rail'])

const theme = useTheme()
const authStore = useAuthStore()

const isDark = computed(() => theme.global.name.value === 'dark')

const toggleTheme = () => {
  const newTheme = isDark.value ? 'light' : 'dark'
  theme.global.name.value = newTheme
  localStorage.setItem(STORAGE_KEYS.THEME, newTheme)
}

const hasRole = (roles) => roles.includes(authStore.userRole)

const navGroups = computed(() => [
  {
    label: null,
    items: [
      { name: 'Dashboard', title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard' },
    ],
  },
  {
    label: 'People',
    items: [
      { name: 'Students', title: 'Students', icon: 'mdi-account-group-outline', to: '/students', roles: [ROLES.ADMIN, ROLES.TEACHER] },
      { name: 'Teachers', title: 'Teachers', icon: 'mdi-account-tie', to: '/teachers', roles: [ROLES.ADMIN] },
    ],
  },
  {
    label: 'Academic',
    items: [
      { name: 'Courses', title: 'Courses', icon: 'mdi-book-open-outline', to: '/courses' },
      { name: 'Attendance', title: 'Attendance', icon: 'mdi-calendar-check-outline', to: '/attendance' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { name: 'Payments', title: 'Payments', icon: 'mdi-cash-multiple', to: '/payments', roles: [ROLES.ADMIN] },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Reports', title: 'Reports', icon: 'mdi-chart-bar', to: '/reports', roles: [ROLES.ADMIN] },
      { name: 'Settings', title: 'Settings', icon: 'mdi-cog-outline', to: '/settings' },
    ],
  },
])
</script>

<style scoped>
.sidebar { border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important; }

.sidebar-logo { border-bottom: none; min-height: 72px; }

.nav-group-label { letter-spacing: 0.08em; text-transform: uppercase; }

.nav-item { font-weight: 500; }

:deep(.nav-item-active) {
  background: rgba(var(--v-theme-primary), 0.12) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 700 !important;
}

:deep(.nav-item-active .v-icon) {
  color: rgb(var(--v-theme-primary)) !important;
}

.nav-item-restricted { opacity: 0.4; pointer-events: none; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>