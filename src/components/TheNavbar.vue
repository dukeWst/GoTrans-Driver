<template>
  <header class="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
    <div class="container mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3 cursor-pointer" @click="$router.push('/')">
        <div class="w-16 h-10 rounded-xl text-white flex items-center justify-center">
          <img :src="logo" alt="Logo" class="w-16 h-8" />
        </div>
        <div>
          <div class="font-extrabold text-lg text-slate-800 leading-none">GoTrans</div>
          <div class="text-[10px] uppercase tracking-wider text-slate-500 font-medium mt-1">
            Vận chuyển thông minh
          </div>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <RouterLink
          to="/"
          class="hover:text-emerald-600 transition-colors"
          active-class="text-emerald-600 font-bold"
        >
          Trang chủ
        </RouterLink>

        <div class="relative group" ref="dropdownRef">
          <button
            @click="toggleModal"
            class="flex items-center gap-1 hover:text-emerald-600 transition-colors py-2"
            :class="{ 'text-emerald-600 font-bold': serviceOpen }"
          >
            Dịch vụ
            <ChevronDown
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': serviceOpen }"
            />
          </button>

          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2"
          >
            <div
              v-if="serviceOpen"
              class="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden p-2"
            >
              <div
                @click="handleServiceClick('/services/move')"
                class="block px-4 py-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer"
              >
                <div class="font-semibold">Chuyển nhà</div>
                <div class="text-xs text-slate-400 font-normal">Trọn gói & Tháo lắp</div>
              </div>
              <div
                @click="handleServiceClick('/services/delivery')"
                class="block px-4 py-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer"
              >
                <div class="font-semibold">Giao hàng</div>
                <div class="text-xs text-slate-400 font-normal">Nội thành siêu tốc</div>
              </div>
            </div>
          </Transition>
        </div>

        <RouterLink
          to="/about"
          class="hover:text-emerald-600 transition-colors"
          active-class="text-emerald-600 font-bold"
        >
          Về chúng tôi
        </RouterLink>
        <RouterLink
          to="/contact"
          class="hover:text-emerald-600 transition-colors"
          active-class="text-emerald-600 font-bold"
        >
          Liên hệ
        </RouterLink>
      </nav>

      <div class="flex items-center gap-3">
        <template v-if="!session">
          <RouterLink
            to="/login"
            class="px-5 py-2.5 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 font-medium transition"
          >
            Đăng nhập
          </RouterLink>
          <RouterLink
            to="/register"
            class="hidden md:inline-flex px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all"
          >
            Đăng ký
          </RouterLink>
        </template>

        <template v-else>
          <RouterLink
            to="/dashboard"
            class="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition"
          >
            <div
              class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold"
            >
              {{ userInitials }}
            </div>
            <span class="text-sm font-semibold text-slate-700">Dashboard</span>
          </RouterLink>
        </template>
      </div>
    </div>
  </header>

  <Transition name="fade">
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
      @click.self="isModalOpen = false"
    >
      <Transition name="bounce">
        <div v-if="isModalOpen" class="relative z-10 w-full max-w-md transform transition-all">
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
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown } from 'lucide-vue-next'
import { supabase } from '@/supabase'
import logo from '../assets/logo.png'

const router = useRouter()
const serviceOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const session = ref<any>(null)
const isModalOpen = ref(false) // State mới để quản lý Modal

// Logic xử lý User/Session
const userInitials = computed(() => {
  const name = session.value?.user?.user_metadata?.full_name || 'User'
  return name.charAt(0).toUpperCase()
})

onMounted(async () => {
  // Lấy session ban đầu
  const { data } = await supabase.auth.getSession()
  session.value = data.session

  // Lắng nghe thay đổi auth (đăng nhập/đăng xuất)
  supabase.auth.onAuthStateChange((_event, _session) => {
    session.value = _session
  })

  // Click outside listener
  window.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside)
})

const toggleModal = (e: Event) => {
  e.stopPropagation() // Ngăn chặn sự kiện click lan ra window ngay lập tức
  serviceOpen.value = !serviceOpen.value
}

const closeModal = () => {
  serviceOpen.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    serviceOpen.value = false
  }
}

// Hàm mới: Xử lý click vào dịch vụ
const handleServiceClick = (path: string) => {
  closeModal() // Đóng dropdown dịch vụ

  if (session.value) {
    // Đã đăng nhập -> Chuyển hướng
    router.push(path)
  } else {
    // Chưa đăng nhập -> Hiển thị Modal
    isModalOpen.value = true
  }
}

// Hàm mới: Chuyển hướng đến trang đăng nhập khi click nút trong modal
const navigateToLogin = () => {
  isModalOpen.value = false
  router.push('/login')
}
</script>

<style scoped>
/* Thêm transition cho Modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.bounce-enter-active {
  animation: bounce-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.bounce-leave-active {
  animation: bounce-in 0.2s reverse ease-in;
}

@keyframes bounce-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
