<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import { X, Mail, Lock } from 'lucide-vue-next'

const router = useRouter()

// State dữ liệu
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)

// State quản lý lỗi (Object)
const errors = reactive({
  email: '',
  password: '',
  general: '', // Lỗi chung (VD: Sai tài khoản/mật khẩu từ server)
})

onMounted(() => {
  const savedEmail = localStorage.getItem('gotrans_saved_email')
  if (savedEmail) {
    email.value = savedEmail
    rememberMe.value = true
  }
})

// Hàm kiểm tra hợp lệ (Validate)
const validate = () => {
  let isValid = true

  // Reset lỗi cũ
  errors.email = ''
  errors.password = ''
  errors.general = ''

  if (!email.value) {
    errors.email = 'Vui lòng nhập email.'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = 'Email không đúng định dạng.'
    isValid = false
  }

  if (!password.value) {
    errors.password = 'Vui lòng nhập mật khẩu.'
    isValid = false
  } else if (password.value.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự.'
    isValid = false
  }

  return isValid
}

const login = async () => {
  // 1. Chạy validate trước
  if (!validate()) return

  try {
    loading.value = true

    // Xử lý ghi nhớ
    if (rememberMe.value) {
      localStorage.setItem('gotrans_saved_email', email.value)
    } else {
      localStorage.removeItem('gotrans_saved_email')
    }

    // 2. Gọi API Login
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (loginError) throw loginError

    router.push('/dashboard')
  } catch (err: any) {
    // 3. Xử lý lỗi trả về từ Supabase
    if (err.message.includes('Invalid login credentials')) {
      errors.general = 'Email hoặc mật khẩu không chính xác.'
    } else if (err.message.includes('Email not confirmed')) {
      errors.general = 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư.'
    } else {
      errors.general = err.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen relative grid grid-cols-1 lg:grid-cols-2">
    <div class="flex flex-col justify-center px-10 lg:px-20 bg-white">
      <div class="max-w-md w-full">
        <RouterLink to="/" class="inline-block mb-6">
          <X class="absolute top-10 left-10" />
        </RouterLink>

        <div class="mb-12">
          <h1 class="text-4xl font-bold text-gray-900">Đăng nhập GoTransDriver</h1>
          <p class="text-gray-500 mt-3">Chào mừng quay lại</p>
        </div>

        <form class="space-y-6" @submit.prevent="login">
          <div>
            <label class="text-sm text-gray-600">Email</label>
            <div class="relative">
              <input
                v-model="email"
                type="email"
                placeholder="example@domain.com"
                autocomplete="username"
                class="w-full border-b py-2 pl-8 outline-none transition"
                :class="
                  errors.email
                    ? 'border-red-500 text-red-600 placeholder-red-300'
                    : 'border-gray-300 focus:border-sky-500'
                "
              />
              <Mail
                class="w-5 h-5 absolute left-0 top-2"
                :class="errors.email ? 'text-red-500' : 'text-gray-400'"
              />
            </div>
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <label class="text-sm text-gray-600">Mật khẩu</label>
            <div class="relative">
              <input
                v-model="password"
                type="password"
                placeholder="••••••••"
                autocomplete="current-password"
                class="w-full border-b py-2 pl-8 outline-none transition"
                :class="
                  errors.password
                    ? 'border-red-500 text-red-600 placeholder-red-300'
                    : 'border-gray-300 focus:border-emerald-500'
                "
              />
              <Lock
                class="w-5 h-5 absolute left-0 top-2"
                :class="errors.password ? 'text-red-500' : 'text-gray-400'"
              />
            </div>
            <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center cursor-pointer">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span class="ml-2 text-sm text-gray-600">Lưu thông tin</span>
            </label>
            <a
              href="#"
              class="text-sm font-medium text-emerald-600 hover:text-emerald-500 hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>

          <div
            v-if="errors.general"
            class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center"
          >
            ⚠️ {{ errors.general }}
          </div>

          <button
            :disabled="loading"
            class="w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:opacity-90 transition"
          >
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
        </form>

        <p class="mt-10 text-sm text-gray-500">
          Chưa có tài khoản?
          <RouterLink to="/register" class="text-emerald-600 hover:underline font-bold">
            Đăng ký ngay
          </RouterLink>
        </p>
      </div>
    </div>
    <div
      class="relative hidden lg:flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-500 via-teal-500 to-emerald-500"
    >
      <div
        class="absolute top-16 left-20 w-56 h-56 rounded-3xl bg-white/20 backdrop-blur-2xl rotate-12 shadow-2xl"
      ></div>
      <div
        class="absolute bottom-20 right-24 w-72 h-72 rounded-full bg-white/10 backdrop-blur-3xl -rotate-12"
      ></div>
      <div class="relative z-10 text-center px-12">
        <h2 class="text-4xl font-bold text-white leading-snug">
          Quản lý vận chuyển <br />
          <span class="text-white/90">nhanh & thông minh</span>
        </h2>
        <p class="text-white/80 mt-4 max-w-md mx-auto">
          Theo dõi đơn hàng, tối ưu chi phí và quản lý lộ trình chỉ trong một nền tảng duy nhất.
        </p>
      </div>
    </div>
  </div>
</template>
