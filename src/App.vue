<script setup lang="ts">
import { onMounted } from 'vue'
import { supabase } from '@/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(async () => {
  const localTheme = localStorage.getItem('theme')
  if (localTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  const loader = document.getElementById('app-loading-overlay')
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0'
      setTimeout(() => {
        loader.remove()
        document.body.style.overflow = 'auto'
      }, 500)
    }, 1500)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const meta = user.user_metadata || {}

    if (meta.setting_language) {
      locale.value = meta.setting_language
    }

    if (meta.setting_theme) {
      if (meta.setting_theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('theme', meta.setting_theme)
    }
  }

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      router.push('/login')
    }
    if (event === 'SIGNED_IN' && router.currentRoute.value.path === '/login') {
      router.push('/dashboard')
    }
  })
})
</script>

<template>
  <router-view class="transition-colors duration-300" />
</template>
