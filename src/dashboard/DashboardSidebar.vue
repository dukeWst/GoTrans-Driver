<template>
  <aside
    class="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 hidden md:flex flex-col fixed h-full z-10 overflow-y-auto transition-colors duration-300"
  >
    <div class="p-8">
      <RouterLink to="/" class="text-2xl font-extrabold flex items-center gap-2">
        <img :src="Logo_" alt="Logo" class="w-16 h-8" />
        <div>
          <span class="text-emerald-600">Go</span
          ><span class="text-slate-800 dark:text-white">Trans</span>
        </div>
      </RouterLink>
    </div>

    <nav class="flex-1 px-4 space-y-2">
      <RouterLink
        to="/dashboard"
        active-class="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        exact-active-class="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        class="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white rounded-xl font-medium transition"
      >
        <LayoutDashboard class="w-5 h-5" /> Tổng quan
      </RouterLink>

      <!-- Drodown Services Removed for Driver -->

      <RouterLink
        to="/dashboard/order-list"
        active-class="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        class="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white rounded-xl font-medium transition"
      >
        <Package class="w-5 h-5" /> Đơn hàng
      </RouterLink>

      <RouterLink
        to="/dashboard/profile"
        active-class="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        class="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white rounded-xl font-medium transition"
      >
        <User class="w-5 h-5" /> Tài khoản
      </RouterLink>
    </nav>

    <RouterLink
      to="/dashboard/settings"
      active-class="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      class="flex items-center gap-3 px-8 py-3 text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white rounded-xl font-medium transition"
    >
      <Settings class="w-5 h-5" /> Cài đặt
    </RouterLink>

    <div class="p-4 border-t border-gray-100 dark:border-slate-700">
      <button
        @click="onLogoutClick"
        class="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition"
      >
        <LogOut class="w-5 h-5" /> Đăng xuất
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import Logo_ from '../assets/Logo_.png'
import { LayoutDashboard, LogOut, Package, Settings, User } from 'lucide-vue-next'

const emit = defineEmits(['logout'])

const onLogoutClick = () => {
  emit('logout')
}
</script>
