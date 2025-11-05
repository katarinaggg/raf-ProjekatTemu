<template>
  <section class="wrap">
    <h1>Create Product</h1>

    <!-- kad korisnik klikne save poziva se submit -->
    <form class="card" @submit.prevent="submit">
      <!-- Name -->
      <div class="field">
        <label for="name">Name *</label>
        <input
          id="name"
          v-model.trim="form.name"
          type="text"
          placeholder="e.g. Pink Sneakers"
          @blur="touched.name = true"
        />
        <p v-if="touched.name && !rules.name(form.name)" class="err">
          Name must be at least 3 characters.
        </p>
      </div>

      <!-- Description -->
      <div class="field">
        <label for="desc">Description *</label>
        <textarea
          id="desc"
          v-model.trim="form.description"
          rows="3"
          placeholder="Short product description..."
          @blur="touched.description = true"
        ></textarea>
        <p v-if="touched.description && !rules.description(form.description)" class="err">
          Description must be at least 10 characters.
        </p>
      </div>

      <!-- Price & Quantity -->
      <div class="row">
        <div class="field">
          <label for="price">Price (EUR) *</label>
          <input
            id="price"
            v-model.number="form.price"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 65.00"
            @blur="touched.price = true"
          />
          <p v-if="touched.price && !rules.price(form.price)" class="err">
            Price must be a positive number.
          </p>
        </div>

        <div class="field">
          <label for="qty">Quantity *</label>
          <input
            id="qty"
            v-model.number="form.quantity"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 5"
            @blur="touched.quantity = true"
          />
          <p v-if="touched.quantity && !rules.quantity(form.quantity)" class="err">
            Quantity must be 0 or greater (integer).
          </p>
        </div>
      </div>

      <!-- Image URL -->
      <div class="field">
        <label for="img">Image URL (optional)</label>
        <input
          id="img"
          v-model.trim="form.imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
        />

        <div class="preview">
          <img :src="validImage" alt="Preview" />
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button type="submit" :disabled="!isValid" class="btn primary">Save</button>
        <button type="button" class="btn ghost" @click="reset">Reset</button>
      </div>

      <p v-if="saved" class="toast">Product saved (mock). Check console output.</p>
    </form>
  </section>
</template>

<script setup lang="ts">
// Vue composition API funkcije
import { reactive, ref, computed, watch } from 'vue'

// interfejs forma
type Form = {
  name: string
  description: string
  price: number | null
  quantity: number | null
  imageUrl: string
}

// pocetne vrednosti forme
const blank: Form = {
  name: '',
  description: '',
  price: null,
  quantity: null,
  imageUrl: '',
}

const form = reactive<Form>({ ...blank })
const touched = reactive({
  name: false,
  description: false,
  price: false,
  quantity: false,
})

// validation rules
// svako pravilo je funkcija koja vraca T/F
const rules = {
  name: (v: string) => v && v.length >= 3,
  description: (v: string) => v && v.length >= 10,
  price: (v: number | null) => typeof v === 'number' && v > 0,
  quantity: (v: number | null) => typeof v === 'number' && Number.isInteger(v) && v >= 0,
}

// provera validnosti forme
// ako su sva 4 polja ispravno popunjena onda moze da se kreira proizvod
const isValid = computed(
  () =>
    rules.name(form.name) &&
    rules.description(form.description) &&
    rules.price(form.price) &&
    rules.quantity(form.quantity),
)

// placeholder za sliku
const placeholder = '/placeholder.svg'
const validImage = ref<string>(placeholder)

watch(
  () => form.imageUrl,
  (url) => {
    validImage.value = url ? url : placeholder
  },
)

const saved = ref(false)

function submit() {
  if (!isValid.value) return
  console.clear()
  console.log('CreateProduct payload:', { ...form })
  saved.value = true
  setTimeout(() => (saved.value = false), 2500)
}

function reset() {
  Object.assign(form, blank)
  validImage.value = placeholder
  Object.keys(touched).forEach((k) => (touched[k as keyof typeof touched] = false))
}
</script>

<style scoped>
.wrap {
  max-width: 900px;
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
  border: 1px solid #f0d2d2;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.05);
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
}
.field label {
  font-size: 14px;
  color: #4e4343;
  margin-bottom: 6px;
}
.field input,
.field textarea {
  border: 1px solid #e6c3c3;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}
.field input:focus,
.field textarea:focus {
  border-color: #e7a8a8;
  box-shadow: 0 0 0 3px rgba(231, 168, 168, 0.25);
}

.err {
  color: #b75050;
  font-size: 12px;
  margin-top: 6px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 720px) {
  .row {
    grid-template-columns: 1fr;
  }
}

.preview {
  margin-top: 10px;
  border: 1px dashed #ebcfcf;
  border-radius: 10px;
  padding: 8px;
  background: #ffeded;
  display: flex;
  justify-content: center;
}
.preview img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
}
.btn {
  appearance: none;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  padding: 10px 16px;
  font-size: 14px;
  text-decoration: none;
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
.btn.linkish {
  background: transparent;
  color: #594c4c;
  padding: 10px 6px;
}
.btn.linkish:hover {
  background: #fff5f5;
  border-radius: 6px;
}

.toast {
  margin-top: 8px;
  font-size: 13px;
  color: #3e3333;
  background: #ffeded;
  border: 1px solid #f0d2d2;
  border-radius: 8px;
  padding: 8px 10px;
  display: inline-block;
}
</style>
