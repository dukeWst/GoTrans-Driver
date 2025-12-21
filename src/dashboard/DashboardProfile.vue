<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue' // Thêm onUnmounted
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Lock,
  Edit3,
  Bell,
  CheckCircle,
  XCircle,
} from 'lucide-vue-next'

const router = useRouter()
const loading = ref(true)
const saving = ref(false)
const isEditing = ref(false)

// State quản lý Toast Notification
const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
})

const stats = ref({
  total: 0,
  processing: 0,
})

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

// State cho form
const profile = ref({
  id: '',
  email: '',
  full_name: '',
  phone: '',
  address: '',
  avatar_url: '',
  role: 'member',
  join_date: '',
})

// Biến lưu trữ dữ liệu gốc
const originalProfile = ref({ ...profile.value })
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed='

// --- 1. HÀM RIÊNG ĐỂ LẤY SỐ LIỆU (Dùng cho cả lúc load trang & Realtime) ---
const fetchStats = async (userId: string) => {
  const { data: ordersData, error } = await supabase
    .from('orders')
    .select('status')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching stats:', error)
    return
  }

  if (ordersData) {
    stats.value = {
      total: ordersData.length,
      processing: ordersData.filter((o: any) => o.status === 'processing').length,
    }
  }
}

// --- 2. HÀM LẤY THÔNG TIN USER ---
const getProfile = async () => {
  try {
    loading.value = true
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const userData = {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || '',
      phone: user.user_metadata?.phone || '',
      address: user.user_metadata?.address || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      role: user.user_metadata?.role || 'Khách hàng',
      join_date: new Date(user.created_at).toLocaleDateString('vi-VN'),
    }

    profile.value = userData
    originalProfile.value = { ...userData }

    // Gọi hàm lấy số liệu ngay sau khi có ID
    await fetchStats(user.id)
  } catch (error) {
    console.error('Error fetching user:', error)
  } finally {
    loading.value = false
  }
}

// --- 3. LIFECYCLE & REALTIME SUBSCRIPTION ---
// --- 3. LIFECYCLE & REALTIME SUBSCRIPTION ---
let realtimeChannel: any = null

onMounted(async () => {
  // 1. Lấy dữ liệu lần đầu
  await getProfile()

  // 2. Nếu có user ID thì bắt đầu nghe
  if (profile.value.id) {
    console.log('🔄 Đang thiết lập kênh Realtime cho User:', profile.value.id)

    realtimeChannel = supabase
      .channel('profile-orders-monitor') // Tên kênh tùy ý
      .on(
        'postgres_changes',
        {
          event: '*', // Nghe tất cả: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${profile.value.id}`, // Chỉ nghe lệnh của chính mình
        },
        (payload) => {
          fetchStats(profile.value.id)
        },
      )
  }
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})

// --- CÁC HÀM XỬ LÝ FORM (GIỮ NGUYÊN) ---
const enableEdit = () => {
  originalProfile.value = { ...profile.value }
  isEditing.value = true
}

const cancelEdit = () => {
  profile.value = { ...originalProfile.value }
  isEditing.value = false
}

const updateProfile = async () => {
  try {
    saving.value = true
    if (!profile.value.full_name || profile.value.full_name.trim() === '') {
      profile.value.full_name = originalProfile.value.full_name
    }
    if (!profile.value.phone || profile.value.phone.trim() === '') {
      profile.value.phone = originalProfile.value.phone
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: profile.value.full_name,
        phone: profile.value.phone,
        address: profile.value.address,
      },
    })

    if (error) throw error

    originalProfile.value = { ...profile.value }
    showToast('Cập nhật thông tin thành công!', 'success')
    isEditing.value = false
  } catch (error: any) {
    showToast('Lỗi cập nhật: ' + error.message, 'error')
  } finally {
    saving.value = false
  }
}

