<script setup lang="ts">
import { onMounted } from 'vue'
import { supabase } from '@/supabase'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { locale } = useI18n()

onMounted(async () => {
  // --- 1. XỬ LÝ THEME (SÁNG/TỐI) ---
  // Kiểm tra LocalStorage trước để áp dụng ngay lập tức, tránh bị "nháy" màn hình
  const localTheme = localStorage.getItem('theme')
  if (localTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  // --- 2. XỬ LÝ MÀN HÌNH LOADING ---
  // Tìm element loading trong index.html (nếu bạn đã thêm nó)
  const loader = document.getElementById('app-loading-overlay')
  if (loader) {
    // Đợi 1.5s để đảm bảo app load xong tài nguyên
    setTimeout(() => {
      loader.style.opacity = '0' // Hiệu ứng mờ dần (CSS transition)
      setTimeout(() => {
        loader.remove() // Xóa khỏi DOM
        document.body.style.overflow = 'auto' // Cho phép cuộn trang trở lại
      }, 500)
    }, 1500)
  }

  // --- 3. ĐỒNG BỘ CÀI ĐẶT TỪ SERVER (SUPABASE) ---
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const meta = user.user_metadata || {}

    // a. Cập nhật Ngôn ngữ (Nếu user đã lưu trước đó)
    if (meta.setting_language) {
      locale.value = meta.setting_language
    }

    // b. Cập nhật Theme (Đồng bộ lại LocalStorage cho chắc chắn)
    if (meta.setting_theme) {
      if (meta.setting_theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('theme', meta.setting_theme)
    }
  }

  // --- 4. LẮNG NGHE SỰ KIỆN AUTH ---
  supabase.auth.onAuthStateChange((event, session) => {
    // Nếu đăng xuất -> Về trang login
    if (event === 'SIGNED_OUT') {
      router.push('/login')
    }
    // Nếu vừa đăng nhập xong mà vẫn đứng ở trang login -> Vào dashboard
    if (event === 'SIGNED_IN' && router.currentRoute.value.path === '/login') {
      router.push('/dashboard')
    }
  })
})
</script>

<template>
  <router-view class="transition-colors duration-300" />
</template>
