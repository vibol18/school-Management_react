<template>
  <v-app>
    <router-view />
    <!-- Global Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="bottom right"
      rounded="lg"
    >
      <div class="d-flex align-center ga-2">
        <v-icon :icon="snackbar.icon" size="small" />
        {{ snackbar.message }}
      </div>
      <template #actions>
        <v-btn variant="text" size="small" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { reactive } from 'vue'

// Global snackbar state — provide/inject pattern
const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle',
  timeout: 3000,
})

// Expose globally via app-level provide would go in main.js
// For now using window-level event bus for simplicity
window.$notify = ({ message, color = 'success', timeout = 3000 }) => {
  const icons = { success: 'mdi-check-circle', error: 'mdi-alert-circle', warning: 'mdi-alert', info: 'mdi-information' }
  snackbar.message = message
  snackbar.color = color
  snackbar.icon = icons[color] || 'mdi-information'
  snackbar.timeout = timeout
  snackbar.show = true
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

* {
  font-family: 'Plus Jakarta Sans', sans-serif !important;
}

code, pre, .mono {
  font-family: 'JetBrains Mono', monospace !important;
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.3); }

.v-theme--dark ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); }
.v-theme--dark ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }

.page-enter-active, .page-leave-active { transition: all 0.2s ease; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to { opacity: 0; transform: translateY(-8px); }

.stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.stat-card:hover { transform: translateY(-3px); }
</style>