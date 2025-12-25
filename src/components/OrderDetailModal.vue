<script setup lang="ts">
import { ref } from 'vue'
import {
  X,
  MapPin,
  User,
  Phone,
  Package,
  Container,
  Box,
  Scale,
  CreditCard,
  FileText,
  Home,
  ArrowUpCircle,
  Sofa,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-vue-next'
import { supabase } from '@/supabase'

// Interface definition
interface Order {
  id: string
  displayId: string
  date: string
  time: string
  status: 'completed' | 'shipping' | 'processing' | 'cancelled' | string
  serviceType: 'delivery' | 'moving' | string
  price: number
  from: string
  to: string
  senderName: string
  senderPhone: string
  receiverName: string
  receiverPhone: string
  packageType?: string
  weight?: number
  paymentMethod: string
  note?: string
  movingDetails?: {
    houseType?: string
    hasElevator?: string | boolean
    items?: string
    extraNote?: string
  }
}

// Props & Emits
const props = defineProps<{
  order: Order | null
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'update'])

// State
const showCancelConfirm = ref(false)
const isCancelling = ref(false)
const isConfirming = ref(false)

// Toast State (Simple local toast)
const toast = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
})

// Helpers
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'shipping': // Đang thực hiện
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'processing': // Đang xác nhận
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Hoàn tất'
    case 'shipping':
      return 'Đang thực hiện'
    case 'processing':
      return 'Đang xác nhận' // Changed as requested
    case 'cancelled':
      return 'Đã hủy'
    default:
      return status
  }
}

const getHouseTypeLabel = (type: string) => {
  switch (type) {
    case 'apartment':
      return 'Chung cư'
    case 'alley':
      return 'Trong ngõ'
    case 'street':
      return 'Mặt phố'
    default:
      return type
  }
}

// Logic Confirm (Xác nhận đơn) & Complete (Hoàn thành đơn)
const confirmOrder = async () => {
  if (!props.order) return
  isConfirming.value = true

  const newStatus = props.order.status === 'processing' ? 'shipping' : 'completed'
  const successMsg =
    props.order.status === 'processing' ? 'Đã nhận đơn thành công!' : 'Đã hoàn thành đơn hàng!'

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const driverName = user?.user_metadata?.full_name || 'Tài xế'
    const driverPhone = user?.user_metadata?.phone || ''
    const vehicleInfo = user?.user_metadata?.vehicle || 'Xe tiêu chuẩn'

    // Trong OrderDetailModal.vue -> confirmOrder

    const updatePayload: any = { status: newStatus }
    // Khi chuyển sang 'shipping', ghi thông tin tài xế
    if (newStatus === 'shipping') {
      updatePayload.driver_id = user?.id // <--- THÊM DÒNG NÀY
      updatePayload.driver_name = driverName
      updatePayload.driver_phone = driverPhone
      updatePayload.vehicle_info = vehicleInfo
    }

    const { error } = await supabase.from('orders').update(updatePayload).eq('id', props.order.id)

    if (error) throw error

    showToast(successMsg, 'success')
    emit('update') // Notify parent to refresh list
    emit('close')
  } catch (err: unknown) {
    console.error(err)
    // Cast to Error to access message safely
    const message = err instanceof Error ? err.message : 'Unknown error'
    showToast('Lỗi: ' + message, 'error')
  } finally {
    isConfirming.value = false
  }
}

// Logic Cancel
const cancelOrder = async () => {
  if (!props.order) return
  isCancelling.value = true
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', props.order.id)

    if (error) throw error

    showToast('Đã hủy đơn thành công!', 'success')
    emit('update')
    showCancelConfirm.value = false
  } catch (err: unknown) {
    console.error(err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    showToast('Lỗi: ' + message, 'error')
  } finally {
    isCancelling.value = false
  }
}

const showToast = (msg: string, type: 'success' | 'error') => {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => (toast.value.show = false), 3000)
}
</script>

