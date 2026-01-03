<template>
  <section class="profile-wrap">
    <div class="user-info">
      <span class="avatar">👤</span>
      <span class="username">{{ auth.username }}</span>
    </div>

    <h1 class="title">My Orders</h1>

    <div v-if="loading" class="loader">Loading...</div>

    <p v-else-if="orders.length === 0" class="empty">No orders yet</p>

    <div v-else class="orders-grid">
      <div v-for="o in orders" :key="o.order_id" class="order-card">
        <div class="total">Total: ${{ o.value.toFixed(2) }}</div>

        <div class="middle-row">
          <span class="price"> ${{ (o.value / o.quantity).toFixed(2) }} </span>
          <span class="qty">Quantity: {{ o.quantity }}</span>
        </div>

        <div class="bottom-row">
          <small class="time">{{ timeAgo(o.created_at) }}</small>
          <span class="id-tag">ID: {{ o.order_id.slice(0, 6) }}...</span>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page === 1" @click="prevPage">Previous</button>

      <button
        v-for="n in totalPages"
        :key="n"
        @click="goToPage(n)"
        :class="['page-btn', { active: page === n }]"
      >
        {{ n }}
      </button>

      <button :disabled="page === totalPages" @click="nextPage">Next</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { apiGet } from '@/api/client'
import { getErrorMessage } from '@/utils/errorHandler'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

type Order = {
  order_id: string
  product_value: number
  quantity: number
  value: number
  created_at: string
}

const toast = useToastStore()
const auth = useAuthStore()

const orders = ref<Order[]>([])
const loading = ref(true)

const page = ref(1)
const totalPages = ref(1)

async function fetchOrders() {
  loading.value = true

  try {
    const res = await apiGet<{
      orders: Order[]
      total: number
    }>(`/orders/${auth.userId}`, {
      query: { limit: 10, page: page.value },
      token: auth.token ?? undefined,
    })

    orders.value = res.orders
    totalPages.value = Math.ceil(res.total / 10)
  } catch (err) {
    toast.showError(getErrorMessage(err))
    orders.value = []
  }

  loading.value = false
}

function prevPage() {
  if (page.value > 1) page.value--
}

function nextPage() {
  if (page.value < totalPages.value) page.value++
}

function goToPage(n: number) {
  page.value = n
}

// Refresh when page changes
watch(page, fetchOrders)
onMounted(fetchOrders)

function timeAgo(timestamp: string) {
  const now = new Date()
  const past = new Date(timestamp)
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  return `${Math.floor(diff / 86400)} days ago`
}
</script>

<style scoped>
.profile-wrap {
  max-width: 1400px;
  margin: 28px auto;
  padding: 0 20px;
}

.user-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  background: #ffe2e2;
  padding: 10px 20px;
  width: fit-content;
  border-radius: 18px;
  font-weight: 600;
  color: #4e4343;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 4px 12px rgba(231, 168, 168, 0.25);
  border: 1px solid #e6c3c3;
}

.avatar {
  font-size: 22px;
}

.username {
  font-size: 18px;
}

.title {
  font-size: 32px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 30px;
  color: #3e3333;
}

.orders-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 36px;
  justify-content: center;
  padding-top: 10px;
}

.order-card {
  width: 300px;
  background: #fffafa;
  border: 2px solid #e6c3c3;
  border-radius: 18px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.05);
  transition: 0.25s;
}

.order-card:hover {
  background: #ffecec;
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 12px 25px rgba(231, 168, 168, 0.35);
  border-color: #e7a8a8;
}

.total {
  font-size: 24px;
  font-weight: bold;
  color: #c25151;
}

.middle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 20px;
  font-weight: bold;
  color: #2b8d2b;
}

.qty {
  font-size: 18px;
  color: #4e4343;
}

.bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time {
  font-size: 14px;
  color: #6f5e5e;
}

.id-tag {
  background: #cbf4ff;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 14px;
  color: #3c5e6b;
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
}

.pagination button {
  border: 1px solid #e6c3c3;
  background: #fffafa;
  padding: 6px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.25s;
  font-size: 14px;
  font-weight: 600;
  color: #4e4343;
}

.page-btn.active {
  background: #e7a8a8;
  color: white;
  border-color: #e7a8a8;
  box-shadow: 0px 2px 6px rgba(231, 168, 168, 0.5);
}

.loader,
.empty {
  text-align: center;
  margin-top: 30px;
  font-size: 18px;
  color: #634f4f;
}
</style>
