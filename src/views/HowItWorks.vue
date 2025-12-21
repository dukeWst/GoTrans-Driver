<template>
  <section
    class="py-24 bg-gradient-to-br from-teal-500 to-emerald-600 text-white relative overflow-hidden"
  >
    <div
      class="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
    ></div>
    <div
      class="absolute bottom-0 right-0 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"
    ></div>

    <div class="relative z-10 container mx-auto px-6 text-center">
      <h2 class="text-3xl lg:text-4xl font-bold mb-4">Trở thành đối tác dễ dàng</h2>
      <p class="text-emerald-100 mb-16 max-w-xl mx-auto">
        Chỉ với 3 bước đơn giản để bắt đầu kiếm tiền cùng GoTrans.
      </p>

      <div class="relative max-w-5xl mx-auto">
        <div
          class="absolute top-10 left-0 w-full h-0.5 border-t-2 border-dashed border-white/30 hidden md:block"
        ></div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div
            v-for="(step, index) in steps"
            :key="step.title"
            class="flex flex-col items-center relative group"
          >
            <div
              class="absolute -top-3 right-1/2 translate-x-10 bg-white text-emerald-600 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md z-20"
            >
              {{ index + 1 }}
            </div>

            <div
              class="w-20 h-20 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg mb-6 group-hover:bg-white group-hover:text-emerald-600 group-hover:scale-110 transition-all duration-300"
            >
              <component :is="step.icon" class="w-10 h-10" />
            </div>

            <h3 class="font-bold text-xl mb-2">{{ step.title }}</h3>
            <p class="text-emerald-50 text-sm leading-relaxed px-4">{{ step.desc }}</p>
          </div>
        </div>
      </div>

      <div class="mt-16">
        <RouterLink
          to="/register"
          class="inline-block px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition shadow-lg transform hover:-translate-y-1"
        >
          Đăng ký làm tài xế ngay
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { FileText, Award, Truck } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const steps = [
  {
    icon: FileText,
    title: 'Đăng ký hồ sơ',
    desc: 'Điền thông tin trực tuyến và tải lên các giấy tờ cần thiết (CMND/CCCD, Bằng lái).',
  },
  {
    icon: Award,
    title: 'Xét duyệt & Đào tạo',
    desc: 'GoTrans sẽ xác thực hồ sơ và hướng dẫn bạn cách sử dụng ứng dụng hiệu quả.',
  },
  {
    icon: Truck,
    title: 'Nhận đơn & Kiếm tiền',
    desc: 'Kích hoạt tài khoản, bật ứng dụng lên và bắt đầu nhận chuyến xe đầu tiên.',
  },
]
</script>
