<template>
  <section class="wrap">
    <div v-if="loading" class="loader">Loading...</div>

    <div v-else-if="product" class="product-layout">
      <div class="image-col">
        <img :src="form.image_url" class="image" />

        <div v-if="product.quantity === 0" class="badge">OUT OF STOCK</div>

        <button v-if="editing" class="change-img-btn" @click="generateRandomImage">
          🔄 Change Image
        </button>
      </div>

      <div class="info-col">
        <div v-if="editing" class="field">
          <label>Title *</label>
          <input type="text" v-model.trim="form.title" />
        </div>

        <h1 v-else>{{ product.title }}</h1>

        <p class="meta">👤 {{ product.creator.username }} • 📅 {{ formattedCreated }}</p>

        <div v-if="editing" class="field">
          <label>Description</label>
          <textarea v-model="form.description"></textarea>
        </div>

        <p v-else class="description">
          {{ product.description || 'No description available.' }}
        </p>

        <div v-if="editing" class="field price-field">
          <label>Price ($)</label>
          <input type="number" v-model="form.price" />
        </div>

        <p v-else class="price">{{ product.price }} $</p>

        <div v-if="editing" class="field">
          <label>Quantity</label>
          <input type="number" v-model="form.quantity" />
        </div>

        <div v-if="!editing" class="action-row">
          <div class="qty-holder">
            <label>Quantity:</label>
            <input type="number" v-model.number="selectedQty" min="1" :max="product.quantity" />
            <small>Available: {{ product.quantity }}</small>
          </div>

          <button
            class="buy-btn"
            :class="{ out: product.quantity === 0 || isOwner }"
            :disabled="product.quantity === 0 || !isLoggedIn || isOwner"
            @click="buyProduct"
          >
            {{ product.quantity === 0 ? 'Out of stock' : isOwner ? 'You own this' : 'Buy 🛒' }}
          </button>

          <button v-if="isOwner && !editing" class="delete-inline icon-only" @click="deleteProduct">
            🗑️
          </button>
        </div>

        <div v-if="editing" class="edit-actions">
          <button class="save-btn" @click="saveChanges">💾 Save</button>
          <button class="cancel-btn" @click="cancelEdit">❌ Cancel</button>
        </div>

        <button v-if="!editing && isOwner" class="edit-btn" @click="editing = true">
          ✏️ Edit Product
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { apiGet, apiPatch, apiDelete, apiPost } from '@/api/client'
import { getErrorMessage } from '@/utils/errorHandler'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'

