<template>
  <v-app-bar elevation="0" class="navbar border-b" height="64">
    <!-- Mobile menu toggle -->
    <v-btn
      icon
      class="d-md-none ms-2"
      @click="$emit('toggle-drawer')"
    >
      <v-icon>mdi-menu</v-icon>
    </v-btn>

    <!-- Page title / breadcrumb -->
    <v-app-bar-title class="ms-2 ms-md-0">
      <div class="text-subtitle-1 font-weight-bold">{{ pageTitle }}</div>
      <div class="text-caption text-medium-emphasis d-none d-sm-block">{{ pageSubtitle }}</div>
    </v-app-bar-title>

    <template #append>
      <div class="d-flex align-center ga-1 me-2">
        <!-- Search -->
        <v-btn icon size="small">
          <v-icon size="20">mdi-magnify</v-icon>
          <v-tooltip activator="parent" location="bottom">Search</v-tooltip>
        </v-btn>

        <!-- Notifications -->
        <v-btn icon size="small" class="position-relative">
          <v-badge content="3" color="error" floating>
            <v-icon size="20">mdi-bell-outline</v-icon>
          </v-badge>
          <v-tooltip activator="parent" location="bottom">Notifications</v-tooltip>
        </v-btn>

        <!-- User menu -->
        <v-menu min-width="220" rounded="xl" :close-on-content-click="false">
          <template #activator="{ props }">
            <v-btn v-bind="props" rounded="xl" variant="tonal" class="ms-1 ps-2 pe-3" height="40">
              <v-avatar
                :color="avatarColor"
                size="28"
                class="me-2"
                rounded="lg"
              >
                <span class="text-caption font-weight-bold text-white">{{ initials }}</span>
              </v-avatar>
              <span class="d-none d-sm-inline text-body-2 font-weight-medium">{{ authStore.userName }}</span>
              <v-icon size="16" class="ms-1">mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item class="pb-0">
              <template #prepend>
                <v-avatar :color="avatarColor" size="40" rounded="lg">
                  <span class="text-body-2 font-weight-bold text-white">{{ initials }}</span>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold">{{ authStore.userName }}</v-list-item-title>
              <v-list-item-subtitle>{{ authStore.user?.email }}</v-list-item-subtitle>
              <v-list-item-subtitle>
                <v-chip size="x-small" :color="roleColor" class="mt-1">{{ authStore.userRole }}</v-chip>
              </v-list-item-subtitle>
            </v-list-item>

            <v-divider class="my-2" />

            <v-list-item prepend-icon="mdi-account-circle-outline" title="Profile" to="/settings" rounded="lg" />
            <v-list-item prepend-icon="mdi-cog-outline" title="Settings" to="/settings" rounded="lg" />

            <v-divider class="my-2" />

            <v-list-item
              prepend-icon="mdi-logout"
              title="Sign Out"
              base-color="error"
              rounded="lg"
              @click="handleLogout"
            />
          </v-list>
        </v-menu>
      </div>
    </template>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { getInitials, getAvatarColor } from '@/utils/helpers'

defineProps({ drawer: Boolean })
defineEmits(['toggle-drawer'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const pageTitle = computed(() => route.meta.title || 'Dashboard')
const pageSubtitle = computed(() => `EduManage Pro / ${pageTitle.value}`)
const initials = computed(() => getInitials(authStore.userName))
const avatarColor = computed(() => getAvatarColor(authStore.userName))
const roleColor = computed(() => {
  const map = { admin: 'primary', teacher: 'success', student: 'info' }
  return map[authStore.userRole] || 'secondary'
})

async function handleLogout() {
  await authStore.logout()
  router.push('/auth/login')
}
</script>

<style scoped>
.navbar {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  background: rgb(var(--v-theme-surface)) !important;
}
</style>