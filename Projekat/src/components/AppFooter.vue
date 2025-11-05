<template>
  <footer class="footer">
    <div class="foot-wrap">
      <span class="brand">Temu sa Temua</span>
      <span class="sep">•</span>
      <span>© {{ new Date().getFullYear() }} All rights reserved</span>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped>
.footer {
  background: #ffe2e2;
  color: #594c4c;
  border-top: 1px solid #ffe2e2;
  height: 56px;
  display: flex;
  align-items: center;
  font-size: 16px;
}
.foot-wrap {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;

  display: flex;
  justify-content: center;
  align-items: center;

  gap: 10px;
  font-size: 14px;
  text-align: center;
}

.brand {
  font-weight: 700;
}
.sep {
  opacity: 0.6;
}
</style>
