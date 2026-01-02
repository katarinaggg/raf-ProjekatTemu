<template>
  <section class="products-wrap">
    <h1 class="title">Products</h1>

    <div class="filter-bar">
      <button class="filter-btn" :class="{ active: filter === 'all' }" @click="setFilter('all')">
        All
      </button>

      <button
        v-if="auth.token"
        class="filter-btn"
        :class="{ active: filter === 'mine' }"
        @click="setFilter('mine')"
      >
        My Gallery
      </button>
    </div>

    <div v-if="loading" class="loader">Loading...</div>

    <p v-if="!loading && products.length === 0" class="empty">No products found.</p>

    <div class="grid" v-if="!loading && products.length > 0">
      <router-link
        v-for="p in products"
        :key="p.product_id"
        :to="`/products/${p.product_id}`"
        class="card-link"
      >
        <div class="card">
          <img :src="p.image_url" class="thumb" />

          <div class="title-row">
            <input v-if="editingId === p.product_id" v-model="editedTitle" class="edit-input" />
            <h3 v-else>{{ p.title }}</h3>

            <div v-if="isOwner(p)" class="card-actions">
              <span
                v-if="editingId === p.product_id"
                class="icon save"
                @click.stop.prevent="saveTitle(p)"
                >💾</span
              >

              <span
                v-if="editingId === p.product_id"
                class="icon cancel"
                @click.stop.prevent="cancelEdit"
                >❌</span
              >

              <span
                v-if="editingId !== p.product_id"
                class="icon edit"
                @click.stop.prevent="enableEdit(p)"
                >✏️</span
              >

              <span class="icon delete" @click.stop.prevent="deleteProduct(p.product_id)">🗑️</span>
            </div>
          </div>

          <small class="creator link" @click.stop.prevent="filterByCreator(p.creator.user_id)">
            {{ p.creator.username }}
          </small>
          <p class="time">{{ timeAgo(p.created_at) }}</p>
        </div>
      </router-link>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page === 1" @click="prevPage">Previous</button>

      <span class="dots" v-if="pagesToShow.length > 0 && pagesToShow[0]! > 1">...</span>

      <button
        v-for="n in pagesToShow"
        :key="n"
        @click="goToPage(n)"
        :class="['page-btn', { active: page === n }]"
      >
        {{ n }}
      </button>

      <span
        class="dots"
        v-if="pagesToShow.length > 0 && pagesToShow[pagesToShow.length - 1]! < totalPages"
        >...</span
      >

      <button :disabled="page === totalPages" @click="nextPage">Next</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { apiPatch, apiDelete, apiGet } from '@/api/client'
import { getErrorMessage } from '@/utils/errorHandler'
import { useToastStore } from '@/stores/toast'
import { useRoute, useRouter } from 'vue-router'

const toast = useToastStore()
const route = useRoute()
const router = useRouter()

type Product = {
  product_id: string
  title: string
  description?: string
  image_url: string
  price: number
  quantity: number
  created_at: string
  updated_at: string
  creator: {
    user_id: string
    username: string
  }
}

// STATE
const loading = ref(true)
const products = ref<Product[]>([])
const page = ref(1)
const totalPages = ref(1)
const filter = ref<'all' | 'mine' | 'creator'>('all')

async function fetchProducts() {
  loading.value = true

  type ProductsQuery = {
    page: number
    limit: number
    creator?: string
  }

  try {
    const query: ProductsQuery = {
      page: page.value,
      limit: 10,
    }

    // Ako postoji query param creator → filtriraj po njemu
    if (route.query.creator && typeof route.query.creator === 'string') {
      filter.value = 'creator'
      query.creator = route.query.creator
    }
    // Ako je `My Gallery`
    else if (filter.value === 'mine' && auth.userId) {
      query.creator = auth.userId
    }

    const response = await apiGet<{
      products: Product[]
      total: number
    }>('/products', {
      query,
      token: auth.token ?? undefined,
    })

    //console.log('dužina niza sa backenda:', response.products.length)

    products.value = response.products
    totalPages.value = Math.ceil(response.total / 10)
  } catch (err) {
    toast.showError(getErrorMessage(err))
    products.value = []
    totalPages.value = 1
  }

  loading.value = false
}

function setFilter(val: 'all' | 'mine') {
  //filter.value = val
  page.value = 1

  if (route.query.creator) {
    router.replace({ query: {} }).then(() => {
      filter.value = val
    })
  } else {
    filter.value = val
  }
}

const pagesToShow = computed(() => {
  const max = 5
  const start = Math.max(1, page.value - 2)
  const end = Math.min(totalPages.value, start + max - 1)

  const arr = []
  for (let i = start; i <= end; i++) arr.push(i)
  return arr
})

function prevPage() {
  if (page.value > 1) page.value--
}

