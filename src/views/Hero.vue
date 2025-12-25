<template>
  <section
    class="relative overflow-hidden rounded-b-4xl py-12 bg-gradient-to-br from-slate-800 via-slate-900 to-black shadow-2xl text-white"
  >
    <!-- Background Effects -->
    <div
      class="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"
    ></div>
    <div
      class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"
    ></div>

    <div class="relative z-10 container mx-auto px-8 py-16 lg:py-24">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <!-- Text Content -->
        <div class="space-y-8 max-w-2xl">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-emerald-400 text-sm font-semibold"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
              ></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Tuyển đối tác tài xế trên toàn quốc
          </div>

          <h1 class="text-4xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Tự do cầm lái <br />
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200"
            >
              Thu nhập vững vàng
            </span>
          </h1>

          <p class="text-lg text-slate-300 leading-relaxed font-light opacity-90">
            Gia nhập cộng đồng 15.000+ tài xế GoTrans. Nhận đơn hàng ổn định, thanh toán nhanh chóng
            và tận hưởng chính sách thưởng hấp dẫn mỗi tuần.
          </p>

          <div class="flex flex-wrap gap-4">
            <RouterLink
              to="/register"
              class="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-900/50 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
            >
              Đăng ký ngay
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </RouterLink>

            <RouterLink
              to="/login"
              class="px-8 py-4 rounded-2xl font-semibold border border-white/20 hover:bg-white/10 transition backdrop-blur-sm flex items-center gap-2 text-slate-200"
            >
              Đăng nhập
            </RouterLink>
          </div>

          <!-- Trust Indicators -->
          <div class="pt-8 border-t border-white/10 flex items-center gap-8">
            <div>
              <p class="text-3xl font-bold text-white">15tr+</p>
              <p class="text-xs text-slate-400 uppercase tracking-wide">Thu nhập/tháng</p>
            </div>
            <div class="w-px h-10 bg-white/10"></div>
            <div>
              <p class="text-3xl font-bold text-white">20k+</p>
              <p class="text-xs text-slate-400 uppercase tracking-wide">Đối tác tài xế</p>
            </div>
            <div class="w-px h-10 bg-white/10"></div>
            <div>
              <p class="text-3xl font-bold text-white">24/7</p>
              <p class="text-xs text-slate-400 uppercase tracking-wide">Hỗ trợ kỹ thuật</p>
            </div>
          </div>
        </div>

        <!-- Visuals/Illustration -->
        <div class="relative hidden lg:block perspective-1000">
          <div class="relative z-10 transform hover:scale-105 transition duration-700 ease-out">
            <!-- Simulated App Interface or Driver Image Card -->
            <div
              class="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-6 relative overflow-hidden"
            >
              <div class="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80"></div>

              <!-- Content Mockup -->
              <div class="flex items-center gap-4 mb-6 relative z-10">
                <div
                  class="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-slate-400 text-xs">Tổng thu nhập hôm nay</p>
                  <p class="text-2xl font-bold text-white">1.250.000 ₫</p>
                </div>
              </div>

              <div
                class="bg-slate-700/50 rounded-xl p-4 mb-4 relative z-10 border border-slate-600"
              >
                <div class="flex justify-between items-center mb-2">
                  <span
                    class="text-xs font-bold text-emerald-400 px-2 py-0.5 bg-emerald-400/10 rounded"
                    >ĐƠN MỚI</span
                  >
                  <span class="text-slate-400 text-xs">2 phút trước</span>
                </div>
                <h4 class="font-bold text-lg mb-1">Giao hàng Hỏa tốc</h4>
                <p class="text-slate-300 text-sm mb-3">
                  Từ: 123 Nguyễn Văn Linh → Đến: 456 Lê Duẩn
                </p>
                <div
                  class="w-full bg-emerald-600 h-10 rounded-lg flex items-center justify-center font-bold font-sm"
                >
                  Nhận đơn ngay
                </div>
              </div>

              <div class="flex justify-between items-center text-xs text-slate-500 relative z-10">
                <span>Hoạt động gần đây</span>
                <span>Xem tất cả</span>
              </div>
            </div>
          </div>

          <!-- Floating Badge 1 -->
          <div
            class="absolute top-20 -left-12 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl z-20 animate-float-delayed hidden xl:block border border-slate-200 dark:border-slate-700"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400"
              >
                ✓
              </div>
              <div>
                <p class="text-slate-900 dark:text-white font-bold text-sm">Thưởng nóng 500k</p>
                <p class="text-slate-500 dark:text-slate-400 text-xs">Đã cộng vào ví</p>
              </div>
            </div>
          </div>

          <!-- Floating Badge 2 -->
          <div
            class="absolute bottom-10 -right-8 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl z-20 animate-float border border-slate-200 dark:border-slate-700"
          >
            <div class="flex items-center gap-3">
              <div class="flex -space-x-2">
                <div class="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
                <div class="w-8 h-8 rounded-full bg-slate-300 border-2 border-white"></div>
                <div
                  class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold"
                >
                  +5
                </div>
              </div>
              <div class="text-left">
                <p class="text-slate-900 dark:text-white font-bold text-sm">Cộng đồng hỗ trợ</p>
                <p class="text-emerald-500 text-xs font-bold">Luôn sẵn sàng</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}
.animate-float {
  animation: float 5s ease-in-out infinite;
}
.animate-float-delayed {
  animation: float 5s ease-in-out infinite;
  animation-delay: 2.5s;
}
</style>
