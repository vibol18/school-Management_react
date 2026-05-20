<template>
  <v-layout class="admin-layout">
    <!-- Sidebar -->
    <Sidebar v-model="drawer" :rail="rail" @toggle-rail="rail = !rail" />

    <!-- Navbar -->
    <Navbar
      :drawer="drawer"
      @toggle-drawer="drawer = !drawer"
    />

    <!-- Main Content -->
    <v-main class="main-content">
      <v-container fluid class="pa-4 pa-md-6">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>

    <!-- Footer -->
    <Footer />
  </v-layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from '@/components/common/Sidebar.vue'
import Navbar from '@/components/common/Navbar.vue'
import Footer from '@/components/common/Footer.vue'

const drawer = ref(true)
const rail = ref(false)

const handleResize = () => {
  if (window.innerWidth < 960) {
    drawer.value = false
    rail.value = false
  } else {
    drawer.value = true
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.admin-layout { min-height: 100vh; }
.main-content { background: rgb(var(--v-theme-background)); }

.page-enter-active, .page-leave-active { transition: all 0.18s ease; }
.page-enter-from { opacity: 0; transform: translateY(6px); }
.page-leave-to { opacity: 0; transform: translateY(-6px); }
</style>