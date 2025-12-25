<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-slate-800">
    <TheNavbar />

    <main class="flex-1">
      <section class="bg-slate-900 py-16 text-center relative overflow-hidden">
        <div
          class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-emerald-900 to-slate-900 opacity-90"
        ></div>
        <div class="relative z-10 container mx-auto px-6">
          <h1 class="text-4xl font-bold text-white mb-2">Hỗ trợ Đối tác Tài xế</h1>
          <p class="text-slate-300">Chúng tôi luôn sẵn sàng lắng nghe bạn 24/7</p>
        </div>
      </section>

      <div class="container mx-auto px-6 py-12 -mt-10 relative z-20">
        <div class="grid lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1 space-y-6">
            <div class="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 h-full">
              <h3 class="text-xl font-bold text-slate-900 mb-6">Thông tin liên hệ</h3>

              <div class="space-y-6">
                <div class="flex items-start gap-4">
                  <div
                    class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"
                  >
                    <MapPin class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 text-sm">Trung tâm Hỗ trợ Đối tác</p>
                    <p class="text-slate-600 text-sm mt-1">
                      123 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <div
                    class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"
                  >
                    <Phone class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 text-sm">Hotline</p>
                    <p class="text-slate-600 text-sm mt-1">1900 1234 - 0988 888 888</p>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <div
                    class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"
                  >
                    <Mail class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 text-sm">Email</p>
                    <p class="text-slate-600 text-sm mt-1">duke.nd.wst@gmail.comn</p>
                  </div>
                </div>
              </div>

              <div class="mt-8 pt-8 border-t border-slate-100">
                <p class="font-bold text-slate-900 mb-4">Giờ làm việc</p>
                <div class="flex justify-between text-sm text-slate-600 mb-2">
                  <span>Thứ 2 - Thứ 7:</span>
                  <span>8:00 - 18:00</span>
                </div>
                <div class="flex justify-between text-sm text-slate-600">
                  <span>Chủ nhật:</span>
                  <span>Nghỉ (Vẫn nhận đặt xe)</span>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2">
            <div class="bg-white p-8 lg:p-10 rounded-3xl shadow-xl border-t-4 border-emerald-500">
              <h3 class="text-2xl font-bold text-slate-900 mb-2">Gửi yêu cầu tư vấn</h3>
              <p class="text-slate-500 mb-8 text-sm">
                Điền thông tin bên dưới, nhân viên hỗ trợ sẽ liên hệ lại sớm nhất.
              </p>

              <form @submit.prevent="submitForm" class="space-y-6">
                <div class="grid md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-slate-700">Họ và tên</label>
                    <input
                      type="text"
                      class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition bg-slate-50 focus:bg-white"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-slate-700">Số điện thoại</label>
                    <input
                      type="tel"
                      class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition bg-slate-50 focus:bg-white"
                      placeholder="0912 xxx xxx"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-semibold text-slate-700">Vấn đề cần hỗ trợ</label>
                  <select
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition bg-slate-50 focus:bg-white text-slate-600"
                  >
                    <option>Đăng ký tài khoản tài xế</option>
                    <option>Hỗ trợ kỹ thuật ứng dụng</option>
                    <option>Vấn đề ví / thanh toán</option>
                    <option>Báo cáo sự cố chuyến đi</option>
                    <option>Khác</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-semibold text-slate-700">Nội dung cần hỗ trợ</label>
                  <textarea
                    rows="4"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition bg-slate-50 focus:bg-white"
                    placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  class="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 hover:shadow-emerald-200 hover:-translate-y-1 transition-all duration-300"
                >
                  Gửi yêu cầu ngay
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheNavbar from '@/components/TheNavbar.vue'
import TheFooter from '@/components/TheFooter.vue'
import { MapPin, Phone, Mail } from 'lucide-vue-next'

const submitForm = () => {
  alert('Cảm ơn bạn! Chúng tôi đã nhận được yêu cầu.')
}
</script>
