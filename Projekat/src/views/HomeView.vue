<template>
  <section class="hero-bg">
    <div class="hero-copy">
      <h1>Temu sa Temua</h1>
      <p>Your Favorite Items, Just a Click Away</p>

      <RouterLink to="/products" class="cta">Shop Now</RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
/* Skini ograničenja širine iz App.vue SAMO na ovoj stranici */
:global(.content) {
  max-width: none !important;
  padding: 0 !important;
  margin: 0 !important;
  width: 100% !important;
}

/* HERO sekcija: pozadina preko cele širine, bez skrola */
.hero-bg {
  width: 100%;
  min-height: calc(100dvh - 60px - 56px); /* visina ekrana - navbar - footer */
  background: url('/pozadina.png') center / cover no-repeat;
  display: flex;
  align-items: center;
}

/* prozorcic sa tekstom i dugmetom */
.hero-copy {
  margin-left: clamp(16px, 6vw, 80px);
  padding: clamp(20px, 3vw, 32px);
  border-radius: 16px;

  background: #ffeded;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);

  max-width: min(720px, 70vw);

  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero-copy h1 {
  margin: 0 0 6px;
  font-size: clamp(28px, 4.2vw, 44px);
  font-weight: 800;
  letter-spacing: 0.3px;
  color: #3e3333;
}

.hero-copy p {
  margin: 0 0 18px;
  font-size: clamp(14px, 1.8vw, 18px);
  font-weight: 500;
  color: #4e4343;
  opacity: 0.9;
}

/* CTA dugme */
.cta {
  display: inline-block;
  padding: 12px 22px;
  border-radius: 10px;
  text-decoration: none;

  background: #e7a8a8;
  color: #3e3333;
  font-weight: 700;
  font-size: 15px;

  transition: 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.cta:hover {
  background: #d69292;
  color: white;
}
</style>
