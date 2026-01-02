<template>
  <div class="auth-container">
    <div class="auth-box">
      <h1>Register</h1>

      <label>Username *</label>
      <input
        v-model="username"
        type="text"
        placeholder="Choose username"
        @blur="touched.username = true"
      />
      <p class="err" v-if="touched.username && !rules.username(username)">
        Username must be 2–32 characters.
      </p>

      <label>Password *</label>
      <input
        v-model="password"
        type="password"
        placeholder="Create password"
        @blur="touched.password = true"
      />
      <p class="err" v-if="touched.password && !rules.password(password)">
        Password must be 8–128 characters.
      </p>

      <label>Confirm Password *</label>
      <input
        v-model="confirmPassword"
        type="password"
        placeholder="Repeat password"
        @blur="touched.confirmPassword = true"
      />
      <p class="err" v-if="touched.confirmPassword && !rules.confirmPassword(confirmPassword)">
        Passwords must match.
      </p>

      <button class="auth-btn small" type="button" @click="register" :disabled="!isValid">
        Create account
      </button>

      <p class="auth-link">
        Already have an account?
        <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { apiPost } from '@/api/client'
import { useRouter } from 'vue-router'
import { getErrorMessage } from '@/utils/errorHandler'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const toast = useToastStore()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')

const touched = reactive({
  username: false,
  password: false,
  confirmPassword: false,
})

const rules = {
  username: (v: string) => {
    const len = v.trim().length
    return len >= 2 && len <= 32
  },
  password: (v: string) => {
    const len = v.trim().length
    return len >= 8 && len <= 128
  },
  confirmPassword: (v: string) => {
    const len = v.trim().length
    return len >= 8 && len <= 128 && v === password.value
  },
}

const isValid = computed(
  () =>
    rules.username(username.value) &&
    rules.password(password.value) &&
    rules.confirmPassword(confirmPassword.value),
)

async function register() {
  touched.username = true
  touched.password = true
  touched.confirmPassword = true

  if (!isValid.value) return

  try {
    const payload = {
      username: username.value.trim(),
      password: password.value,
    }

    type RegisterResponse = {
      failed?: boolean
      user_id?: string
      code?: string
    }

    const res = await apiPost<typeof payload, RegisterResponse>('/auth/register', payload)

    if (res.failed) {
      toast.showError(getErrorMessage(res.code))
      return
    }

    toast.showInfo('Account created successfully. Now log in!')

    // Reset fields
    username.value = ''
    password.value = ''
    confirmPassword.value = ''
    touched.username = touched.password = touched.confirmPassword = false

    router.push('/login')
  } catch (err) {
    toast.showError(getErrorMessage(err))
  }
}
</script>

<style scoped src="../assets/auth.css"></style>
