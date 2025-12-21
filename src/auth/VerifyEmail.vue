<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import { ArrowLeft, Mail } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// Lấy Email từ URL
const email = (route.query.email as string) || ''
const token = ref('')
const loading = ref(false)
const error = ref('')
const resendLoading = ref(false)
const resendMessage = ref('')

const verify = async () => {
  error.value = ''
  // Token email thường là 6 số
  if (!token.value || token.value.length < 8) {
    error.value = 'Vui lòng nhập đủ mã OTP.'
    return
  }

  try {
    loading.value = true

    // Xác thực OTP Email. Type 'signup' dùng khi xác thực đăng ký mới
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email,
      token: token.value,
      type: 'signup', // Quan trọng: type là 'signup' cho đăng ký email
    })

    if (verifyError) throw verifyError

    // Xác thực thành công -> Vào Dashboard
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Mã xác thực không đúng hoặc đã hết hạn.'
  } finally {
    loading.value = false
  }
}

const resendOtp = async () => {
  resendMessage.value = ''
  error.value = ''
  try {
    resendLoading.value = true
    // Gửi lại email xác thực đăng ký
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })

    if (resendError) throw resendError

    resendMessage.value = 'Đã gửi lại mã xác thực vào email!'
  } catch (err: any) {
    // Có thể Supabase giới hạn thời gian gửi lại (rate limit)
    error.value = err.message || 'Vui lòng đợi vài giây trước khi gửi lại.'
  } finally {
    resendLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen relative grid grid-cols-1 lg:grid-cols-2">
    <div class="flex flex-col justify-center px-10 lg:px-20 bg-white">
      <div class="max-w-md w-full mx-auto">
        <button
          @click="router.push('/register')"
          class="inline-flex cursor-pointer items-center text-gray-500 hover:text-gray-900 mb-8 transition"
        >
          <ArrowLeft class="w-5 h-5 mr-2" />
          Quay lại đăng ký
        </button>

        <div class="mb-10">
          <h1 class="text-4xl font-bold text-gray-900 leading-tight">Xác thực Email</h1>
          <p class="text-gray-500 mt-4 text-lg">
            Nhập mã OTP gồm 8 số đã được gửi đến hộp thư <br />
            <span class="font-bold text-gray-800 flex items-center gap-2 mt-2">
              <Mail class="w-5 h-5" /> {{ email }}
            </span>
          </p>
        </div>

        <form class="space-y-8" @submit.prevent="verify">
          <div>
            <label
              class="block text-sm font-medium text-gray-600 mb-2 uppercase tracking-wider text-center"
            >
              Mã xác thực
            </label>
            <input
              v-model="token"
              type="text"
              maxlength="8"
              placeholder="000000"
              class="w-full border-b-2 border-gray-300 py-4 text-center text-3xl font-bold tracking-[1em] text-gray-800 outline-none focus:border-emerald-500 transition-colors placeholder:text-gray-200 placeholder:tracking-normal"
            />
          </div>

          <div
            v-if="error"
            class="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-lg flex items-center"
          >
            ⚠️ {{ error }}
          </div>
          <div
            v-if="resendMessage"
            class="bg-emerald-50 text-emerald-600 text-sm px-4 py-3 rounded-lg flex items-center"
          >
            ✅ {{ resendMessage }}
          </div>

          <button
            :disabled="loading"
            class="w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-emerald-500/30"
          >
            {{ loading ? 'Đang xác thực...' : 'Xác nhận' }}
          </button>
        </form>

        <div class="mt-10 text-center">
          <p class="text-gray-500 mb-2">Bạn không nhận được email?</p>
          <p class="text-xs text-gray-400 mb-4">(Hãy kiểm tra cả mục Spam/Thư rác)</p>
          <button
            @click="resendOtp"
            :disabled="resendLoading"
            class="text-emerald-600 font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {{ resendLoading ? 'Đang gửi lại...' : 'Gửi lại mã OTP' }}
          </button>
        </div>
      </div>
    </div>

    <div
      class="relative hidden lg:flex items-center justify-center bg-gradient-to-br from-sky-500 via-teal-500 to-emerald-500 overflow-hidden"
    >
      <div
        class="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/10 backdrop-blur-2xl shadow-2xl mix-blend-overlay animate-pulse"
      ></div>
      <div
        class="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-white/10 backdrop-blur-3xl shadow-2xl mix-blend-overlay"
      ></div>

      <div class="relative z-10 text-center px-12">
        <div
          class="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-xl shadow-lg"
        >
          <Mail class="h-10 w-10 text-white" />
        </div>
        <h2 class="text-4xl font-bold text-white leading-snug">
          Bảo mật tối đa <br />
          <span class="text-white/90">An tâm vận chuyển</span>
        </h2>
        <p class="text-white/80 mt-6 max-w-md mx-auto text-lg">
          Vui lòng kiểm tra email để lấy mã xác thực kích hoạt tài khoản của bạn.
        </p>
      </div>
    </div>
  </div>
</template>
