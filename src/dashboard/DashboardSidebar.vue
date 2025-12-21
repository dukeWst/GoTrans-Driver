<template>
  <aside
    class="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10 overflow-y-auto"
  >
    <div class="p-8">
      <RouterLink to="/" class="text-2xl font-extrabold flex items-center gap-2">
        <img :src="logo" alt="Logo" class="w-16 h-8" />
        <div><span class="text-emerald-600">Go</span><span>Trans</span></div>
      </RouterLink>
    </div>

    <nav class="flex-1 px-4 space-y-2">
      <RouterLink
        to="/dashboard"
        active-class="bg-emerald-50 text-emerald-700"
        exact-active-class="bg-emerald-50 text-emerald-700"
        class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-gray-50 hover:text-slate-900 rounded-xl font-medium transition"
      >
        <LayoutDashboard class="w-5 h-5" /> Tổng quan
      </RouterLink>

      <div>
        <button
          @click="isServicesOpen = !isServicesOpen"
          :class="[
            'w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition',
            isServicesOpen
              ? 'bg-gray-50 text-slate-900'
              : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900',
          ]"
        >
          <div class="flex items-center gap-3"><Layers class="w-5 h-5" /> Dịch vụ</div>
          <ChevronDown
            class="w-4 h-4 transition-transform duration-200"
            :class="{ 'rotate-180': isServicesOpen }"
          />
        </button>

        <div v-show="isServicesOpen" class="mt-1 space-y-1 pl-4 pr-2">
          <RouterLink
            to="/dashboard/services/moving-house"
            active-class="text-emerald-600 bg-emerald-50"
            class="flex items-center gap-3 px-4 py-2 text-sm text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
          >
            <div class="w-1.5 h-1.5 rounded-full bg-current"></div>
            Chuyển nhà
          </RouterLink>

          <RouterLink
            to="/dashboard/services/delivery"
            active-class="text-emerald-600 bg-emerald-50"
            class="flex items-center gap-3 px-4 py-2 text-sm text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
          >
            <div class="w-1.5 h-1.5 rounded-full bg-current"></div>
            Giao hàng
          </RouterLink>
        </div>
      </div>

      <RouterLink
        to="/dashboard/order-list"
        active-class="bg-emerald-50 text-emerald-700"
        class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-gray-50 hover:text-slate-900 rounded-xl font-medium transition"
      >
        <Package class="w-5 h-5" /> Đơn hàng
      </RouterLink>

      <RouterLink
        to="/dashboard/profile"
        active-class="bg-emerald-50 text-emerald-700"
        class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-gray-50 hover:text-slate-900 rounded-xl font-medium transition"
      >
        <User class="w-5 h-5" /> Tài khoản
      </RouterLink>
    </nav>

    <RouterLink
      to="/dashboard/settings"
      class="flex items-center gap-3 px-8 py-3 text-slate-500 hover:bg-gray-50 hover:text-slate-900 rounded-xl font-medium transition"
    >
      <Settings class="w-5 h-5" /> Cài đặt
    </RouterLink>

    <div class="p-4 border-t border-gray-100">
      <button
        @click="onLogoutClick"
        class="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-red-50 rounded-xl font-medium transition"
      >
        <LogOut class="w-5 h-5" /> Đăng xuất
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import logo from '../assets/logo.png'
import {
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  User,
  ChevronDown,
  Layers,
} from 'lucide-vue-next'

// --- 1. Logic cho Dropdown Dịch vụ ---
const isServicesOpen = ref(false) // Mặc định đóng

// --- 2. Logic fix lỗi Logout ---
// Định nghĩa sự kiện để gửi tín hiệu ra cha (DashboardPage)
const emit = defineEmits(['logout'])

const onLogoutClick = () => {
  // Khi bấm nút, gửi sự kiện 'logout' ra ngoài
  emit('logout')
}
</script>
