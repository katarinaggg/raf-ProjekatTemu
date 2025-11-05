<template>
  <header class="navbar">
    <div class="left">
      <RouterLink to="/" class="brand" aria-label="Home">
        <img src="/logo1.png" alt="Temu sa Temua" class="logo" />
      </RouterLink>

      <nav class="nav-left">
        <RouterLink to="/" class="link">Home</RouterLink>
        <RouterLink to="/create" class="link">New</RouterLink>
        <RouterLink to="/products" class="link">Products</RouterLink>
        <RouterLink to="/me" class="link">My Profile</RouterLink>
      </nav>
    </div>

    <nav class="nav-right">
      <RouterLink to="/login" class="link">Login</RouterLink>
      <RouterLink to="/register" class="link">Register</RouterLink>
      <RouterLink to="/logout" class="link">Logout</RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.navbar {
  width: 100%;
  background: #ffe2e2;
  border-bottom: 1px solid #ffe2e2;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  overflow: visible;
}

/* leva grupa: logo + linkovi */
.left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 1 auto;
  min-width: 0;
}

/* logo */
.logo {
  height: 44px;
  width: auto;
  border-radius: 8px;
  object-fit: contain;
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
}

.nav-right {
  flex: 0 0 auto;
  margin-left: auto;
}

/* linkovi */
.link {
  text-decoration: none;
  color: #594c4c;
  font-size: 16px;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: 8px;
  transition: 0.2s ease;
  white-space: nowrap;
}
.link:hover,
.link.router-link-active {
  background: #e7a8a8;
  color: #fff;
  font-weight: 600;
}

/* “skupljanje” na užim širinama da sve stane u jedan red */
@media (max-width: 1200px) {
  .logo {
    height: 40px;
  }
  .link {
    font-size: 13.5px;
    padding: 5px 9px;
  }
}
@media (max-width: 1024px) {
  .logo {
    height: 38px;
  }
  .nav-left,
  .nav-right {
    gap: 8px;
  }
  .link {
    font-size: 13px;
    padding: 5px 8px;
  }
}
</style>
