<template>
  <section class="py-20 px-6 lg:px-24 bg-white relative">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <h2 class="text-3xl font-bold text-slate-900">Tại sao chọn GoTrans?</h2>
      <p class="text-slate-500 mt-3">
        Chúng tôi mang đến giải pháp vận chuyển toàn diện với cam kết chất lượng hàng đầu.
      </p>
    </div>

    <div class="grid md:grid-cols-3 gap-8">
      <div
        v-for="item in features"
        :key="item.title"
        class="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-emerald-100 hover:-translate-y-2 transition-all duration-300"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300"
        >
          <component :is="item.icon" class="w-8 h-8" />
        </div>

        <h3 class="text-xl font-bold text-slate-900 mb-3">{{ item.title }}</h3>
        <p class="text-slate-600 leading-relaxed">{{ item.desc }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ShieldCheck, Truck, MapPin } from 'lucide-vue-next'

const features = [
  {
    icon: ShieldCheck,
    title: 'An toàn tuyệt đối',
    desc: 'Đội ngũ chuyên nghiệp, bọc lót kỹ càng, đảm bảo an toàn 100% cho tài sản của bạn.',
  },
  {
    icon: Truck,
    title: 'Vận chuyển thần tốc',
    desc: 'Hệ thống điều xe thông minh giúp tối ưu lộ trình, tiết kiệm thời gian và chi phí.',
  },
  {
    icon: MapPin,
    title: 'Chi phí minh bạch',
    desc: 'Giá cước niêm yết rõ ràng theo Google Maps. Cam kết không phát sinh phụ phí.',
  },
]
</script>
