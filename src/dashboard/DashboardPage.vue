<script setup lang="ts">
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import DashboardSidebar from './DashboardSidebar.vue'

const router = useRouter()

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-slate-900 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300"
  >
    <DashboardSidebar @logout="handleLogout" />

    <RouterView v-slot="{ Component }">
      <KeepAlive>
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </div>
</template>
