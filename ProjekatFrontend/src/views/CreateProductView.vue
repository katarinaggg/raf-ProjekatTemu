<template>
  <section class="wrap">
    <h1>Create Product</h1>

    <form class="card form-grid" @submit.prevent="submit">
      <div class="left">
        <div class="field">
          <label for="title">Title *</label>
          <input
            id="title"
            v-model.trim="form.title"
            type="text"
            placeholder="e.g. Pink Sneakers"
            @blur="touched.title = true"
          />
          <p class="err" v-if="touched.title && !rules.title(form.title)">
            Title must be between 1 and 40 characters.
          </p>
          <p class="err placeholder-err" v-else></p>
        </div>

        <div class="field">
          <label for="desc">Description (optional)</label>
          <textarea
            id="desc"
            v-model.trim="form.description"
            rows="6"
            placeholder="Short product description..."
            @blur="touched.description = true"
          ></textarea>
          <p class="err" v-if="touched.description && !rules.description(form.description)">
            Description can have up to 200 characters.
          </p>
          <p class="err placeholder-err" v-else></p>
        </div>

        <div class="row">
          <div class="field">
            <label for="price">Price ($) *</label>
            <input
              id="price"
              v-model.number="form.price"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 65.00"
              @blur="touched.price = true"
            />
            <p class="err" v-if="touched.price && !rules.price(form.price)">
              Price must be a number greater than 0.
            </p>
            <p class="err placeholder-err" v-else></p>
          </div>

          <div class="field">
            <label for="qty">Quantity *</label>
            <input
              id="qty"
              v-model.number="form.quantity"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 5"
              @blur="touched.quantity = true"
            />
            <p class="err" v-if="touched.quantity && !rules.quantity(form.quantity)">
              Quantity must be a number greater than 0.
            </p>
            <p class="err placeholder-err" v-else></p>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="field">
          <label for="img">Image URL (optional)</label>
          <input
            id="img"
            v-model.trim="form.imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div class="preview">
          <img
            :src="validImage"
            alt="Preview"
            class="preview-img"
            :style="{ objectFit: 'contain' }"
          />
        </div>

        <button type="button" class="btn ghost small" @click="generateRandomImage">
          Generate random image
        </button>
      </div>

      <div class="actions-wide">
        <button type="submit" :disabled="!isValid" class="btn primary">Save</button>
        <button type="button" class="btn ghost" @click="reset">Reset</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import placeholder from '@/assets/img/placeholder.svg'
import { apiPost } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { getErrorMessage } from '@/utils/errorHandler'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'

const auth = useAuthStore()
const router = useRouter()
const toast = useToastStore()

type Form = {
  title: string
  description: string
  price: number | null
  quantity: number | null
  imageUrl: string
}

const blank: Form = {
  title: '',
  description: '',
  price: null,
  quantity: null,
  imageUrl: '',
}

const form = reactive<Form>({ ...blank })

const touched = reactive({
  title: false,
  description: false,
  price: false,
  quantity: false,
})

const rules = {
  title: (v: string) => v.length >= 1 && v.length <= 40,
  description: (v: string) => v.length <= 200, // opciono
  price: (v: number | null) => typeof v === 'number' && v > 0,
  quantity: (v: number | null) => typeof v === 'number' && Number.isInteger(v) && v > 0,
}

const isValid = computed(
  () =>
    rules.title(form.title) &&
    rules.description(form.description) &&
    rules.price(form.price) &&
    rules.quantity(form.quantity),
)

const validImage = ref<string>(placeholder)

watch(
  () => form.imageUrl,
  (url) => {
    validImage.value = url?.trim() ? url : placeholder
  },
)

function generateRandomImage() {
  const seed = Math.floor(Math.random() * 1_000_000)
  form.imageUrl = `https://picsum.photos/seed/${seed}/800/600`
}

async function submit() {
  touched.title = true
  touched.description = true
  touched.price = true
  touched.quantity = true

  if (!isValid.value) return

  try {
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: form.price!,
      quantity: form.quantity!,
      image_url: form.imageUrl.trim() || null,
    }

    type CreateProductResponse = {
      failed?: boolean
      product_id?: string
      code?: string
    }

    const res = await apiPost<typeof payload, CreateProductResponse>(
      '/products',
      payload,
      auth.token ?? undefined,
    )

    if (res.failed) {
      toast.showError(getErrorMessage(res.code))
      return
    }

    toast.showInfo('Product created successfully!')
    router.push(`/products/${res.product_id}`)
  } catch (err) {
    toast.showError(getErrorMessage(err))
  }
}

function reset() {
  Object.assign(form, blank)
  validImage.value = placeholder
  Object.keys(touched).forEach((k) => (touched[k as keyof typeof touched] = false))
}
</script>

<style scoped>
.wrap {
  max-width: 980px;
  margin: 24px auto;
  padding: 0 16px;
}

h1 {
  margin: 0 0 14px;
  color: #3e3333;
  font-size: 28px;
  font-weight: 800;
}

.card {
  background: #fff;
  border: 1px solid #e6c3c3;
  border-radius: 18px;
  padding: 24px;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.04),
    0 12px 28px rgba(0, 0, 0, 0.1);
  transition: 0.2s ease;
}

/* layout */
.form-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 16px;
  align-items: start;
}

.left,
.right {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
}
.field label {
  font-size: 14px;
  color: #4e4343;
  margin-bottom: 6px;
}

.field input,
.field textarea {
  border: 3px solid #e6c3c3;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
  background: #fffafa;
  resize: vertical;
  max-width: 100%;
  box-sizing: border-box;
}

.field input:focus,
.field textarea:focus {
  border-color: #e7a8a8;
  box-shadow: 0 0 0 3px rgba(224, 123, 123, 0.25);
}

.err {
  color: #b75050;
  font-size: 12px;
  margin-top: 6px;
  min-height: 16px;
}
.placeholder-err {
  visibility: hidden;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.preview {
  border: 1px dashed #ebcfcf;
  border-radius: 12px;
  padding: 8px;
  background: #ffeded;
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
  align-items: center;
}

.preview-img {
  max-width: 100% !important;
  max-height: 100% !important;
  width: auto !important;
  height: auto !important;
  object-fit: contain !important;
  object-position: center center !important;
  border-radius: 8px;
  display: block;
}

.btn {
  appearance: none;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  padding: 10px 16px;
  font-size: 14px;
}

.btn.small {
  margin: 0 auto;
  width: auto;
  padding: 8px 14px;
  font-size: 13px;
}

.btn.primary {
  background: #e7a8a8;
  color: #3e3333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn.primary:not(:disabled):hover {
  background: #d69292;
  color: #fff;
}

.btn.ghost {
  background: #fbe9e9;
  color: #4e4343;
  border: 1px solid #e6c3c3;
}
.btn.ghost:hover {
  background: #f6dcdc;
}

.full {
  width: 100%;
}

.actions-wide {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.toast {
  width: 100%;
  text-align: center;
  margin-top: 6px;
  font-size: 13px;
  color: #3e3333;
  background: #ffeded;
  border: 1px solid #f0d2d2;
  border-radius: 8px;
  padding: 8px 10px;
}

@media (max-width: 860px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .row {
    grid-template-columns: 1fr;
  }
  .actions-wide {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
