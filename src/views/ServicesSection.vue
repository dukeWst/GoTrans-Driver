<template>
  <section class="py-24 px-6 lg:px-24 bg-slate-50" id="services">
    <div class="text-center mb-16">
      <span class="text-emerald-600 font-bold uppercase tracking-wider text-sm">Dịch vụ</span>
      <h2 class="text-3xl lg:text-4xl font-bold text-slate-900 mt-2">Giải pháp cho mọi nhu cầu</h2>
    </div>

    <div class="space-y-16 max-w-6xl mx-auto">
      <div
        v-for="(item, index) in services"
        :key="item.title"
        :class="[
          'flex flex-col md:flex-row items-center gap-10 lg:gap-16',
          index % 2 === 1 ? 'md:flex-row-reverse' : '',
        ]"
      >
        <div class="w-full md:w-1/2 relative group">
          <div
            class="absolute inset-0 bg-emerald-500 rounded-3xl rotate-3 opacity-20 group-hover:rotate-6 transition-transform duration-300"
          ></div>
          <img
            :src="item.img"
            class="relative rounded-3xl shadow-xl w-full h-72 lg:h-80 object-cover z-10 transform group-hover:-translate-y-2 transition-transform duration-300"
          />
        </div>

        <div class="w-full md:w-1/2 space-y-4">
          <div
            class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500 border border-emerald-100"
          >
            <component :is="item.icon" class="w-6 h-6" />
          </div>

          <h3 class="text-2xl font-bold text-slate-900">{{ item.title }}</h3>
          <p class="text-slate-600 leading-relaxed text-lg">{{ item.desc }}</p>

          <ul class="space-y-2 pt-2">
            <li v-for="feat in item.features" :key="feat" class="flex items-center text-slate-700">
              <span class="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
              {{ feat }}
            </li>
          </ul>

          <RouterLink to="/about">
            <button class="mt-4 text-emerald-600 font-bold hover:underline flex items-center">
              Xem chi tiết <span class="ml-2">→</span>
            </button>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Boxes, PackageCheck, Truck } from 'lucide-vue-next'
// Giả sử bạn vẫn giữ import ảnh cũ, nếu không hãy thay bằng link ảnh mẫu
import photo1 from '@/assets/photo_1.png'
import photo2 from '@/assets/photo_2.png'
import photo3 from '@/assets/photo_3.png'

const services = [
  {
    icon: Boxes,
    title: 'Chuyển nhà trọn gói',
    desc: 'Giải pháp toàn diện giúp bạn chuyển nhà mà không tốn sức. Chúng tôi lo từ A-Z.',
    img: photo1,
    features: [
      'Bọc lót 3 lớp an toàn',
      'Thợ tháo lắp điều hòa, tủ giường',
      'Bảo hiểm 100% tài sản',
    ],
  },
  {
    icon: Truck,
    title: 'Taxi Tải / Chở hàng',
    desc: 'Đội xe đa dạng tải trọng từ 500kg đến 5 tấn, phục vụ 24/24 trong nội thành và đi tỉnh.',
    img: photo2,
    features: ['Xe chạy giờ cấm', 'Giá cước rẻ nhất thị trường', 'Theo dõi lộ trình GPS'],
  },
  {
    icon: PackageCheck,
    title: 'Chuyển văn phòng',
    desc: 'Quy trình chuyên nghiệp, xuất hóa đơn VAT, đảm bảo tiến độ hoạt động kinh doanh.',
    img: photo3,
    features: [
      'Hồ sơ năng lực đầy đủ',
      'Đóng gói hồ sơ khoa học',
      'Vận chuyển két sắt, máy server',
    ],
  },
]
</script>
