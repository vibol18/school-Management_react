<template>
  <div>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="students"
      :loading="loading"
      show-select
      item-value="id"
      class="student-table"
      hover
      :items-per-page="-1"
      hide-default-footer
    >
      <!-- Student Name + Avatar -->
      <template #item.name="{ item }">
        <div class="d-flex align-center ga-3 py-1">
          <v-avatar :color="getAvatarColor(item.firstName)" size="36" rounded="lg">
            <span class="text-body-2 font-weight-bold text-white">{{ getInitials(`${item.firstName} ${item.lastName}`) }}</span>
          </v-avatar>
          <div>
            <div class="text-body-2 font-weight-semibold">{{ item.firstName }} {{ item.lastName }}</div>
            <div class="text-caption text-medium-emphasis mono">{{ item.studentId }}</div>
          </div>
        </div>
      </template>

      <!-- Email -->
      <template #item.email="{ item }">
        <a :href="`mailto:${item.email}`" class="text-body-2 text-primary text-decoration-none">
          {{ item.email }}
        </a>
      </template>

      <!-- Grade -->
      <template #item.gradeLevel="{ item }">
        <v-chip size="small" variant="tonal" color="secondary" rounded="lg">{{ item.gradeLevel }}</v-chip>
      </template>

      <!-- GPA -->
      <template #item.gpa="{ item }">
        <div class="d-flex align-center ga-1">
          <v-icon size="12" :color="gpaColor(item.gpa)">mdi-circle</v-icon>
          <span class="text-body-2 font-weight-medium">{{ item.gpa || '—' }}</span>
        </div>
      </template>

      <!-- Status -->
      <template #item.status="{ item }">
        <v-chip
          :color="STATUS_COLORS[item.status]"
          size="small"
          variant="tonal"
          rounded="lg"
        >
          {{ item.status }}
        </v-chip>
      </template>

      <!-- Enrollment Date -->
      <template #item.enrollmentDate="{ item }">
        <span class="text-caption">{{ formatDate(item.enrollmentDate) }}</span>
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <div class="d-flex ga-1">
          <v-btn icon size="x-small" variant="text" color="info" @click="$emit('view', item)">
            <v-icon size="16">mdi-eye</v-icon>
            <v-tooltip activator="parent" location="top">View</v-tooltip>
          </v-btn>
          <v-btn icon size="x-small" variant="text" @click="$emit('edit', item)">
            <v-icon size="16">mdi-pencil</v-icon>
            <v-tooltip activator="parent" location="top">Edit</v-tooltip>
          </v-btn>
          <v-btn icon size="x-small" variant="text" color="error" @click="$emit('delete', item)">
            <v-icon size="16">mdi-delete</v-icon>
            <v-tooltip activator="parent" location="top">Delete</v-tooltip>
          </v-btn>
        </div>
      </template>

      <!-- Empty state -->
      <template #no-data>
        <div class="text-center py-12">
          <v-icon size="64" color="medium-emphasis" class="mb-4">mdi-account-search</v-icon>
          <div class="text-h6 font-weight-medium">No students found</div>
          <div class="text-medium-emphasis text-body-2 mb-4">Try adjusting your search or filters</div>
          <v-btn color="primary" @click="$emit('add')">
            <v-icon start>mdi-plus</v-icon>Add Student
          </v-btn>
        </div>
      </template>
    </v-data-table>

    <!-- Bulk actions bar -->
    <v-slide-y-transition>
      <div v-if="selected.length > 0" class="bulk-bar d-flex align-center ga-3 px-4 py-2 rounded-lg mt-2">
        <v-icon color="primary">mdi-check-circle</v-icon>
        <span class="text-body-2 font-weight-medium">{{ selected.length }} selected</span>
        <v-spacer />
        <v-btn size="small" variant="tonal" @click="selected = []">Clear</v-btn>
        <v-btn size="small" color="error" variant="tonal" @click="$emit('bulk-delete', selected)">
          <v-icon start size="14">mdi-delete</v-icon>Delete
        </v-btn>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getInitials, getAvatarColor, formatDate } from '@/utils/helpers'
import { STATUS_COLORS } from '@/utils/constants'

defineProps({
  students: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['view', 'edit', 'delete', 'bulk-delete', 'add'])

const selected = ref([])

const headers = [
  { title: 'Student', key: 'name', sortable: false, minWidth: '200px' },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Grade', key: 'gradeLevel', sortable: true },
  { title: 'GPA', key: 'gpa', sortable: true, align: 'center' },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Enrolled', key: 'enrollmentDate', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center', width: '120px' },
]

const gpaColor = (gpa) => {
  const g = Number(gpa)
  if (g >= 3.7) return 'success'
  if (g >= 3.0) return 'info'
  if (g >= 2.0) return 'warning'
  return 'error'
}
</script>

<style scoped>
.student-table { border-radius: 12px; }
.mono { font-family: 'JetBrains Mono', monospace !important; }
.bulk-bar {
  background: rgba(var(--v-theme-primary), 0.08);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}
</style>