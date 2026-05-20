<template>
  <v-card class="teacher-card" rounded="xl" hover @click="$emit('click', teacher)">
    <v-card-text class="pa-5">
      <div class="d-flex align-start ga-3">
        <v-avatar :color="avatarColor" size="52" rounded="xl" class="flex-shrink-0">
          <span class="text-h6 font-weight-bold text-white">{{ initials }}</span>
        </v-avatar>
        <div class="flex-grow-1 min-w-0">
          <div class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold text-truncate">
              {{ teacher.firstName }} {{ teacher.lastName }}
            </div>
            <v-chip :color="statusColor" size="x-small" variant="tonal" class="ms-2 flex-shrink-0">
              {{ teacher.status?.replace('_', ' ') }}
            </v-chip>
          </div>
          <div class="text-caption text-medium-emphasis mono">{{ teacher.teacherId }}</div>
          <div class="text-caption mt-1">
            <v-icon size="12" class="me-1">mdi-domain</v-icon>{{ teacher.department }}
          </div>
        </div>
      </div>

      <div class="text-caption text-medium-emphasis mt-3 d-flex align-center ga-1">
        <v-icon size="14">mdi-certificate</v-icon>
        {{ teacher.qualification || '—' }}
      </div>
      <div class="text-caption text-medium-emphasis mt-1 d-flex align-center ga-1">
        <v-icon size="14">mdi-briefcase</v-icon>
        {{ teacher.specialization || '—' }}
      </div>

      <v-divider class="my-3" />

      <div class="d-flex justify-space-between text-center">
        <div>
          <div class="text-subtitle-2 font-weight-bold">{{ teacher.experience || 0 }}yr</div>
          <div class="text-caption text-medium-emphasis">Experience</div>
        </div>
        <div>
          <div class="text-subtitle-2 font-weight-bold">{{ joinYear }}</div>
          <div class="text-caption text-medium-emphasis">Joined</div>
        </div>
        <div>
          <div class="text-subtitle-2 font-weight-bold">{{ salaryFormatted }}</div>
          <div class="text-caption text-medium-emphasis">Salary</div>
        </div>
      </div>
    </v-card-text>

    <v-card-actions class="pt-0 px-5 pb-4 ga-1">
      <v-btn variant="tonal" size="small" color="primary" rounded="lg" @click.stop="$emit('edit', teacher)">
        <v-icon size="14" start>mdi-pencil</v-icon>Edit
      </v-btn>
      <v-btn variant="tonal" size="small" rounded="lg" @click.stop="$emit('view', teacher)">
        <v-icon size="14" start>mdi-eye</v-icon>View
      </v-btn>
      <v-spacer />
      <v-btn icon size="small" variant="text" color="error" @click.stop="$emit('delete', teacher)">
        <v-icon size="16">mdi-delete-outline</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { getInitials, getAvatarColor, formatCurrency } from '@/utils/helpers'
import { STATUS_COLORS } from '@/utils/constants'

const props = defineProps({ teacher: { type: Object, required: true } })
defineEmits(['click', 'view', 'edit', 'delete'])

const initials = computed(() => getInitials(`${props.teacher.firstName} ${props.teacher.lastName}`))
const avatarColor = computed(() => getAvatarColor(props.teacher.department || props.teacher.firstName))
const statusColor = computed(() => STATUS_COLORS[props.teacher.status] || 'default')
const joinYear = computed(() => {
  if (!props.teacher.joinDate) return '—'
  const date = new Date(props.teacher.joinDate)
  return Number.isNaN(date.getFullYear()) ? '—' : String(date.getFullYear())
})
const salaryFormatted = computed(() => props.teacher.salary ? `$${Math.round(props.teacher.salary / 1000)}k` : '—')
</script>

<style scoped>
.teacher-card { transition: all 0.2s ease; cursor: pointer; }
.teacher-card:hover { transform: translateY(-2px); }
.mono { font-family: 'JetBrains Mono', monospace !important; }
</style>