<template>
  <div class="app-shell">
    <Navbar />
    <main class="content">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navbar from './components/AppNavbar.vue'
import Footer from './components/AppFooter.vue'
import { RouterView } from 'vue-router'
</script>

<style scoped>
.app-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
.content {
  flex: 1; /* zauzima prostor između nav i footer */
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 20px;
}
</style>

<style>
html,
body {
  margin: 0;
  overflow-x: hidden;
}
img {
  max-width: 100%;
  display: block;
}
</style>
