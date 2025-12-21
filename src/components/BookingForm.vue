<template>
  <section id="booking" class="bg-white rounded-lg shadow p-6">
    <h2 class="text-xl font-semibold">Đặt dịch vụ chuyển nhà</h2>
    <p class="text-sm text-slate-500 mt-1">Nhập thông tin để nhận báo giá nhanh.</p>

    <form @submit.prevent="onSubmit" class="mt-4 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input v-model="from" type="text" placeholder="Địa chỉ lấy đồ" class="input" />
        <input v-model="to" type="text" placeholder="Địa chỉ giao" class="input" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input v-model.number="size" type="number" placeholder="Số khối (m³)" class="input" />
        <input v-model="date" type="date" class="input" />
        <select v-model="vehicle" class="input">
          <option value="motor">Xe máy (nhỏ)</option>
          <option value="truck_small">Xe tải nhỏ</option>
          <option value="truck_large">Xe tải lớn</option>
        </select>
      </div>

      <div class="flex items-center gap-3">
        <button type="submit" class="bg-emerald-500 text-white px-4 py-2 rounded-md">
          Tính giá & Gửi
        </button>
        <button type="button" @click="estimate" class="px-4 py-2 rounded-md border">
          Ước tính nhanh
        </button>
      </div>

      <div v-if="estimateResult" class="mt-4 p-4 bg-emerald-50 rounded">
        <div class="text-sm text-slate-500">Ước tính chi phí</div>
        <div class="text-lg font-bold">₫{{ estimateResult }}</div>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const from = ref('')
const to = ref('')
const size = ref(1)
const date = ref('')
const vehicle = ref('truck_small')
const estimateResult = ref(null)

function estimate() {
  // simple local estimate: base + distanceFactor * size + vehicleFactor
  const base = 80000
  const distanceFactor = 20000 // giả định 1 đơn vị khoảng cách
  const vehicleFactor =
    vehicle.value === 'truck_large' ? 50000 : vehicle.value === 'truck_small' ? 30000 : 10000
  const est = base + distanceFactor * Math.max(1, size.value) + vehicleFactor
  estimateResult.value = est.toLocaleString('vi-VN')
}

function onSubmit() {
  // gửi tới Firebase (chưa cấu hình trong ví dụ này)
  estimate()
  alert('Gửi yêu cầu thành công! (ví dụ)')
}
</script>

<style scoped>
.input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #e6e9ee;
}
</style>