function nextPage() {
  if (page.value < totalPages.value) page.value++
}

function goToPage(n: number) {
  page.value = n
}

watch([page, filter, () => route.query.creator], () => {
  // ako postoji creator iz URL → koristi taj filter
  if (route.query.creator) {
    filter.value = 'creator'
  }

  // ako nema creator-a u URL i filter je creator → reset na all
  if (!route.query.creator && filter.value === 'creator') {
    filter.value = 'all'
  }

  fetchProducts()
})

onMounted(fetchProducts)

// pomocna fja za formatiranje vremena kreiranja
function timeAgo(timestamp: string) {
  const now = new Date()
  const past = new Date(timestamp)
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  return `${Math.floor(diff / 86400)} days ago`
}

import { useAuthStore } from '../stores/auth'
const auth = useAuthStore()

const editingId = ref<string | null>(null)
const editedTitle = ref('')

function isOwner(product: Product) {
  return auth.token !== null && product.creator.user_id === auth.userId
}

function enableEdit(product: Product) {
  editingId.value = product.product_id
  editedTitle.value = product.title
}

function cancelEdit() {
  editingId.value = null
  editedTitle.value = ''
}

async function saveTitle(product: Product) {
  if (!editedTitle.value.trim()) return

  try {
    await apiPatch(
      `/products/${product.product_id}`,
      { title: editedTitle.value },
      auth.token ?? undefined,
    )

    product.title = editedTitle.value

    toast.showInfo('Product updated!')

    cancelEdit()
  } catch (err) {
    toast.showError(getErrorMessage(err))
  }
}

async function deleteProduct(id: string) {
  if (!confirm('Are you sure you want to delete this product?')) return

  try {
    await apiDelete(`/products/${id}`, auth.token ?? undefined)
    products.value = products.value.filter((p) => p.product_id !== id)
    toast.showInfo('Product deleted!')
  } catch (err) {
    toast.showError(getErrorMessage(err))
  }
}

function filterByCreator(userId: string) {
  // set query param
  router.replace({
    query: { creator: userId },
  })

  page.value = 1
}
</script>

<style scoped>
.products-wrap {
  max-width: 1400px;
  margin: 28px auto;
  padding: 0 20px;
}

.title {
  font-size: 28px;
  text-align: center;
  font-weight: 800;
  margin-bottom: 22px;
  color: #3e3333;
}

.filter-bar {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 26px;
}

.filter-btn {
  background: #fbe9e9;
  border: 1px solid #e6c3c3;
  color: #4e4343;
  padding: 8px 18px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.25s;
  font-size: 14px;
}

.filter-btn:hover {
  background: #f4dcdc;
}

.filter-btn.active {
  background: #e7a8a8;
  border-color: #e7a8a8;
  color: #fff;
  box-shadow: 0 2px 6px rgba(231, 168, 168, 0.5);
}

.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 36px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.card {
  width: 260px;
  background: #fffafa;
  border: 2px solid #e6c3c3;
  border-radius: 18px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.04);
}

.card:hover {
  background: #ffecec;
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 12px 25px rgba(231, 168, 168, 0.4);
  border-color: #e7a8a8;
}

.thumb {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 14px;
  margin-bottom: 12px;
}

.card h3 {
  font-size: 18px;
  font-weight: 700;
  color: #3e3333;
  margin: 8px 0;
}

.creator.link {
  cursor: pointer;
  color: #e59797;
  font-weight: 600;
  transition: 0.25s;
}

.creator.link:hover {
  text-decoration: underline;
  color: #d76b6b;
}

.time {
  margin-top: 6px;
  font-size: 13px;
  color: #5b4e4e;
}

.loader,
.empty {
  text-align: center;
  margin: 40px 0;
  font-size: 17px;
  color: #594c4c;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
}

.pagination button {
  border: 1px solid #e6c3c3;
  background: #fffafa;
  padding: 6px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.25s;
  font-size: 14px;
  color: #4e4343;
  font-weight: 600;
}

.pagination button:hover:not(:disabled) {
  background: #f5dede;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn.active {
  background: #e7a8a8;
  color: #fff;
  border-color: #e7a8a8;
  box-shadow: 0 2px 6px rgba(231, 168, 168, 0.5);
}

.title-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.card-actions {
  display: flex;
  gap: 6px;
}

.icon {
  font-size: 20px;
  cursor: pointer;
  transition: 0.25s;
}

.icon:hover {
  transform: scale(1.3) rotate(-5deg);
  filter: brightness(1.3);
}

.icon.delete:hover {
  color: #d9534f;
}

.edit-input {
  width: 120px;
  text-align: center;
  padding: 4px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #d3b4b4;
}

.card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.dots {
  padding: 6px 12px;
  font-weight: bold;
  color: #8a7575;
  user-select: none;
}
</style>
