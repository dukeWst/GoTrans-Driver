<script setup lang="ts">
import { ref, computed, onMounted, onActivated, onUnmounted } from 'vue'
import {
  Package,
  Truck,
  Calendar,
  Clock,
  ChevronRight,
  Search,
  X,
  User,
  Phone,
  MapPin,
  CreditCard,
  Scale,
  FileText,
  Box,
  Container,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Home, // Thêm icon Home
  Sofa, // Thêm icon Sofa
  ArrowUpCircle, // Thêm icon cho thang máy
} from 'lucide-vue-next'
import { supabase } from '@/supabase'

// --- 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
interface Order {
  id: string
  displayId: string
  serviceType: string
  status: string
  date: string
  time: string
  price: number
  from: string
  to: string
  senderName: string
  senderPhone: string
  receiverName: string
  receiverPhone: string
  weight: number
  packageType: 'standard' | 'bulky'
  note: string
  paymentMethod: string
  // Thêm trường cho chuyển nhà
  movingDetails?: {
    houseType: string
    hasElevator: string
    items: string
    extraNote: string
  }
}

// --- 2. QUẢN LÝ TRẠNG THÁI (STATE) ---
const loading = ref(false)
const activeFilter = ref('all')
const searchQuery = ref('')
const orders = ref<Order[]>([])
const selectedOrder = ref<Order | null>(null)

// State hủy đơn
const showCancelConfirm = ref(false)
const isCancelling = ref(false)

// State Toast
const toast = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
})
let toastTimeout: any = null

// --- 3. HELPER FUNCTIONS ---
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value.show = false
  clearTimeout(toastTimeout)
  setTimeout(() => {
    toast.value = { show: true, message, type }
  }, 100)
  toastTimeout = setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'processing':
      return 'bg-blue-100 text-blue-700 border-blue-200'
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
    case 'processing':
      return 'Đang thực hiện'
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

// Hàm tách thông tin từ Note của Chuyển nhà
const parseMovingNote = (note: string) => {
  if (!note) return null

  // Note mẫu:
  // - Loại nhà: apartment
  // - Thang máy: Có
  // - Đồ đạc (...): A, B, C

  const lines = note.split('\n')
  const houseType =
    lines
      .find((l) => l.includes('Loại nhà:'))
      ?.split(':')[1]
      ?.trim() || '---'
  const hasElevator =
    lines
      .find((l) => l.includes('Thang máy:'))
      ?.split(':')[1]
      ?.trim() || '---'
  const items =
    lines
      .find((l) => l.includes('Đồ đạc'))
      ?.split(':')[1]
      ?.trim() || 'Không có đồ đạc liệt kê'
  const extraNote =
    lines
      .find((l) => l.includes('Ghi chú thêm:'))
      ?.split(':')[1]
      ?.trim() || ''

  return { houseType, hasElevator, items, extraNote }
}

// --- 4. LẤY DỮ LIỆU TỪ SUPABASE ---
const getOrders = async () => {
  if (orders.value.length === 0) loading.value = true

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      // .eq('user_id', user.id) // CŨ: Lấy theo user_id (sai vì driver không tạo đơn)
      .eq('status', 'processing') // MỚI: Lấy đơn đang chờ
      .order('created_at', { ascending: false })

    if (error) throw error

    if (data) {
      orders.value = data.map((item: any) => {
        const dateObj = new Date(item.created_at)
        const rawType = item.service_type
        const isDeliveryGroup = ['standard', 'express', 'delivery'].includes(rawType)
        const noteContent = item.note || ''

        // Xử lý riêng cho moving house
        let movingDetails = undefined
        if (!isDeliveryGroup) {
          movingDetails = parseMovingNote(noteContent)
        }

        return {
          id: item.id,
          displayId: item.order_code || item.id.slice(0, 8).toUpperCase(),
          serviceType: isDeliveryGroup ? 'delivery' : 'moving',
          status: item.status || 'processing',
          date: dateObj.toLocaleDateString('vi-VN'),
          time: dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          price: item.total_price || 0,
          from: item.pickup_address || 'Chưa cập nhật',
          to: item.dropoff_address || 'Chưa cập nhật',
          senderName: item.sender_name || '---',
          senderPhone: item.sender_phone || '---',
          receiverName: item.receiver_name || '---',
          receiverPhone: item.receiver_phone || '---',
          weight: item.weight || 0,
          packageType: item.package_type || 'standard',
          note: noteContent,
          paymentMethod: item.payment_method || 'cod',
          movingDetails: movingDetails, // Gán data đã parse
        }
      })
    }
  } catch (error) {
    console.error('Lỗi tải đơn hàng:', error)
  } finally {
    loading.value = false
  }
}

