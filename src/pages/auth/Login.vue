<template>
  <div>
    <div class="mb-8">
      <h2 class="text-h4 font-weight-black mb-2">Welcome back 👋</h2>
      <p class="text-medium-emphasis">Sign in to your EduManage account</p>
    </div>

    <!-- Demo credentials -->
    <v-alert class="mb-6" rounded="xl" color="info" variant="tonal" density="compact">
      <div class="text-caption font-weight-bold mb-2">Demo Credentials:</div>
      <div v-for="cred in demoCredentials" :key="cred.role" class="d-flex align-center justify-space-between mb-1">
        <span class="text-caption mono">{{ cred.email }} / {{ cred.password }}</span>
        <v-chip size="x-small" :color="roleColor(cred.role)">{{ cred.role }}</v-chip>
      </div>
    </v-alert>

    <v-form ref="formRef" @submit.prevent="handleLogin">
      <v-text-field
        v-model="form.email"
        label="Email Address"
        type="email"
        :rules="[rules.required('Email'), rules.email()]"
        prepend-inner-icon="mdi-email-outline"
        class="mb-3"
        autofocus
      />
      <v-text-field
        v-model="form.password"
        label="Password"
        :type="showPassword ? 'text' : 'password'"
        :rules="[rules.required('Password')]"
        prepend-inner-icon="mdi-lock-outline"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        class="mb-2"
        @click:append-inner="showPassword = !showPassword"
      />

      <div class="d-flex justify-end mb-5">
        <a href="#" class="text-caption text-primary text-decoration-none">Forgot password?</a>
      </div>

      <v-btn
        type="submit"
        color="primary"
        size="large"
        block
        :loading="authStore.loading"
        rounded="xl"
        class="mb-4"
        elevation="0"
      >
        Sign In
      </v-btn>
    </v-form>

    <v-alert v-if="authStore.error" type="error" class="mb-4" rounded="xl" density="compact" closable @click:close="authStore.clearError()">
      {{ authStore.error }}
    </v-alert>

    <p class="text-center text-body-2 text-medium-emphasis">
      Don't have an account?
      <router-link to="/auth/register" class="text-primary font-weight-medium text-decoration-none">Register</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import * as rules from '@/utils/validators'
import { authService } from '@/services/authService'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formRef = ref()
const showPassword = ref(false)
const form = reactive({ email: '', password: '' })

const demoCredentials = authService.getDemoCredentials()

const roleColor = (role) => ({ admin: 'primary', teacher: 'success', student: 'info' }[role])

async function handleLogin() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  try {
    await authStore.login(form)
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } catch {}
}
</script>

<style scoped>
.mono { font-family: 'JetBrains Mono', monospace !important; font-size: 11px; }
</style>