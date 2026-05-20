<template>
  <div class="d-flex flex-column flex-sm-row align-center justify-space-between ga-3 mt-4">
    <div class="d-flex align-center ga-3">
      <span class="text-caption text-medium-emphasis">Rows per page:</span>
      <v-select
        :model-value="itemsPerPage"
        :items="perPageOptions"
        density="compact"
        variant="outlined"
        hide-details
        style="width:80px"
        @update:model-value="$emit('update:itemsPerPage', Number($event))"
      />
      <span class="text-caption text-medium-emphasis">
        {{ rangeText }}
      </span>
    </div>

    <v-pagination
      :model-value="currentPage"
      :length="totalPages"
      :total-visible="5"
      density="compact"
      rounded="lg"
      active-color="primary"
      @update:model-value="$emit('update:currentPage', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ITEMS_PER_PAGE_OPTIONS } from '@/utils/constants'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  itemsPerPage: { type: Number, required: true },
  totalItems: { type: Number, required: true },
})

defineEmits(['update:currentPage', 'update:itemsPerPage'])

const perPageOptions = ITEMS_PER_PAGE_OPTIONS

const rangeText = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage + 1
  const end = Math.min(props.currentPage * props.itemsPerPage, props.totalItems)
  return props.totalItems > 0 ? `${start}–${end} of ${props.totalItems}` : 'No results'
})
</script>