<script setup lang="ts">
import { useRouter } from 'vue-router'
import { PackageX, Home, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard') // Hoặc đường dẫn trang chủ của bạn
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <main class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div class="max-w-md w-full text-center">
      <div class="relative w-32 h-32 mx-auto mb-8">
        <div class="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20"></div>
        <div
          class="relative w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-red-50"
        >
          <PackageX class="w-16 h-16 text-red-500" />
        </div>
      </div>

      <h1 class="text-6xl font-black text-slate-900 mb-2">404</h1>
      <h2 class="text-2xl font-bold text-slate-800 mb-4">Lạc mất kiện hàng rồi!</h2>
      <p class="text-slate-500 mb-8 leading-relaxed">
        Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển đi nơi khác giống như
        một đơn hàng bị thất lạc vậy.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          @click="goBack"
          class="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-slate-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
        >
          <ArrowLeft class="w-4 h-4" /> Quay lại
        </button>

        <button
          @click="goHome"
          class="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
        >
          <Home class="w-4 h-4" /> Về trang chủ
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Không cần thêm style vì đã dùng Tailwind */
</style>