type Product = {
  product_id: string
  title: string
  description?: string
  image_url: string
  price: number
  quantity: number
  created_at: string
  updated_at?: string
  creator: {
    user_id: string
    username: string
  }
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const product = ref<Product | null>(null)
const loading = ref(true)
const editing = ref(false)
const selectedQty = ref(1)

type ProductForm = {
  title: string
  description?: string
  price: number
  quantity: number
  image_url: string
}

const form = ref<ProductForm>({
  title: '',
  description: '',
  price: 0,
  quantity: 0,
  image_url: '',
})

async function loadProduct() {
  loading.value = true

  //console.log(' Fetching product...')
  //console.log(' Route param:', route.params.id)

  try {
    const res = await apiGet<{
      failed: boolean
      product?: Product
      code?: string
    }>(`/products/${route.params.id}`)

    if (res.failed) {
      toast.showError(getErrorMessage(res.code))
      product.value = null
      return
    }

    //console.log(' Product loaded:', res.product)

    product.value = res.product!
    form.value = { ...res.product! }
  } catch (err) {
    toast.showError(getErrorMessage(err))
    product.value = null
  }

  loading.value = false
}

onMounted(loadProduct)

const isOwner = computed(() => {
  return auth.token !== null && product.value?.creator.user_id === auth.userId
})

const isLoggedIn = computed(() => !!auth.token)

function cancelEdit() {
  editing.value = false
  form.value = { ...product.value! }
}

async function saveChanges() {
  try {
    await apiPatch(`/products/${product.value!.product_id}`, form.value, auth.token ?? undefined)

    await loadProduct() // ponovo fetch
    editing.value = false
    toast.showInfo('Product updated!')
  } catch (err) {
    toast.showError(getErrorMessage(err))
  }
}

async function deleteProduct() {
  if (!confirm('Are you sure?')) return

  try {
    await apiDelete(`/products/${product.value!.product_id}`, auth.token ?? undefined)
    toast.showInfo('Product deleted!')
    router.push('/products')
  } catch (err) {
    toast.showError(getErrorMessage(err))
  }
}

async function buyProduct() {
  try {
    const payload = {
      value: product.value!.price * selectedQty.value,
      quantity: selectedQty.value,
      user_id: auth.userId!,
      product_id: product.value!.product_id,
    }

    type OrderResponse = {
      failed?: boolean
      order?: {
        order_id: string
        product_title: string
        product_value: number
        product_quantity: number
        created_at: string
      }
    }

    const res = await apiPost<typeof payload, OrderResponse>(
      '/orders',
      payload,
      auth.token ?? undefined,
    )

    if (res.failed) {
      toast.showError('Order failed')
      return
    }
    toast.showInfo(`Order successfully placed! 🛒`)

    await loadProduct()
  } catch (err) {
    toast.showError(getErrorMessage(err))
  }
}

const formattedCreated = computed(() =>
  product.value ? new Date(product.value.created_at).toLocaleString() : '',
)

function generateRandomImage() {
  const seed = Math.floor(Math.random() * 1_000_000)
  form.value.image_url = `https://picsum.photos/seed/${seed}/800/600`
}
</script>

<style scoped>
.wrap {
  max-width: 1150px;
  margin: 30px auto;
  padding: 20px;
}

.product-layout {
  display: flex;
  gap: 40px;
  background: #fff;
  border: 2px solid #f3d1d1;
  border-radius: 22px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(231, 168, 168, 0.25);
}

.image-col {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
}

.image {
  max-width: 440px;
  max-height: 440px;
  object-fit: contain;
  border-radius: 18px;
  border: 4px solid #e6c3c3;
  background: #fffafa;
}

.badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #d60000;
  color: white;
  padding: 6px 14px;
  border-radius: 10px;
  font-weight: bold;
}

.change-img-btn {
  background: #e7a8a8;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
  color: white;
  transition: 0.25s;
}
.change-img-btn:hover {
  background: #d07777;
}

.info-col {
  flex: 1.3;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

h1 {
  font-size: 38px;
  font-weight: 800;
  margin: 0;
  color: #3e3333;
}

.meta {
  font-size: 18px;
  color: #846b6b;
}

.description {
  font-size: 17px;
  line-height: 1.5;
}

.price {
  font-size: 30px;
  font-weight: bold;
  color: #c25151;
  margin-top: 8px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field textarea {
  resize: vertical;
  max-width: 100%;
  min-height: 90px;
  max-height: 260px;
  overflow-y: auto;
  box-sizing: border-box;
}

.field input,
.field textarea {
  padding: 10px;
  border-radius: 12px;
  border: 2px solid #e6c3c3;
  background: #fffafa;
  font-size: 16px;
}

.action-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.qty-holder {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.qty-holder input {
  width: 70px;
  padding: 8px;
  border: 2px solid #d9baba;
  border-radius: 8px;
}

.buy-btn {
  background: #e7a8a8;
  padding: 10px 20px;
  border-radius: 10px;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
.buy-btn:hover:not(:disabled) {
  background: #d68282;
}

.buy-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  filter: grayscale(20%);
  box-shadow: none;
}

.buy-btn.out:disabled {
  background: #b50000 !important;
  color: #ffffff;
}

.delete-inline {
  background: #ffd5d5;
  padding: 10px 16px;
  border-radius: 10px;
  color: #8b1313;
  cursor: pointer;
  border: 1px solid #ffbfbf;
  transition: 0.2s;
}
.delete-inline:hover {
  background: #ffb3b3;
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.save-btn,
.cancel-btn {
  padding: 12px 18px;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  font-weight: bold;
}

.save-btn {
  background: #9ad7ff;
}
.cancel-btn {
  background: #ffe2e2;
}

.edit-btn {
  margin-top: 16px;
  padding: 12px;
  border-radius: 12px;
  background: #e7a8a8;
  border: none;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

.delete-inline.icon-only {
  width: 42px;
  height: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 22px;
  padding: 0;
  border-radius: 50%;
  background: #ffe0e0;
  border: 1px solid #ffbfbf;
  transition: 0.2s;
}

.delete-inline.icon-only:hover {
  background: #ffb3b3;
  color: #7a0000;
}
</style>
