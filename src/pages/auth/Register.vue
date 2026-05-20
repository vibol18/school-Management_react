<template>
  <div>
    <div class="mb-8">
      <h2 class="text-h4 font-weight-black mb-2">Create Account</h2>
      <p class="text-medium-emphasis">Join EduManage to get started</p>
    </div>

    <v-form ref="formRef" @submit.prevent="handleRegister">
      <v-text-field v-model="form.name" label="Full Name" :rules="[rules.required('Name'), rules.minLength(2, 'Name')]" prepend-inner-icon="mdi-account-outline" class="mb-3" autofocus />
      <v-text-field v-model="form.email" label="Email Address" type="email" :rules="[rules.required('Email'), rules.email()]" prepend-inner-icon="mdi-email-outline" class="mb-3" />
      <v-select v-model="form.role" :items="roleOptions" label="Role" :rules="[rules.required('Role')]" prepend-inner-icon="mdi-account-badge" class="mb-3" />
      <v-text-field v-model="form.password" label="Password" :type="showPwd ? 'text' : 'password'" :rules="[rules.required('Password'), rules.passwordStrength()]" prepend-inner-icon="mdi-lock-outline" :append-inner-icon="showPwd ? 'mdi-eye-off' : 'mdi-eye'" class="mb-3" @click:append-inner="showPwd = !showPwd" />
      <v-text-field v-model="form.confirm" label="Confirm Password" :type="showConfirm ? 'text' : 'password'" :rules="[rules.required('Confirm password'), rules.confirmPassword(form.password)]" prepend-inner-icon="mdi-lock-check-outline" :append-inner-icon="showConfirm ? 'mdi-eye-off' : 'mdi-eye'" class="mb-5" @click:append-inner="showConfirm = !showConfirm" />

      <v-btn type="submit" color="primary" size="large" block :loading="authStore.loading" rounded="xl" elevation="0" class="mb-4">
        Create Account
      </v-btn>
    </v-form>

    <v-alert v-if="authStore.error" type="error" class="mb-4" rounded="xl" density="compact" closable @click:close="authStore.clearError()">
      {{ authStore.error }}
    </v-alert>

    <p class="text-center text-body-2 text-medium-emphasis">
      Already have an account?
      <router-link to="/auth/login" class="text-primary font-weight-medium text-decoration-none">Sign In</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import * as rules from '@/utils/validators'
import { ROLES } from '@/utils/constants'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()
const showPwd = ref(false)
const showConfirm = ref(false)
const form = reactive({ name: '', email: '', password: '', confirm: '', role: ROLES.STUDENT })
const roleOptions = [
  { title: 'Student', value: ROLES.STUDENT },
  { title: 'Teacher', value: ROLES.TEACHER },
  { title: 'Administrator', value: ROLES.ADMIN },
]

async function handleRegister() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  try {
    await authStore.register({ name: form.name, email: form.email, password: form.password, role: form.role })
    router.push('/dashboard')
  } catch {}
}
</script>