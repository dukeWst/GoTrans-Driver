<template>
  <section class="py-20 px-6 lg:px-24 bg-white relative">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <h2 class="text-3xl font-bold text-slate-900">Tại sao chọn GoTrans Driver?</h2>
      <p class="text-slate-500 mt-3">
        Nền tảng công nghệ giúp bạn tối ưu thu nhập và làm chủ công việc.
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
import { Wallet, Clock, Smartphone } from 'lucide-vue-next'

const features = [
  {
    icon: Wallet,
    title: 'Thu nhập hấp dẫn',
    desc: 'Không giới hạn thu nhập. Nhận tiền ngay sau mỗi chuyến đi và hưởng các chính sách thưởng tuần, thưởng tháng.',
  },
  {
    icon: Clock,
    title: 'Thời gian linh hoạt',
    desc: 'Bạn là chủ của chính mình. Bật ứng dụng khi rảnh, tắt khi bận. Không gò bó thời gian làm việc.',
  },
  {
    icon: Smartphone,
    title: 'Công nghệ thông minh',
    desc: 'Ứng dụng hỗ trợ tìm đường tối ưu, tự động gán đơn gần bạn nhất để tiết kiệm xăng và thời gian.',
  },
]
</script>
