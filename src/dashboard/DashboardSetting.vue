<script setup lang="ts">
import { ref, onMounted, computed, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/supabase'
import {
  Settings,
  Lock,
  Bell,
  Globe,
  LogOut,
  Save,
  Trash2,
  ChevronDown,
  CheckCircle,
  XCircle,
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const savingPassword = ref(false)
const savingSettings = ref(false)
const userEmail = ref('')

// State quản lý Tab
const activeTab = ref('security')
const isMenuOpen = ref(false)

// --- TOAST NOTIFICATION ---
const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
})

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

// Computed labels
const tabLabels = computed(() => ({
  security: 'Bảo mật & Mật khẩu',
  notifications: 'Cài đặt Thông báo',
  general: 'Tùy chọn chung',
}))

const currentTabLabel = computed(
  () => tabLabels.value[activeTab.value as keyof typeof tabLabels.value],
)

const setActiveTab = (tabName: string) => {
  activeTab.value = tabName
  isMenuOpen.value = false
  router.replace({ query: { ...route.query, tab: tabName } })
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// State form Password (Đã thêm current_password)
const passwordForm = ref({
  current_password: '', // Thêm trường này
  new_password: '',
  confirm_password: '',
})

// State Settings
const userSettings = ref({
  order_updates: true,
  promo_notifications: false,
  email_notifications: true,
  sms_notifications: false,
  theme: 'light',
})

// --- HÀM XỬ LÝ THEME ---
const applyTheme = (theme: string) => {
  if (theme === 'dark') document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
  localStorage.setItem('theme', theme)
}

// Lifecycle
onMounted(async () => {
  const tabParam = route.query.tab as string
  if (tabParam && ['security', 'notifications', 'general'].includes(tabParam)) {
    activeTab.value = tabParam
  }
  await fetchUserSettings()
})

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && typeof newTab === 'string') activeTab.value = newTab
  },
)

// Watch theme changes for immediate effect
watch(
  () => userSettings.value.theme,
  (newTheme) => {
    applyTheme(newTheme)
  },
)

const fetchUserSettings = async () => {
  try {
    loading.value = true
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    userEmail.value = user.email || '' // Lấy email của người dùng
    const metadata = user.user_metadata || {}
    userSettings.value = {
      order_updates: metadata.setting_order_updates ?? true,
      promo_notifications: metadata.setting_promo_notifications ?? false,
      email_notifications: metadata.setting_email_notifications ?? true,
      sms_notifications: metadata.setting_sms_notifications ?? false,
      theme: metadata.setting_theme || 'light',
    }

    applyTheme(userSettings.value.theme)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}
const updatePassword = async () => {
  const { current_password, new_password, confirm_password } = passwordForm.value // Validate cơ bản

  if (!current_password) {
    return showToast('Vui lòng nhập mật khẩu hiện tại', 'error')
  }
  if (new_password !== confirm_password) {
    return showToast('Mật khẩu mới không khớp', 'error')
  }
  if (new_password.length < 6) {
    return showToast('Mật khẩu quá ngắn (tối thiểu 6 ký tự)', 'error')
  }

  if (!userEmail.value) {
    return showToast('Không tìm thấy email người dùng. Vui lòng đăng nhập lại.', 'error')
  }

  try {
    savingPassword.value = true // 1. KIỂM TRA MẬT KHẨU HIỆN TẠI (RE-AUTHENTICATE)
    // Thử đăng nhập lại bằng email hiện tại và mật khẩu hiện tại người dùng nhập

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: userEmail.value,
      password: current_password,
    })

    if (reauthError) {
      // Xử lý lỗi Re-authenticate (Mật khẩu hiện tại không đúng)
      if (
        reauthError.message.includes('Invalid login credentials') ||
        reauthError.message.includes('AuthApiError')
      ) {
        return showToast('Mật khẩu hiện tại không chính xác', 'error')
      }
      throw reauthError // Lỗi khác (ví dụ: lỗi mạng, lỗi server)
    } // 2. CẬP NHẬT MẬT KHẨU MỚI (CHỈ THỰC HIỆN KHI MẬT KHẨU HIỆN TẠI ĐÚNG)

    const { error: updateError } = await supabase.auth.updateUser({ password: new_password })
    if (updateError) throw updateError

    showToast('Cập nhật mật khẩu thành công!', 'success') // Reset form

    passwordForm.value = { current_password: '', new_password: '', confirm_password: '' }
  } catch (error: any) {
    // Supabase update user có thể tự động báo lỗi nếu phiên hết hạn,
    // nhưng ta đã re-authenticate ở bước trên nên khả năng này thấp hơn.
    // Vẫn giữ lại toast cho các lỗi khác
    showToast('Lỗi cập nhật mật khẩu: ' + error.message, 'error')
  } finally {
    savingPassword.value = false
  }
}

