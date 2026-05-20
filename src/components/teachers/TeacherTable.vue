<template>
  <v-data-table
    :headers="headers"
    :items="teachers"
    :loading="loading"
    class="teacher-table"
    hover
    :items-per-page="-1"
    hide-default-footer
  >
    <template #item.name="{ item }">
      <div class="d-flex align-center ga-3 py-1">
        <v-avatar :color="getAvatarColor(item.department)" size="36" rounded="lg">
          <span class="text-body-2 font-weight-bold text-white">{{ getInitials(`${item.firstName} ${item.lastName}`) }}</span>
        </v-avatar>
        <div>
          <div class="text-body-2 font-weight-semibold">{{ item.firstName }} {{ item.lastName }}</div>
          <div class="text-caption text-medium-emphasis mono">{{ item.teacherId }}</div>
        </div>
      </div>
    </template>

    <template #item.email="{ item }">
      <a :href="`mailto:${item.email}`" class="text-body-2 text-primary text-decoration-none">{{ item.email }}</a>
    </template>

    <template #item.department="{ item }">
      <v-chip size="small" variant="tonal" color="secondary" rounded="lg">{{ item.department }}</v-chip>
    </template>

    <template #item.salary="{ item }">
      <span class="text-body-2 font-weight-medium">{{ formatCurrency(item.salary) }}</span>
    </template>

    <template #item.status="{ item }">
      <v-chip :color="STATUS_COLORS[item.status]" size="small" variant="tonal" rounded="lg">
        {{ item.status?.replace('_', ' ') }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <div class="d-flex ga-1">
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

    <template #no-data>
      <div class="text-center py-12">
        <v-icon size="64" color="medium-emphasis" class="mb-4">mdi-account-search</v-icon>
        <div class="text-h6 font-weight-medium">No teachers found</div>
        <v-btn color="primary" class="mt-4" @click="$emit('add')">
          <v-icon start>mdi-plus</v-icon>Add Teacher
        </v-btn>
      </div>
    </template>
  </v-data-table>
</template>

<script setup>
import { getInitials, getAvatarColor, formatCurrency } from '@/utils/helpers'
import { STATUS_COLORS } from '@/utils/constants'

defineProps({
  teachers: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['edit', 'delete', 'add'])

const headers = [
  { title: 'Teacher', key: 'name', sortable: false, minWidth: '200px' },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Department', key: 'department', sortable: true },
  { title: 'Experience', key: 'experience', sortable: true, align: 'center' },
  { title: 'Salary', key: 'salary', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center', width: '100px' },
]
</script>

<style scoped>
.mono { font-family: 'JetBrains Mono', monospace !important; }
</style>