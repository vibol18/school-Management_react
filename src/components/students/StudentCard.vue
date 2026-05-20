<template>
  <v-card class="student-card" rounded="xl" hover @click="$emit('click', student)">
    <v-card-text class="pa-5">
      <div class="d-flex align-start ga-3">
        <!-- Avatar -->
        <v-avatar
          :color="avatarColor"
          size="52"
          rounded="xl"
          class="flex-shrink-0"
        >
          <span class="text-h6 font-weight-bold text-white">{{ initials }}</span>
        </v-avatar>

        <!-- Info -->
        <div class="flex-grow-1 min-w-0">
          <div class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold text-truncate">
              {{ student.firstName }} {{ student.lastName }}
            </div>
            <v-chip
              :color="statusColor"
              size="x-small"
              variant="tonal"
              class="ms-2 flex-shrink-0"
            >
              {{ student.status }}
            </v-chip>
          </div>
          <div class="text-caption text-medium-emphasis mt-0.5 mono">{{ student.studentId }}</div>
          <div class="text-caption text-medium-emphasis mt-1">{{ student.gradeLevel }}</div>
        </div>
      </div>

      <v-divider class="my-3" />

      <!-- Stats row -->
      <div class="d-flex justify-space-between">
        <div class="text-center">
          <div class="text-subtitle-2 font-weight-bold" :class="gpaColor">{{ student.gpa || '—' }}</div>
          <div class="text-caption text-medium-emphasis">GPA</div>
        </div>
        <div class="text-center">
          <div class="text-subtitle-2 font-weight-bold">{{ age || '—' }}</div>
          <div class="text-caption text-medium-emphasis">Age</div>
        </div>
        <div class="text-center">
          <div class="text-subtitle-2 font-weight-bold">{{ enrollYear }}</div>
          <div class="text-caption text-medium-emphasis">Enrolled</div>
        </div>
      </div>
    </v-card-text>

    <!-- Actions -->
    <v-card-actions class="pt-0 px-5 pb-4 ga-1">
      <v-btn
        variant="tonal"
        size="small"
        color="primary"
        rounded="lg"
        @click.stop="$emit('view', student)"
      >
        <v-icon size="14" start>mdi-eye</v-icon>View
      </v-btn>
      <v-btn
        variant="tonal"
        size="small"
        rounded="lg"
        @click.stop="$emit('edit', student)"
      >
        <v-icon size="14" start>mdi-pencil</v-icon>Edit
      </v-btn>
      <v-spacer />
      <v-btn
        icon
        size="small"
        variant="text"
        color="error"
        @click.stop="$emit('delete', student)"
      >
        <v-icon size="16">mdi-delete-outline</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { getInitials, getAvatarColor, calculateAge } from '@/utils/helpers'
import { STATUS_COLORS } from '@/utils/constants'

const props = defineProps({ student: { type: Object, required: true } })
defineEmits(['click', 'view', 'edit', 'delete'])

const initials = computed(() => getInitials(`${props.student.firstName} ${props.student.lastName}`))
const avatarColor = computed(() => getAvatarColor(props.student.firstName))
const statusColor = computed(() => STATUS_COLORS[props.student.status] || 'default')
const age = computed(() => calculateAge(props.student.dateOfBirth))
const enrollYear = computed(() => {
  if (!props.student.enrollmentDate) return '—'
  const date = new Date(props.student.enrollmentDate)
  return Number.isNaN(date.getFullYear()) ? '—' : String(date.getFullYear())
})

const gpaColor = computed(() => {
  const gpa = Number(props.student.gpa)
  if (gpa >= 3.7) return 'text-success'
  if (gpa >= 3.0) return 'text-info'
  if (gpa >= 2.0) return 'text-warning'
  return 'text-error'
})
</script>

<style scoped>
.student-card { transition: all 0.2s ease; cursor: pointer; }
.student-card:hover { transform: translateY(-2px); }
.mono { font-family: 'JetBrains Mono', monospace !important; }
</style>