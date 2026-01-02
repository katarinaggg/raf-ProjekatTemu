<template>
  <transition name="fade">
    <div v-if="toast.visible" class="toast" :class="toast.type">
      <span v-if="toast.type === 'error'" class="icon">⚠️</span>
      {{ toast.message }}
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
const toast = useToastStore()
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  padding: 18px 26px;
  border-radius: 18px;
  font-size: 17px;
  font-weight: 600;

  display: flex;
  align-items: center;
  gap: 10px;

  border: 2px solid;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
  z-index: 9999;

  animation: popFade 0.25s ease-out;
}

.toast.info {
  background: #cfe7ff;
  border-color: #8bb7e0;
  color: #1a2b45;
}

.toast.error {
  background: #9e4c4c;
  border-color: #682d2d;
  color: #ffffff;
}

.icon {
  font-size: 20px;
  display: flex;
  align-items: center;
}

@keyframes popFade {
  0% {
    transform: translateY(10px) scale(0.9);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.5s,
    transform 0.5s;
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