// --- 5. LOGIC HỦY ĐƠN HÀNG ---
const requestCancel = () => {
  showCancelConfirm.value = true
}

const confirmCancelOrder = async () => {
  if (!selectedOrder.value) return
  isCancelling.value = true
  const targetId = selectedOrder.value.id

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', targetId)
      .select()

    if (error) throw error
    if (!data || data.length === 0) throw new Error('Lỗi quyền truy cập!')

    const index = orders.value.findIndex((o) => o.id === targetId)
    if (index !== -1) {
      orders.value[index].status = 'cancelled'
      orders.value = [...orders.value]
    }

    showToast('Đã hủy đơn hàng thành công!', 'success')
    showCancelConfirm.value = false
    selectedOrder.value = null
  } catch (err: any) {
    console.error(err)
    showToast('Lỗi: ' + err.message, 'error')
    showCancelConfirm.value = false
  } finally {
    isCancelling.value = false
  }
}

// --- 6. LIFECYCLE & REALTIME ---
let realtimeChannel: any = null

onMounted(() => {
  getOrders()
  realtimeChannel = supabase
    .channel('realtime-orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      getOrders()
    })
    .subscribe()
})

onActivated(() => {
  getOrders()
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})

// --- 7. LOGIC LỌC ---
const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const statusMatch = activeFilter.value === 'all' || order.status === activeFilter.value
    const searchLower = searchQuery.value.toLowerCase()
    const searchMatch =
      order.displayId.toLowerCase().includes(searchLower) ||
      order.from.toLowerCase().includes(searchLower) ||
      order.to.toLowerCase().includes(searchLower)
    return statusMatch && searchMatch
  })
})

const openDetails = (order: Order) => {
  selectedOrder.value = order
}
const closeDetails = () => {
  selectedOrder.value = null
  showCancelConfirm.value = false
}
</script>

