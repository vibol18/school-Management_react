<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-row>
      <v-col cols="12">
        <div class="text-subtitle-2 font-weight-bold text-medium-emphasis mb-3 d-flex align-center ga-2">
          <v-icon size="16">mdi-account-tie</v-icon> Personal Information
        </div>
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field v-model="form.firstName" label="First Name" :rules="[rules.required('First name')]" prepend-inner-icon="mdi-account" />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field v-model="form.lastName" label="Last Name" :rules="[rules.required('Last name')]" />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field v-model="form.email" label="Email" type="email" :rules="[rules.required('Email'), rules.email()]" prepend-inner-icon="mdi-email" />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field v-model="form.phone" label="Phone" :rules="[rules.phone()]" prepend-inner-icon="mdi-phone" />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select v-model="form.gender" :items="genderOptions" label="Gender" :rules="[rules.required('Gender')]" prepend-inner-icon="mdi-gender-male-female" />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field v-model="form.dateOfBirth" label="Date of Birth" type="date" prepend-inner-icon="mdi-calendar" />
      </v-col>
      <v-col cols="12">
        <v-text-field v-model="form.address" label="Address" prepend-inner-icon="mdi-map-marker" />
      </v-col>

      <v-col cols="12">
        <v-divider class="mb-4" />
        <div class="text-subtitle-2 font-weight-bold text-medium-emphasis mb-3 d-flex align-center ga-2">
          <v-icon size="16">mdi-school</v-icon> Professional Information
        </div>
      </v-col>

      <v-col cols="12" sm="6">
        <v-select v-model="form.department" :items="departments" label="Department" :rules="[rules.required('Department')]" prepend-inner-icon="mdi-domain" />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field v-model="form.specialization" label="Specialization" prepend-inner-icon="mdi-star-circle" />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field v-model="form.qualification" label="Qualification" prepend-inner-icon="mdi-certificate" />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field v-model="form.experience" label="Experience (years)" type="number" min="0" prepend-inner-icon="mdi-briefcase" />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field v-model="form.joinDate" label="Join Date" type="date" prepend-inner-icon="mdi-calendar-plus" />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select v-model="form.status" :items="statusOptions" label="Status" :rules="[rules.required('Status')]" prepend-inner-icon="mdi-circle" />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field v-model="form.salary" label="Annual Salary (USD)" type="number" min="0" prepend-inner-icon="mdi-cash" />
      </v-col>
      <v-col cols="12">
        <v-textarea v-model="form.notes" label="Notes" rows="3" prepend-inner-icon="mdi-note-text" auto-grow />
      </v-col>

      <v-col cols="12">
        <div class="d-flex ga-3 justify-end">
          <v-btn variant="tonal" rounded="lg" @click="$emit('cancel')">Cancel</v-btn>
          <v-btn type="submit" color="primary" :loading="loading" rounded="lg" min-width="140">
            <v-icon start>{{ isEdit ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
            {{ isEdit ? 'Save Changes' : 'Add Teacher' }}
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { DEPARTMENTS, TEACHER_STATUS } from '@/utils/constants'
import * as validators from '@/utils/validators'

const props = defineProps({
  teacher: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['submit', 'cancel'])

const formRef = ref()
const isEdit = computed(() => !!props.teacher)

const defaultForm = () => ({
  firstName: '', lastName: '', email: '', phone: '',
  gender: '', dateOfBirth: '', address: '',
  department: '', specialization: '', qualification: '', experience: '',
  joinDate: new Date().toISOString().split('T')[0], status: 'active',
  salary: '', notes: '',
})

const form = reactive(defaultForm())
watch(() => props.teacher, (val) => {
  if (val) Object.assign(form, { ...defaultForm(), ...val })
  else Object.assign(form, defaultForm())
}, { immediate: true })

const rules = validators
const departments = DEPARTMENTS
const genderOptions = [{ title: 'Male', value: 'male' }, { title: 'Female', value: 'female' }, { title: 'Other', value: 'other' }]
const statusOptions = Object.entries(TEACHER_STATUS).map(([, v]) => ({ title: v.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()), value: v }))

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  emit('submit', { ...form })
}
</script>