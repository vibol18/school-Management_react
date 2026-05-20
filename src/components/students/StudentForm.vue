<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-row>
      <!-- Personal Info -->
      <v-col cols="12">
        <div class="text-subtitle-2 font-weight-bold text-medium-emphasis mb-3 d-flex align-center ga-2">
          <v-icon size="16">mdi-account</v-icon> Personal Information
        </div>
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.firstName"
          label="First Name"
          :rules="[rules.required('First name')]"
          prepend-inner-icon="mdi-account"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.lastName"
          label="Last Name"
          :rules="[rules.required('Last name')]"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.email"
          label="Email"
          type="email"
          :rules="[rules.required('Email'), rules.email()]"
          prepend-inner-icon="mdi-email"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.phone"
          label="Phone"
          :rules="[rules.phone()]"
          prepend-inner-icon="mdi-phone"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select
          v-model="form.gender"
          :items="genderOptions"
          label="Gender"
          :rules="[rules.required('Gender')]"
          prepend-inner-icon="mdi-gender-male-female"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.dateOfBirth"
          label="Date of Birth"
          type="date"
          :rules="[rules.required('Date of birth')]"
          prepend-inner-icon="mdi-calendar"
        />
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model="form.address"
          label="Address"
          prepend-inner-icon="mdi-map-marker"
        />
      </v-col>

      <!-- Academic Info -->
      <v-col cols="12">
        <v-divider class="mb-4" />
        <div class="text-subtitle-2 font-weight-bold text-medium-emphasis mb-3 d-flex align-center ga-2">
          <v-icon size="16">mdi-school</v-icon> Academic Information
        </div>
      </v-col>

      <v-col cols="12" sm="6">
        <v-select
          v-model="form.gradeLevel"
          :items="gradeLevels"
          label="Grade Level"
          :rules="[rules.required('Grade level')]"
          prepend-inner-icon="mdi-numeric"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select
          v-model="form.status"
          :items="statusOptions"
          label="Status"
          :rules="[rules.required('Status')]"
          prepend-inner-icon="mdi-circle"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.enrollmentDate"
          label="Enrollment Date"
          type="date"
          prepend-inner-icon="mdi-calendar-plus"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.gpa"
          label="GPA"
          type="number"
          min="0"
          max="4"
          step="0.1"
          prepend-inner-icon="mdi-star"
        />
      </v-col>

      <!-- Guardian Info -->
      <v-col cols="12">
        <v-divider class="mb-4" />
        <div class="text-subtitle-2 font-weight-bold text-medium-emphasis mb-3 d-flex align-center ga-2">
          <v-icon size="16">mdi-account-supervisor</v-icon> Guardian Information
        </div>
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.guardianName"
          label="Guardian Name"
          prepend-inner-icon="mdi-account-heart"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="form.guardianPhone"
          label="Guardian Phone"
          prepend-inner-icon="mdi-phone"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="form.guardianEmail"
          label="Guardian Email"
          type="email"
          prepend-inner-icon="mdi-email"
        />
      </v-col>

      <v-col cols="12">
        <v-textarea
          v-model="form.notes"
          label="Notes"
          rows="3"
          prepend-inner-icon="mdi-note-text"
          auto-grow
        />
      </v-col>

      <!-- Actions -->
      <v-col cols="12">
        <div class="d-flex ga-3 justify-end">
          <v-btn variant="tonal" rounded="lg" @click="$emit('cancel')">Cancel</v-btn>
          <v-btn
            type="submit"
            color="primary"
            :loading="loading"
            rounded="lg"
            min-width="140"
          >
            <v-icon start>{{ isEdit ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
            {{ isEdit ? 'Save Changes' : 'Add Student' }}
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { GRADE_LEVELS, STUDENT_STATUS } from '@/utils/constants'
import * as validators from '@/utils/validators'

const props = defineProps({
  student: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref()
const isEdit = computed(() => !!props.student)

import { computed } from 'vue'

const defaultForm = () => ({
  firstName: '', lastName: '', email: '', phone: '',
  gender: '', dateOfBirth: '', address: '',
  gradeLevel: '', status: 'active', enrollmentDate: new Date().toISOString().split('T')[0],
  gpa: '', guardianName: '', guardianPhone: '', guardianEmail: '', notes: '',
})

const form = reactive(defaultForm())

watch(() => props.student, (val) => {
  if (val) Object.assign(form, { ...defaultForm(), ...val })
  else Object.assign(form, defaultForm())
}, { immediate: true })

const rules = validators
const gradeLevels = GRADE_LEVELS
const genderOptions = [
  { title: 'Male', value: 'male' },
  { title: 'Female', value: 'female' },
  { title: 'Other', value: 'other' },
]
const statusOptions = Object.entries(STUDENT_STATUS).map(([, v]) => ({
  title: v.charAt(0).toUpperCase() + v.slice(1).replace('_', ' '),
  value: v,
}))

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  emit('submit', { ...form })
}
</script>