const updateGeneralSettings = async () => {
  try {
    savingSettings.value = true
    const { error } = await supabase.auth.updateUser({
      data: {
        setting_order_updates: userSettings.value.order_updates,
        setting_promo_notifications: userSettings.value.promo_notifications,
        setting_email_notifications: userSettings.value.email_notifications,
        setting_sms_notifications: userSettings.value.sms_notifications,
        setting_theme: userSettings.value.theme,
      },
    })

    if (error) throw error

    applyTheme(userSettings.value.theme)

    showToast('Đang lưu...'.replace('...', '') + ' thành công!', 'success')
  } catch (error: any) {
    showToast('Lỗi: ' + error.message, 'error')
  } finally {
    savingSettings.value = false
  }
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<template>
  <main
    class="flex-1 md:ml-64 p-6 lg:p-10 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300 relative"
  >
    <Transition name="toast">
      <div
        v-if="toast.show"
        class="fixed top-24 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300"
        :class="
          toast.type === 'success'
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
            : 'bg-red-50/90 border-red-200 text-red-800'
        "
      >
        <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5" />
        <XCircle v-else class="w-5 h-5" />
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
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings class="w-6 h-6 text-emerald-600" /> Cài đặt chung
        </h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">
          Quản lý các tùy chọn bảo mật, thông báo và giao diện.
        </p>
      </div>
    </header>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="space-y-6">
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors"
        >
          <div
            @click="toggleMenu"
            class="p-4 flex items-center justify-between cursor-pointer lg:cursor-default bg-gray-50 dark:bg-slate-800 lg:bg-white border-b lg:border-b-0 border-gray-100 dark:border-slate-700"
          >
            <h3 class="font-bold text-slate-800 dark:text-white lg:hidden">
              {{ currentTabLabel }}
            </h3>
            <h3 class="hidden lg:block font-bold text-slate-800 dark:text-white">
              Các mục cài đặt
            </h3>
            <ChevronDown
              class="w-5 h-5 text-slate-500 dark:text-slate-400 lg:hidden transition-transform duration-200"
              :class="{ 'rotate-180': isMenuOpen }"
            />
          </div>

          <nav
            class="transition-all duration-300 ease-in-out overflow-hidden lg:block"
            :class="
              isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 lg:max-h-full lg:opacity-100'
            "
          >
            <div
              @click="setActiveTab('security')"
              :class="{
                'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500': activeTab === 'security',
                'hover:bg-emerald-50 dark:hover:bg-slate-700 border-transparent':
                  activeTab !== 'security',
              }"
              class="p-4 cursor-pointer transition flex items-center gap-3 border-l-4"
            >
              <div class="text-orange-600"><Lock class="w-5 h-5" /></div>
              <span class="font-medium text-slate-700 dark:text-slate-200">Bảo mật & Mật khẩu</span>
            </div>
            <div
              @click="setActiveTab('notifications')"
              :class="{
                'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500':
                  activeTab === 'notifications',
                'hover:bg-emerald-50 dark:hover:bg-slate-700 border-transparent':
                  activeTab !== 'notifications',
              }"
              class="p-4 cursor-pointer transition flex items-center gap-3 border-l-4"
            >
              <div class="text-blue-600"><Bell class="w-5 h-5" /></div>
              <span class="font-medium text-slate-700 dark:text-slate-200">Cài đặt Thông báo</span>
            </div>
            <div
              @click="setActiveTab('general')"
              :class="{
                'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500': activeTab === 'general',
                'hover:bg-emerald-50 dark:hover:bg-slate-700 border-transparent':
                  activeTab !== 'general',
              }"
              class="p-4 cursor-pointer transition flex items-center gap-3 border-l-4"
            >
              <div class="text-purple-600"><Globe class="w-5 h-5" /></div>
              <span class="font-medium text-slate-700 dark:text-slate-200">Tùy chọn chung</span>
            </div>
          </nav>
        </div>

        <div
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors"
        >
          <button
            @click="handleLogout"
            class="p-4 w-full text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-3 text-red-600 font-bold"
          >
            <LogOut class="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      <div class="lg:col-span-2 space-y-8">
        <Transition name="fade" mode="out-in">
          <div v-if="activeTab === 'security'" class="space-y-8">
            <div
              class="bg-white dark:bg-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors"
            >
              <h3
                class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6 border-b dark:border-slate-700 pb-4"
              >
                <Lock class="w-5 h-5 text-orange-600" /> Đổi mật khẩu
              </h3>
              <form @submit.prevent="updatePassword" class="space-y-6">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >Mật khẩu hiện tại</label
                  >
                  <input
                    v-model="passwordForm.current_password"
                    type="password"
                    required
                    placeholder="Nhập mật khẩu hiện tại"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/50 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >Mật khẩu mới</label
                  >
                  <input
                    v-model="passwordForm.new_password"
                    type="password"
                    required
                    placeholder="Ít nhất 6 ký tự"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/50 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >Xác nhận mật khẩu</label
                  >
                  <input
                    v-model="passwordForm.confirm_password"
                    type="password"
                    required
                    placeholder="Ít nhất 6 ký tự"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/50 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div class="flex justify-end pt-2">
                  <button
                    type="submit"
                    :disabled="savingPassword"
                    class="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200 dark:shadow-none flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save v-if="!savingPassword" class="w-4 h-4" />
                    {{ savingPassword ? 'Đang lưu...' : 'Đổi mật khẩu' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div
            v-else-if="activeTab === 'notifications'"
            class="bg-white dark:bg-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors"
          >
            <h3
              class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6 border-b dark:border-slate-700 pb-4"
            >
              <Bell class="w-5 h-5 text-blue-600" /> Cài đặt Thông báo
            </h3>
            <form @submit.prevent="updateGeneralSettings" class="space-y-4">
              <div
                class="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-slate-600 bg-gray-50/30 dark:bg-slate-900/30"
              >
                <div>
                  <p class="font-medium text-slate-800 dark:text-white">Cập nhật đơn hàng</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    Thông báo trạng thái đơn hàng.
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="userSettings.order_updates"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"
                  ></div>
                </label>
              </div>

              <div
                class="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-slate-600 bg-gray-50/30 dark:bg-slate-900/30"
              >
                <div>
                  <p class="font-medium text-slate-800 dark:text-white">Khuyến mãi</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Nhận thông tin ưu đãi.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="userSettings.promo_notifications"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"
                  ></div>
                </label>
              </div>

              <div
                class="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-slate-600 bg-gray-50/30 dark:bg-slate-900/30"
              >
                <div>
                  <p class="font-medium text-slate-800 dark:text-white">Email</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">Nhận hóa đơn qua email.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="userSettings.email_notifications"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-gray-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"
                  ></div>
                </label>
              </div>

              <div class="pt-6 flex justify-end">
                <button
                  type="submit"
                  :disabled="savingSettings"
                  class="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 dark:shadow-none flex items-center gap-2 disabled:opacity-50"
                >
                  <Save v-if="!savingSettings" class="w-4 h-4" />
                  {{ savingSettings ? 'Đang lưu...' : 'Lưu cài đặt' }}
                </button>
              </div>
            </form>
          </div>

          <div v-else-if="activeTab === 'general'" class="space-y-8">
            <div
              class="bg-white dark:bg-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors"
            >
              <h3
                class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6 border-b dark:border-slate-700 pb-4"
              >
                <Globe class="w-5 h-5 text-purple-600" /> Tùy chọn chung
              </h3>
              <form @submit.prevent="updateGeneralSettings" class="space-y-6">
                <!-- Removed Language Selection -->
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >Giao diện</label
                  >
                  <select
                    v-model="userSettings.theme"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/50 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                  >
                    <option value="light">Sáng (Mặc định)</option>
                    <option value="dark">Tối</option>
                  </select>
                </div>
                <div class="pt-4 flex justify-end">
                  <button
                    type="submit"
                    :disabled="savingSettings"
                    class="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 dark:shadow-none flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save v-if="!savingSettings" class="w-4 h-4" />
                    {{ savingSettings ? 'Đang lưu...' : 'Lưu cài đặt' }}
                  </button>
                </div>
              </form>
            </div>

            <div
              class="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 lg:p-8 border border-red-200 dark:border-red-900/30 transition-colors"
            >
              <h3
                class="text-xl font-bold text-red-700 dark:text-red-500 flex items-center gap-2 mb-4"
              >
                <Trash2 class="w-5 h-5" /> Vùng nguy hiểm
              </h3>
              <p class="text-sm text-red-600 dark:text-red-400 mb-4">
                Thao tác này sẽ xóa vĩnh viễn tài khoản của bạn và không thể hoàn tác.
              </p>
              <button
                class="bg-red-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition shadow-md shadow-red-200 dark:shadow-none"
              >
                Xóa vĩnh viễn tài khoản
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
