<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import { X, Mail, Lock, User } from 'lucide-vue-next'

const router = useRouter()

// State dữ liệu
const fullName = ref('')
const email = ref('')
const password = ref('')
const agreed = ref(false)
const loading = ref(false)

// State lỗi (Object)
const errors = reactive({
  fullName: '',
  email: '',
  password: '',
  agreed: '',
  general: '',
})

const validate = () => {
  let isValid = true
  // Reset lỗi
  errors.fullName = ''
  errors.email = ''
  errors.password = ''
  errors.agreed = ''
  errors.general = ''

  if (!fullName.value.trim()) {
    errors.fullName = 'Vui lòng nhập họ và tên.'
    isValid = false
  }

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
    errors.password = 'Mật khẩu phải từ 6 ký tự trở lên.'
    isValid = false
  }

  if (!agreed.value) {
    errors.agreed = 'Bạn cần đồng ý với điều khoản sử dụng.'
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validate()) return

  try {
    loading.value = true
    const { error: apiError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: { data: { full_name: fullName.value } },
    })

    if (apiError) throw apiError

    router.push({ path: '/verify-email', query: { email: email.value } })
  } catch (err: any) {
    errors.general = err.message || 'Đăng ký thất bại. Vui lòng thử lại.'
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
          <h1 class="text-4xl font-bold text-gray-900 leading-tight">Tạo tài khoản GoTrans</h1>
          <p class="text-gray-500 mt-3">Đăng ký bằng Email để bắt đầu</p>
        </div>

        <form class="space-y-6" @submit.prevent="handleRegister">
          <div>
            <label class="block text-sm text-gray-600 mb-1">Họ và tên</label>
            <div class="relative">
              <input
                v-model="fullName"
                type="text"
                placeholder="Nguyễn Văn A"
                class="w-full border-b py-2 pl-8 focus:outline-none transition"
                :class="
                  errors.fullName
                    ? 'border-red-500 text-red-600'
                    : 'border-gray-300 focus:border-emerald-500'
                "
              />
              <User
                class="w-5 h-5 absolute left-0 top-2"
                :class="errors.fullName ? 'text-red-500' : 'text-gray-400'"
              />
            </div>
            <p v-if="errors.fullName" class="text-red-500 text-xs mt-1">{{ errors.fullName }}</p>
          </div>

          <div>
            <label class="block text-sm text-gray-600 mb-1">Email</label>
            <div class="relative">
              <input
                v-model="email"
                type="email"
                placeholder="example@domain.com"
                class="w-full border-b py-2 pl-8 focus:outline-none transition"
                :class="
                  errors.email
                    ? 'border-red-500 text-red-600'
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
            <label class="block text-sm text-gray-600 mb-1">Mật khẩu</label>
            <div class="relative">
              <input
                v-model="password"
                type="password"
                placeholder="••••••••"
                class="w-full border-b py-2 pl-8 focus:outline-none transition"
                :class="
                  errors.password
                    ? 'border-red-500 text-red-600'
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

          <div>
            <div class="flex items-center gap-3">
              <input v-model="agreed" type="checkbox" id="terms" class="cursor-pointer" />
              <label
                for="terms"
                class="text-sm text-gray-600 cursor-pointer"
                :class="{ 'text-red-500': errors.agreed }"
              >
                Tôi đồng ý với
                <a class="text-emerald-600 hover:underline"> điều khoản sử dụng </a>
              </label>
            </div>
            <p v-if="errors.agreed" class="text-red-500 text-xs mt-1">{{ errors.agreed }}</p>
          </div>

          <div
            v-if="errors.general"
            class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl"
          >
            ⚠️ {{ errors.general }}
          </div>

          <button
            :disabled="loading"
            class="w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {{ loading ? 'Đang xử lý...' : 'Đăng ký' }}
          </button>
        </form>

        <p class="mt-10 text-sm text-gray-500">
          Đã có tài khoản?
          <RouterLink to="/login" class="text-emerald-600 font-medium hover:underline">
            Đăng nhập ngay
          </RouterLink>
        </p>
      </div>
    </div>
    <div
      class="relative hidden lg:flex items-center justify-center bg-gradient-to-br from-sky-500 via-teal-500 to-emerald-500 overflow-hidden"
    >
      <div
        class="absolute top-24 left-20 w-48 h-48 rounded-2xl bg-white/20 backdrop-blur-xl shadow-xl rotate-6"
      ></div>
      <div
        class="absolute bottom-20 right-16 w-64 h-64 rounded-3xl bg-white/10 backdrop-blur-2xl shadow-2xl -rotate-12"
      ></div>
      <div class="relative z-10 text-center px-12">
        <h2 class="text-4xl font-bold text-white leading-snug">
          Bắt đầu hành trình <br />
          <span class="text-white/90">cùng GoTrans</span>
        </h2>
        <p class="text-white/80 mt-4 max-w-md mx-auto">
          Chuyển nhà, giao hàng và vận chuyển nhanh chóng – minh bạch – an toàn
        </p>
      </div>
    </div>
  </div>
</template>
