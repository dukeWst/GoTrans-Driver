<script setup lang="ts">
import { ref, computed, onMounted, onActivated, onUnmounted } from 'vue'
import {
  Package,
  Truck,
  Calendar,
  Clock,
  ChevronRight,
  Search,
} from 'lucide-vue-next'
import { supabase } from '@/supabase'
import OrderDetailModal from '@/components/OrderDetailModal.vue'

interface RawOrder {
  id: string
  created_at: string
  order_code: string
  service_type: string
  status: string
  pickup_address: string
  dropoff_address: string
  total_price: number
  sender_name: string
  sender_phone: string
  receiver_name: string
  receiver_phone: string
  weight: number
  package_type: string
  note: string
  payment_method: string
}

// ... existing code ...
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
      return 'Đang xác nhận' // Updated
    case 'shipping':
        return 'Đang thực hiện' // Updated
    case 'cancelled':
      return 'Đã hủy'
    default:
      return status
  }
}



// Hàm tách thông tin từ Note của Chuyển nhà
const parseMovingNote = (note: string) => {
  if (!note) return undefined

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
      orders.value = data.map((item: RawOrder) => {
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
          packageType: item.package_type === 'bulky' ? 'bulky' : 'standard',
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

// --- 5. LOGIC (CANCEL ĐÃ CHUYỂN VÀO MODAL) --- 

const clearSelection = () => {
    selectedOrder.value = null
}

const handleOrderUpdate = () => {
    // Reload list when modal actions (confirm/cancel) occur
    getOrders()
    clearSelection()
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
  selectedOrder.value = null
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

    <OrderDetailModal 
      :isOpen="!!selectedOrder" 
      :order="selectedOrder" 
      @close="closeDetails"
      @update="handleOrderUpdate"
    />
  </main>


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