<template>
  <main
    class="flex-1 md:ml-64 p-4 lg:p-10 bg-slate-50 dark:bg-slate-900 min-h-screen relative transition-colors duration-300"
  >
    <header
      class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
    >
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Danh sách đơn hàng</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">
          Quản lý các đơn hàng vận chuyển của bạn.
        </p>
      </div>
      <div class="relative w-full md:w-auto">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm mã đơn, tên, địa chỉ..."
          class="w-full md:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-800 dark:text-white shadow-sm transition-colors"
        />
      </div>
    </header>

    <div class="mb-6 overflow-x-auto pb-2 scrollbar-hide">
      <div class="flex gap-2 min-w-max">
        <button
          v-for="tab in [
            { id: 'all', label: 'Tất cả đơn chờ' }, 
            { id: 'processing', label: 'Đang chờ' },
            // { id: 'completed', label: 'Lịch sử' }, // Tạm ẩn
          ]"
          :key="tab.id"
          @click="activeFilter = tab.id"
          class="px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 border"
          :class="
            activeFilter === tab.id
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200 dark:shadow-none'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
          "
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
      <p class="text-slate-400 text-sm">Đang tải dữ liệu...</p>
    </div>

    <div
      v-else-if="filteredOrders.length === 0"
      class="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-300 dark:border-slate-700 transition-colors"
    >
      <div class="bg-gray-50 dark:bg-slate-700 p-4 rounded-full mb-4 transition-colors">
        <Package class="w-10 h-10 text-gray-400" />
      </div>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white">Không tìm thấy đơn hàng</h3>
      <p class="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2">
        Bạn chưa có đơn hàng nào hoặc không tìm thấy kết quả phù hợp.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div
        v-for="item in filteredOrders"
        :key="item.id"
        @click="openDetails(item)"
        class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-slate-600 transition-all group cursor-pointer"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              :class="
                item.serviceType === 'delivery'
                  ? 'bg-orange-50 text-orange-600'
                  : 'bg-purple-50 text-purple-600'
              "
            >
              <Package v-if="item.serviceType === 'delivery'" class="w-5 h-5" />
              <Truck v-else class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-slate-800 dark:text-white text-sm md:text-base">
                  {{ item.serviceType === 'delivery' ? 'Giao hàng nhanh' : 'Chuyển nhà' }}
                </h4>
                <span
                  v-if="item.packageType === 'bulky' && item.serviceType === 'delivery'"
                  class="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-orange-100 text-orange-700 border-orange-200"
                >
                  Cồng kềnh
                </span>
              </div>
              <span class="text-xs text-slate-500 font-mono">#{{ item.displayId }}</span>
            </div>
          </div>
          <span
            class="px-3 py-1 rounded-full text-xs font-bold border capitalize"
            :class="getStatusColor(item.status)"
          >
            {{ getStatusLabel(item.status) }}
          </span>
        </div>

        <div
          class="relative pl-4 border-l-2 border-gray-100 dark:border-slate-700 space-y-4 ml-2 mb-4"
        >
          <div class="relative">
            <div
              class="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-white dark:bg-slate-600 border-2 border-emerald-500"
            ></div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Điểm đi</p>
            <p class="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
              {{ item.from }}
            </p>
          </div>
          <div class="relative">
            <div class="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-500"></div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Điểm đến</p>
            <p class="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
              {{ item.to }}
            </p>
          </div>
        </div>

        <div
          class="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 dark:border-slate-700"
        >
          <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div class="flex items-center gap-1">
              <Calendar class="w-3.5 h-3.5" /> {{ item.date }}
            </div>
            <div class="flex items-center gap-1"><Clock class="w-3.5 h-3.5" /> {{ item.time }}</div>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-emerald-600">{{ formatCurrency(item.price) }}</span>
            <ChevronRight
              class="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeDetails"></div>

      <div
        class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col animate-fade-in-up"
      >
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
              Chi tiết đơn hàng
              <span class="text-sm font-normal text-slate-500 font-mono"
                >#{{ selectedOrder.displayId }}</span
              >
            </h3>
            <p class="text-sm text-slate-500 mt-1 flex items-center gap-2">
              Ngày tạo: {{ selectedOrder.date }} - {{ selectedOrder.time }}
            </p>
          </div>
          <button
            @click="closeDetails"
            class="p-2 hover:bg-white rounded-full transition shadow-sm border border-transparent hover:border-gray-200"
          >
            <X class="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-6">
          <div
            class="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-emerald-50/50 p-4 rounded-xl border border-emerald-100"
          >
            <div class="flex items-center gap-3">
              <span
                class="px-3 py-1 rounded-full text-xs font-bold border capitalize"
                :class="getStatusColor(selectedOrder.status)"
              >
                {{ getStatusLabel(selectedOrder.status) }}
              </span>
              <span class="text-sm text-emerald-800 font-medium">
                {{ selectedOrder.serviceType === 'delivery' ? 'Giao hàng nhanh' : 'Chuyển nhà' }}
              </span>
            </div>
            <div class="text-right">
              <p class="text-xs text-slate-500 mb-1">Tổng thanh toán</p>
              <p class="text-2xl font-extrabold text-emerald-600">
                {{ formatCurrency(selectedOrder.price) }}
              </p>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-bold text-slate-900 uppercase mb-3 flex items-center gap-2">
              <MapPin class="w-4 h-4 text-emerald-600" /> Lộ trình vận chuyển
            </h4>
            <div class="relative pl-6 border-l-2 border-gray-200 space-y-6 ml-2">
              <div class="relative">
                <div
                  class="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-4 border-emerald-500"
                ></div>
                <p class="text-xs font-bold text-emerald-600 mb-1">ĐIỂM LẤY HÀNG</p>
                <p
                  class="text-sm text-slate-800 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100"
                >
                  {{ selectedOrder.from }}
                </p>
              </div>
              <div class="relative">
                <div
                  class="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm"
                ></div>
                <p class="text-xs font-bold text-orange-500 mb-1">ĐIỂM GIAO HÀNG</p>
                <p
                  class="text-sm text-slate-800 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100"
                >
                  {{ selectedOrder.to }}
                </p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <h4 class="text-sm font-bold text-slate-900 uppercase flex items-center gap-2">
                <User class="w-4 h-4 text-emerald-600" /> Thông tin liên hệ
              </h4>
              <div
                class="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm h-full"
              >
                <div>
                  <p class="text-xs text-slate-500 mb-1">Người gửi</p>
                  <p class="font-medium text-slate-800">{{ selectedOrder.senderName }}</p>
                  <p class="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone class="w-3 h-3" /> {{ selectedOrder.senderPhone }}
                  </p>
                </div>
                <hr class="border-gray-100" />
                <div>
                  <p class="text-xs text-slate-500 mb-1">Người nhận</p>
                  <p class="font-medium text-slate-800">{{ selectedOrder.receiverName }}</p>
                  <p class="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone class="w-3 h-3" /> {{ selectedOrder.receiverPhone }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="selectedOrder.serviceType === 'delivery'" class="space-y-4">
              <h4 class="text-sm font-bold text-slate-900 uppercase flex items-center gap-2">
                <Package class="w-4 h-4 text-emerald-600" /> Kiện hàng & Thanh toán
              </h4>
              <div
                class="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm h-full"
              >
                <div class="flex justify-between items-center">
                  <span class="text-sm text-slate-500 flex items-center gap-2">
                    <component
                      :is="selectedOrder.packageType === 'bulky' ? Container : Box"
                      class="w-4 h-4"
                    />
                    Loại kiện
                  </span>
                  <span
                    class="font-bold text-xs px-2 py-1 rounded border uppercase"
                    :class="
                      selectedOrder.packageType === 'bulky'
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    "
                  >
                    {{ selectedOrder.packageType === 'bulky' ? 'Cồng kềnh' : 'Tiêu chuẩn' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-slate-500 flex items-center gap-2"
                    ><Scale class="w-4 h-4" /> Khối lượng</span
                  >
                  <span class="font-bold text-slate-800">{{ selectedOrder.weight }} kg</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-slate-500 flex items-center gap-2"
                    ><CreditCard class="w-4 h-4" /> Thanh toán</span
                  >
                  <span
                    class="font-bold text-slate-800 uppercase text-xs bg-gray-100 px-2 py-1 rounded"
                    >{{ selectedOrder.paymentMethod === 'cod' ? 'Tiền mặt' : 'Online' }}</span
                  >
                </div>
                <div class="pt-2">
                  <p class="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <FileText class="w-3 h-3" /> Ghi chú
                  </p>
                  <p
                    class="text-sm text-slate-700 italic bg-gray-50 p-2 rounded border border-gray-100"
                  >
                    "{{ selectedOrder.note }}"
                  </p>
                </div>
              </div>
            </div>

            <div v-else class="space-y-4">
              <h4 class="text-sm font-bold text-slate-900 uppercase flex items-center gap-2">
                <Home class="w-4 h-4 text-emerald-600" /> Thông tin chuyển nhà
              </h4>
              <div
                class="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm h-full"
              >
                <div class="flex justify-between">
                  <span class="text-sm text-slate-500 flex items-center gap-2"
                    ><Home class="w-4 h-4" /> Loại nhà</span
                  >
                  <span class="font-bold text-slate-800">{{
                    getHouseTypeLabel(selectedOrder.movingDetails?.houseType || '')
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-slate-500 flex items-center gap-2"
                    ><ArrowUpCircle class="w-4 h-4" /> Thang máy</span
                  >
                  <span class="font-bold text-slate-800">{{
                    selectedOrder.movingDetails?.hasElevator
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-slate-500 flex items-center gap-2"
                    ><CreditCard class="w-4 h-4" /> Thanh toán</span
                  >
                  <span
                    class="font-bold text-slate-800 uppercase text-xs bg-gray-100 px-2 py-1 rounded"
                    >{{ selectedOrder.paymentMethod === 'cod' ? 'Tiền mặt' : 'Online' }}</span
                  >
                </div>

                <hr class="border-gray-100 my-2" />

                <div class="space-y-2">
                  <p class="text-xs text-slate-500 flex items-center gap-1 font-bold">
                    <Sofa class="w-3 h-3" /> Đồ đạc cần chuyển
                  </p>
                  <p
                    class="text-sm text-slate-800 bg-emerald-50/50 p-2 rounded border border-emerald-100 leading-relaxed"
                  >
                    {{ selectedOrder.movingDetails?.items }}
                  </p>
                </div>

                <div v-if="selectedOrder.movingDetails?.extraNote" class="pt-1">
                  <p class="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <FileText class="w-3 h-3" /> Ghi chú thêm
                  </p>
                  <p
                    class="text-sm text-slate-700 italic bg-gray-50 p-2 rounded border border-gray-100"
                  >
                    "{{ selectedOrder.movingDetails?.extraNote }}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            @click="closeDetails"
            class="px-6 py-2.5 bg-white border border-gray-300 rounded-xl font-bold text-slate-700 hover:bg-gray-50 transition"
          >
            Đóng
          </button>
          <button
            v-if="selectedOrder.status === 'processing'"
            @click="requestCancel"
            class="px-6 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-100 transition"
          >
            Hủy đơn hàng
          </button>
        </div>

        <div
          v-if="showCancelConfirm"
          class="absolute inset-0 z-[60] flex items-center justify-center bg-white/80 backdrop-blur-sm animate-fade-in"
        >
          <div
            class="bg-white p-6 rounded-2xl shadow-2xl border border-red-100 max-w-sm w-full mx-4 text-center transform scale-100 animate-bounce-in"
          >
            <div
              class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <AlertTriangle class="w-8 h-8 text-red-600" />
            </div>
            <h4 class="text-lg font-bold text-slate-900 mb-2">Xác nhận hủy đơn?</h4>
            <p class="text-slate-500 text-sm mb-6">
              Bạn có chắc muốn hủy đơn hàng <b>#{{ selectedOrder.displayId }}</b> không? Hành động
              này không thể hoàn tác.
            </p>
            <div class="flex gap-3">
              <button
                @click="showCancelConfirm = false"
                class="flex-1 py-2.5 bg-gray-100 text-slate-700 font-bold rounded-xl hover:bg-gray-200 transition"
              >
                Không
              </button>
              <button
                @click="confirmCancelOrder"
                :disabled="isCancelling"
                class="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span
                  v-if="isCancelling"
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></span>
                {{ isCancelling ? 'Đang hủy...' : 'Đồng ý hủy' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Transition name="toast">
    <div
      v-if="toast.show"
      class="fixed top-32 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border bg-white min-w-[300px]"
      :class="
        toast.type === 'success' ? 'border-emerald-500 border-l-4' : 'border-red-500 border-l-4'
      "
    >
      <div
        class="rounded-full p-1"
        :class="
          toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
        "
      >
        <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5" />
        <XCircle v-else class="w-5 h-5" />
      </div>
      <div>
        <h4
          class="font-bold text-sm"
          :class="toast.type === 'success' ? 'text-emerald-800' : 'text-red-800'"
        >
          {{ toast.type === 'success' ? 'Thành công' : 'Thất bại' }}
        </h4>
        <p class="text-xs text-slate-500">{{ toast.message }}</p>
      </div>
      <button @click="toast.show = false" class="ml-auto text-slate-400 hover:text-slate-600">
        <X class="w-4 h-4" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
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
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes bounceIn {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  60% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}
.animate-bounce-in {
  animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
