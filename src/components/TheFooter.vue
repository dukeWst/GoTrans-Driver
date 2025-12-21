<template>
  <footer class="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
    <div class="container mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="text-xl font-bold tracking-tight">GoTrans</span>
          </div>
          <p class="text-slate-400 text-sm leading-relaxed">
            Nền tảng vận chuyển thông minh, kết nối khách hàng và tài xế với chi phí tối ưu nhất.
          </p>
        </div>

        <div>
          <h3 class="font-bold text-lg mb-4 text-emerald-400">Dịch vụ</h3>
          <ul class="space-y-3 text-sm text-slate-300">
            <li><a href="#" class="hover:text-white transition">Chuyển nhà trọn gói</a></li>
            <li><a href="#" class="hover:text-white transition">Chuyển văn phòng</a></li>
            <li><a href="#" class="hover:text-white transition">Taxi tải chở hàng</a></li>
            <li><a href="#" class="hover:text-white transition">Hoàn trả mặt bằng</a></li>
          </ul>
        </div>

        <div>
          <h3 class="font-bold text-lg mb-4 text-emerald-400">Hỗ trợ</h3>
          <ul class="space-y-3 text-sm text-slate-300">
            <li><a href="#" class="hover:text-white transition">Trung tâm trợ giúp</a></li>
            <li><a href="#" class="hover:text-white transition">Chính sách bảo mật</a></li>
            <li><a href="#" class="hover:text-white transition">Điều khoản sử dụng</a></li>
            <li><a href="#" class="hover:text-white transition">Liên hệ hợp tác</a></li>
          </ul>
        </div>

        <div>
          <h3 class="font-bold text-lg mb-4 text-emerald-400">Liên hệ</h3>
          <ul class="space-y-3 text-sm text-slate-300">
            <li class="flex items-start gap-3">
              <MapPin />
              <span>Tầng 12, Tòa nhà Bitexco, Q.1, TP. Hồ Chí Minh</span>
            </li>
            <li class="flex items-center gap-3">
              <Phone />
              <span class="font-mono text-white">0984 099 061</span>
            </li>
            <li class="flex items-center gap-3">
              <Mail />
              <span>support@gotrans.vn</span>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <p class="text-xs text-slate-500">© 2025 GoTrans Inc. All rights reserved.</p>

        <div class="flex gap-6">
          <a
            href="https://www.facebook.com/duke7925"
            class="text-slate-400 hover:text-white transition"
            ><FacebookIcon class="w-5 h-5"
          /></a>
          <a
            href="https://www.instagram.com/duke.nd_/"
            class="text-slate-400 hover:text-white transition"
            ><InstagramIcon class="w-5 h-5"
          /></a>
          <a href="https://x.com/NguynHn792005" class="text-slate-400 hover:text-white transition"
            ><TwitterIcon class="w-5 h-5"
          /></a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Facebook, Instagram, Mail, MapIcon, MapPin, Phone, Twitter } from 'lucide-vue-next'
// Alias icons để dùng trong template
const FacebookIcon = Facebook
const InstagramIcon = Instagram
const TwitterIcon = Twitter
</script>
