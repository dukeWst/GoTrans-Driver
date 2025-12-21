<template>
  <section
    class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-emerald-600 to-green-600 shadow-2xl text-white"
  >
    <div
      class="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"
    ></div>
    <div
      class="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-300/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"
    ></div>

    <div class="relative z-10 container mx-auto px-8 py-16 lg:py-20">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        <div class="space-y-8 max-w-2xl">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-50 text-sm font-semibold"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
              ></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            Hệ thống vận chuyển số 1 Việt Nam
          </div>

          <h1 class="text-4xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Chuyển nhà <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-white">
              Nhanh & Tiết kiệm
            </span>
          </h1>

          <p class="text-lg text-emerald-50 leading-relaxed font-light opacity-90">
            Đặt xe chỉ trong 30 giây. Đội ngũ chuyên nghiệp, bọc lót kỹ càng. Theo dõi lộ trình thời
            gian thực ngay trên ứng dụng.
          </p>

          <div class="flex flex-wrap gap-4">
            <button
              @click="isModalOpen = true"
              class="px-8 py-4 bg-white text-emerald-700 rounded-2xl font-bold shadow-xl shadow-emerald-900/20 hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
            >
              Đặt xe ngay
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
            </button>

            <RouterLink
              to="/about"
              class="px-8 py-4 rounded-2xl font-semibold border border-white/30 hover:bg-white/10 transition backdrop-blur-sm flex items-center gap-2"
            >
              Về chúng tôi
            </RouterLink>
          </div>

          <div class="pt-6 border-t border-white/10 flex items-center gap-8">
            <div>
              <p class="text-3xl font-bold">15k+</p>
              <p class="text-xs text-emerald-100 uppercase tracking-wide">Đơn hàng</p>
            </div>
            <div class="w-px h-10 bg-white/20"></div>
            <div>
              <p class="text-3xl font-bold">4.9</p>
              <div class="flex text-yellow-300 text-xs">★★★★★</div>
            </div>
            <div class="w-px h-10 bg-white/20"></div>
            <div class="flex -space-x-3">
              <img
                class="w-10 h-10 rounded-full border-2 border-emerald-500"
                src="https://i.pravatar.cc/100?img=1"
                alt=""
              />
              <img
                class="w-10 h-10 rounded-full border-2 border-emerald-500"
                src="https://i.pravatar.cc/100?img=5"
                alt=""
              />
              <img
                class="w-10 h-10 rounded-full border-2 border-emerald-500"
                src="https://i.pravatar.cc/100?img=8"
                alt=""
              />
              <div
                class="w-10 h-10 rounded-full border-2 border-emerald-500 bg-emerald-800 flex items-center justify-center text-xs font-bold"
              >
                +2k
              </div>
            </div>
          </div>
        </div>

        <div class="relative hidden lg:block perspective-1000">
          <div class="relative z-999 transform hover:scale-105 transition duration-500 ease-out">
            <Logo class="text-white" />
          </div>

          <div
            class="absolute top-10 -left-10 bg-white p-4 rounded-2xl shadow-xl z-30 animate-float-delayed hidden xl:block"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"
              >
                ✓
              </div>
              <div>
                <p class="text-slate-900 font-bold text-sm">Đã giao hàng</p>
                <p class="text-slate-500 text-xs">Vừa xong</p>
              </div>
            </div>
          </div>

          <div
            class="absolute bottom-20 -right-5 bg-white p-4 rounded-2xl shadow-xl z-30 animate-float"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs"
              >
                ★
              </div>
              <div>
                <p class="text-slate-900 font-bold text-sm">Tài xế thân thiện</p>
                <p class="text-slate-500 text-xs">Đánh giá 5 sao</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <Teleport to="body">
    <Transition name="modal-zoom">
      <div v-if="isModalOpen" class="fixed inset-0 z-[999] flex items-center justify-center px-4">
        <div
          class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          @click="isModalOpen = false"
        ></div>

        <div class="relative z-10 w-full max-w-md transform transition-all">
          <div
            class="bg-gradient-to-br from-teal-400 to-emerald-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden text-center border border-white/20"
          >
            <button
              @click="isModalOpen = false"
              class="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-1 transition z-50 cursor-pointer"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div
              class="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"
            ></div>

            <h3 class="text-3xl font-extrabold mb-1 relative z-10">Đăng nhập ngay</h3>
            <p class="text-emerald-50 mb-6 text-sm relative z-10">
              Để nhận mã giảm giá và đặt xe nhanh chóng
            </p>

            <div
              class="bg-white/10 rounded-xl p-4 mb-8 backdrop-blur-md border border-white/10 relative z-10"
            >
              <p class="font-bold text-2xl text-white">Giảm 20%</p>
              <p class="text-xs text-emerald-50 uppercase tracking-wide">Cho đơn hàng đầu tiên</p>
            </div>

            <button
              @click="navigateToLogin"
              class="w-full bg-white text-emerald-600 font-bold py-3.5 px-6 rounded-xl shadow-lg hover:bg-emerald-50 transform hover:scale-[1.02] active:scale-95 transition-all relative z-10"
            >
              Đăng nhập / Đăng ký
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import Logo from '@/assets/logo.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isModalOpen = ref(false)

const navigateToLogin = () => {
  isModalOpen.value = false
  router.push('/login')
}
</script>

<style scoped>
/* Animation cho Modal */
.modal-zoom-enter-from,
.modal-zoom-leave-to {
  opacity: 0;
}
.modal-zoom-enter-from .transform,
.modal-zoom-leave-to .transform {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
.modal-zoom-enter-active .transform,
.modal-zoom-leave-active .transform,
.modal-zoom-enter-active,
.modal-zoom-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Hiệu ứng bay nhè nhẹ cho ảnh (Float) */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}
.animate-float-delayed {
  animation: float 4s ease-in-out infinite;
  animation-delay: 2s; /* Chậm hơn 2s để không bị đồng bộ */
}
</style>