<template>
  <div v-if="isOpen && order" class="fixed inset-0 z-[999] flex items-center justify-center px-4">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>

    <div
      class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col animate-fade-in-up border border-gray-100 dark:border-slate-700"
    >
      <!-- Header -->
      <div
        class="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50"
      >
        <div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Chi tiết đơn hàng
            <span class="text-sm font-normal text-slate-500 dark:text-slate-400 font-mono"
              >#{{ order.displayId }}</span
            >
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ngày tạo: {{ order.date }} - {{ order.time }}
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-full transition shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-slate-600"
        >
          <X class="w-6 h-6 text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="p-6 overflow-y-auto space-y-6">
        <!-- Status & Price -->
        <div
          class="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30"
        >
          <div class="flex items-center gap-3">
            <span
              class="px-3 py-1 rounded-full text-xs font-bold border capitalize"
              :class="getStatusColor(order.status)"
            >
              {{ getStatusLabel(order.status) }}
            </span>
            <span class="text-sm text-emerald-800 dark:text-emerald-400 font-medium">
              {{ order.serviceType === 'delivery' ? 'Giao hàng nhanh' : 'Chuyển nhà' }}
            </span>
          </div>
          <div class="text-right">
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Tổng thanh toán</p>
            <p class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {{ formatCurrency(order.price) }}
            </p>
          </div>
        </div>

        <!-- Route -->
        <div>
          <h4
            class="text-sm font-bold text-slate-900 dark:text-white uppercase mb-3 flex items-center gap-2"
          >
            <MapPin class="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> Lộ trình vận chuyển
          </h4>
          <div
            class="relative pl-6 border-l-2 border-gray-200 dark:border-slate-700 space-y-6 ml-2"
          >
            <div class="relative">
              <div
                class="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-800 border-4 border-emerald-500"
              ></div>
              <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                ĐIỂM LẤY HÀNG
              </p>
              <p
                class="text-sm text-slate-800 dark:text-slate-200 font-medium bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700"
              >
                {{ order.from }}
              </p>
            </div>
            <div class="relative">
              <div
                class="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 shadow-sm"
              ></div>
              <p class="text-xs font-bold text-orange-500 mb-1">ĐIỂM GIAO HÀNG</p>
              <p
                class="text-sm text-slate-800 dark:text-slate-200 font-medium bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700"
              >
                {{ order.to }}
              </p>
            </div>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- User Info -->
          <div class="space-y-4">
            <h4
              class="text-sm font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2"
            >
              <User class="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> Thông tin liên hệ
            </h4>
            <div
              class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-3 shadow-sm h-full"
            >
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Người gửi</p>
                <p class="font-medium text-slate-800 dark:text-white">{{ order.senderName }}</p>
                <p
                  class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5"
                >
                  <Phone class="w-3 h-3" /> {{ order.senderPhone }}
                </p>
              </div>
              <hr class="border-gray-100 dark:border-slate-700" />
              <div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Người nhận</p>
                <p class="font-medium text-slate-800 dark:text-white">{{ order.receiverName }}</p>
                <p
                  class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5"
                >
                  <Phone class="w-3 h-3" /> {{ order.receiverPhone }}
                </p>
              </div>
            </div>
          </div>

          <!-- Parcel Info -->
          <div v-if="order.serviceType === 'delivery'" class="space-y-4">
            <h4
              class="text-sm font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2"
            >
              <Package class="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> Kiện hàng & Thanh
              toán
            </h4>
            <div
              class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-3 shadow-sm h-full"
            >
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <component
                    :is="order.packageType === 'bulky' ? Container : Box"
                    class="w-4 h-4"
                  />
                  Loại kiện
                </span>
                <span
                  class="font-bold text-xs px-2 py-1 rounded border uppercase"
                  :class="
                    order.packageType === 'bulky'
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/30'
                      : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                  "
                >
                  {{ order.packageType === 'bulky' ? 'Cồng kềnh' : 'Tiêu chuẩn' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2"
                  ><Scale class="w-4 h-4" /> Khối lượng</span
                >
                <span class="font-bold text-slate-800 dark:text-white">{{ order.weight }} kg</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2"
                  ><CreditCard class="w-4 h-4" /> Thanh toán</span
                >
                <span
                  class="font-bold text-slate-800 dark:text-white uppercase text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded"
                  >{{ order.paymentMethod === 'cod' ? 'Tiền mặt' : 'Online' }}</span
                >
              </div>
              <div class="pt-2">
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <FileText class="w-3 h-3" /> Ghi chú
                </p>
                <p
                  class="text-sm text-slate-700 dark:text-slate-300 italic bg-gray-50 dark:bg-slate-700 p-2 rounded border border-gray-100 dark:border-slate-600"
                >
                  "{{ order.note }}"
                </p>
              </div>
            </div>
          </div>

          <!-- Moving Info -->
          <div v-else class="space-y-4">
            <h4
              class="text-sm font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2"
            >
              <Home class="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> Thông tin chuyển nhà
            </h4>
            <div
              class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-3 shadow-sm h-full"
            >
              <div class="flex justify-between">
                <span class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2"
                  ><Home class="w-4 h-4" /> Loại nhà</span
                >
                <span class="font-bold text-slate-800 dark:text-white">{{
                  getHouseTypeLabel(order.movingDetails?.houseType || '')
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2"
                  ><ArrowUpCircle class="w-4 h-4" /> Thang máy</span
                >
                <span class="font-bold text-slate-800 dark:text-white">{{
                  order.movingDetails?.hasElevator
                }}</span>
              </div>
              <hr class="border-gray-100 dark:border-slate-700 my-2" />
              <div class="space-y-2">
                <p
                  class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-bold"
                >
                  <Sofa class="w-3 h-3" /> Đồ đạc cần chuyển
                </p>
                <p
                  class="text-sm text-slate-800 dark:text-slate-200 bg-emerald-50/50 dark:bg-emerald-900/10 p-2 rounded border border-emerald-100 dark:border-emerald-900/30 leading-relaxed"
                >
                  {{ order.movingDetails?.items }}
                </p>
              </div>
              <div v-if="order.movingDetails?.extraNote" class="pt-1">
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <FileText class="w-3 h-3" /> Ghi chú thêm
                </p>
                <p
                  class="text-sm text-slate-700 dark:text-slate-300 italic bg-gray-50 dark:bg-slate-700 p-2 rounded border border-gray-100 dark:border-slate-600"
                >
                  "{{ order.movingDetails?.extraNote }}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div
        class="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3"
      >
        <button
          @click="$emit('close')"
          class="px-6 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
        >
          Đóng
        </button>

        <!-- Nút Xác nhận đơn -->
        <button
          v-if="order.status === 'processing'"
          @click="confirmOrder"
          :disabled="isConfirming"
          class="px-6 py-2.5 bg-emerald-600 border border-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition flex items-center gap-2"
        >
          <span
            v-if="isConfirming"
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></span>
          {{ isConfirming ? 'Đang xử lý...' : 'Xác nhận đơn' }}
        </button>

        <!-- Nút Hủy đơn -->
        <button
          v-if="order.status === 'shipping'"
          @click="showCancelConfirm = true"
          class="px-6 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition"
        >
          Hủy đơn hàng
        </button>

        <!-- Nút Hoàn thành -->
        <button
          v-if="order.status === 'shipping'"
          @click="confirmOrder"
          :disabled="isConfirming"
          class="px-6 py-2.5 bg-emerald-600 border border-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition flex items-center gap-2"
        >
          <span
            v-if="isConfirming"
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></span>
          <CheckCircle class="w-4 h-4" v-else />
          {{ isConfirming ? 'Đang xử lý...' : 'Hoàn thành' }}
        </button>
      </div>

      <!-- Cancel Confirmation -->
      <div
        v-if="showCancelConfirm"
        class="absolute inset-0 z-[60] flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm animate-fade-in"
      >
        <div
          class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border border-red-100 dark:border-red-900/30 max-w-sm w-full mx-4 text-center transform scale-100 animate-bounce-in"
        >
          <div
            class="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <AlertTriangle class="w-8 h-8 text-red-600 dark:text-red-500" />
          </div>
          <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Xác nhận hủy đơn?</h4>
          <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Bạn có chắc muốn hủy đơn hàng không?
          </p>
          <div class="flex gap-3">
            <button
              @click="showCancelConfirm = false"
              class="flex-1 py-2.5 bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition"
            >
              Không
            </button>
            <button
              @click="cancelOrder"
              :disabled="isCancelling"
              class="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span
                v-if="isCancelling"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></span>
              Đồng ý hủy
            </button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <Transition name="toast">
        <div
          v-if="toast.show"
          class="absolute top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white dark:bg-slate-800"
          :class="
            toast.type === 'success' ? 'border-emerald-500 border-l-4' : 'border-red-500 border-l-4'
          "
        >
          <div
            class="rounded-full p-1"
            :class="
              toast.type === 'success'
                ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
            "
          >
            <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5" />
            <XCircle v-else class="w-5 h-5" />
          </div>
          <div>
            <h4
              class="font-bold text-sm"
              :class="
                toast.type === 'success'
                  ? 'text-emerald-800 dark:text-emerald-400'
                  : 'text-red-800 dark:text-red-400'
              "
            >
              {{ toast.type === 'success' ? 'Thành công' : 'Thất bại' }}
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ toast.message }}</p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.animate-fade-in-up {
  animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes bounceIn {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.animate-bounce-in {
  animation: bounceIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
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
