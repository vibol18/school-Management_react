<template>
  <v-main class="auth-layout">
    <div class="auth-bg">
      <!-- Animated background shapes -->
      <div class="shape shape-1" />
      <div class="shape shape-2" />
      <div class="shape shape-3" />
    </div>
    <v-container fluid class="fill-height pa-0">
      <v-row class="fill-height ma-0" no-gutters>
        <!-- Left Panel - Branding -->
        <v-col cols="12" md="6" class="d-none d-md-flex brand-panel align-center justify-center">
          <div class="brand-content text-center pa-12">
            <div class="brand-logo mb-6">
              <v-icon size="64" color="white">mdi-school</v-icon>
            </div>
            <h1 class="text-h3 font-weight-black text-white mb-4">EduManage Pro</h1>
            <p class="text-h6 text-white-darken-1 mb-8 font-weight-regular">
              The complete school management platform for modern institutions
            </p>
            <div class="feature-list">
              <div v-for="feat in features" :key="feat" class="feat-item d-flex align-center ga-3 mb-4">
                <v-icon color="white" size="20">mdi-check-circle</v-icon>
                <span class="text-white text-body-1">{{ feat }}</span>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Right Panel - Form -->
        <v-col cols="12" md="6" class="d-flex align-center justify-center pa-4 pa-sm-8">
          <div class="auth-form-wrapper" style="width:100%;max-width:480px">
            <!-- Mobile Logo -->
            <div class="d-md-none text-center mb-8">
              <v-icon size="48" color="primary">mdi-school</v-icon>
              <h2 class="text-h5 font-weight-bold mt-2">EduManage Pro</h2>
            </div>
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
const features = [
  'Student & Teacher Management',
  'Course & Attendance Tracking',
  'Payment & Fee Management',
  'Analytics & Reports',
]
</script>

<style scoped>
.auth-layout { min-height: 100vh; position: relative; overflow: hidden; }

.auth-bg {
  position: fixed; inset: 0; z-index: 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.brand-panel {
  background: linear-gradient(135deg, #3B5BDB 0%, #7048E8 100%);
  position: relative; z-index: 1;
}

.v-theme--dark .auth-bg {
  background: linear-gradient(135deg, #0D1117 0%, #161B22 100%);
}

.shape {
  position: absolute; border-radius: 50%; opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}
.shape-1 { width: 400px; height: 400px; background: #3B5BDB; top: -100px; right: -100px; }
.shape-2 { width: 300px; height: 300px; background: #7048E8; bottom: -50px; left: -80px; animation-delay: -2s; }
.shape-3 { width: 200px; height: 200px; background: #F59F00; top: 50%; right: 20%; animation-delay: -4s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.auth-form-wrapper { position: relative; z-index: 1; }
.feat-item { text-align: left; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>