const goToSettings = (tabName: string) => {
  router.push({ path: '/dashboard/settings', query: { tab: tabName } })
}
</script>
<template>
  <main class="flex-1 md:ml-64 p-6 lg:p-10 relative">
    <Transition name="toast">
      <div
        v-if="toast.show"
        class="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform"
        :class="
          toast.type === 'success'
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
            : 'bg-red-50/90 border-red-200 text-red-800'
        "
      >
        <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-600" />
        <XCircle v-else class="w-5 h-5 text-red-600" />
        <div>
          <h4 class="font-bold text-sm">
            {{ toast.type === 'success' ? 'Thành công' : 'Thất bại' }}
          </h4>
          <p class="text-xs opacity-90">{{ toast.message }}</p>
        </div>
      </div>
    </Transition>

    <header class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Tài khoản của tôi</h2>
        <p class="text-slate-500 mt-1">Quản lý thông tin cá nhân và bảo mật.</p>
      </div>
    </header>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="space-y-6">
        <div
          class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div
            class="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-500 to-teal-600"
          ></div>
          <div class="relative mt-8 mb-4 group">
            <div
              class="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100"
            >
              <img
                :src="profile.avatar_url || defaultAvatar + profile.full_name"
                alt="User Avatar"
                class="w-full h-full object-cover"
              />
            </div>
            <button
              class="absolute bottom-0 right-0 bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 transition shadow-lg border-2 border-white"
              title="Đổi ảnh đại diện"
            >
              <Camera class="w-4 h-4" />
            </button>
          </div>
          <h3 class="text-xl font-bold text-slate-900">
            {{ profile.full_name || 'Chưa cập nhật tên' }}
          </h3>
          <p class="text-slate-500 text-sm mb-4">{{ profile.email }}</p>
          <div class="flex gap-2 mb-6">
            <span
              class="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 uppercase tracking-wider"
              >{{ profile.role }}</span
            >
          </div>
          <div class="w-full border-t border-gray-100 pt-4 text-left">
            <div class="flex justify-between items-center py-2 text-sm">
              <span class="text-slate-500">Tham gia từ</span>
              <span class="font-medium text-slate-700">{{ profile.join_date }}</span>
            </div>
            <div class="flex justify-between items-center py-2 text-sm">
              <span class="text-slate-500">Tổng đơn hàng</span>
              <span class="font-medium text-emerald-600">{{ stats.total }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            @click="goToSettings('notifications')"
            class="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition flex items-center gap-3"
          >
            <div class="bg-blue-50 p-2 rounded-lg text-blue-600"><Bell class="w-5 h-5" /></div>
            <span class="font-medium text-slate-700">Cài đặt thông báo</span>
          </div>
          <div
            @click="goToSettings('security')"
            class="p-4 hover:bg-gray-50 cursor-pointer transition flex items-center gap-3"
          >
            <div class="bg-orange-50 p-2 rounded-lg text-orange-600"><Lock class="w-5 h-5" /></div>
            <span class="font-medium text-slate-700">Bảo mật & Mật khẩu</span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2 space-y-8">
        <div class="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User class="w-5 h-5 text-emerald-600" /> Thông tin cá nhân
            </h3>
          </div>

          <form @submit.prevent="updateProfile" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700">Họ và tên</label>
                <div class="relative">
                  <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    v-model="profile.full_name"
                    type="text"
                    :disabled="!isEditing"
                    class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-slate-800 disabled:bg-gray-100 disabled:text-slate-500 disabled:cursor-not-allowed bg-gray-50/50"
                    placeholder="Nhập họ tên của bạn"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700">Số điện thoại</label>
                <div class="relative">
                  <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    v-model="profile.phone"
                    type="tel"
                    :disabled="!isEditing"
                    class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-slate-800 disabled:bg-gray-100 disabled:text-slate-500 disabled:cursor-not-allowed bg-gray-50/50"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700">Email (Không thể thay đổi)</label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  v-model="profile.email"
                  type="email"
                  readonly
                  class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div class="pt-4 flex justify-end">
              <button
                v-if="!isEditing"
                type="button"
                @click="enableEdit"
                class="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
              >
                <Edit3 class="w-4 h-4" />
                Chỉnh sửa hồ sơ
              </button>

              <div v-else class="flex gap-3">
                <button
                  type="button"
                  @click="cancelEdit"
                  class="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  :disabled="saving"
                  class="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span
                    v-if="saving"
                    class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  ></span>
                  <Save v-else class="w-4 h-4" />
                  {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Hiệu ứng Toast Animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
