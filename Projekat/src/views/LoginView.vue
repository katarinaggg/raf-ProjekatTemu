<template>
  <div class="auth-container">
    <div class="auth-box">
      <h1>Login</h1>

      <label>Username *</label>
      <input
        v-model="username"
        type="text"
        placeholder="Enter username"
        @blur="touched.username = true"
      />
      <p class="err" v-if="touched.username && !rules.username(username)">
        Username must be 2–32 characters.
      </p>

      <label>Password *</label>
      <input
        v-model="password"
        type="password"
        placeholder="Enter password"
        @blur="touched.password = true"
      />
      <p class="err" v-if="touched.password && !rules.password(password)">
        Password must be 8–128 characters.
      </p>

      <button class="auth-btn small" @click="loginHandler" :disabled="!isValid || auth.loading">
        {{ auth.loading ? 'Logging in...' : 'Login' }}
      </button>

      <p class="auth-link">
        Don't have an account?
        <router-link to="/register">Register</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')

const touched = reactive({
  username: false,
  password: false,
})

const rules = {
  username: (v: string) => v.trim().length >= 2 && v.trim().length <= 32,
  password: (v: string) => v.trim().length >= 8 && v.trim().length <= 128,
}

const isValid = computed(() => rules.username(username.value) && rules.password(password.value))

async function loginHandler() {
  touched.username = true
  touched.password = true

  if (!isValid.value) return

  await auth.login(username.value.trim(), password.value)

  const toast = useToastStore()

  if (auth.error) {
    toast.showError(auth.error)
    return
  }

  if (!auth.error && auth.token) {
    toast.showInfo(`Welcome, ${username.value}! `)
    router.push('/') // redirect posle uspešnog login-a
  }
}
</script>

<style scoped src="../assets/auth.css"></style>
