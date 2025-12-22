<script setup lang="ts">
import { ref, onMounted, onActivated, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import { Package, Truck, ChevronRight, Clock, CheckCircle } from 'lucide-vue-next'
import OrderDetailModal from '@/components/OrderDetailModal.vue'

import type { RealtimeChannel, User } from '@supabase/supabase-js'

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

interface DashboardOrder {
  id: string
  statusLabel: string
  status: string
  driver: string
  vehicle: string
  from: string
  to: string
  progress: number
  serviceType: string
}

interface RecentOrder {
  id: string
  date: string
  type: string
  price: number
  status: string
  statusLabel: string
}

// Reuse OrderDetail structure for modal
interface OrderDetailForModal {
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
  packageType: string
  note: string
  paymentMethod: string
  movingDetails?: any
}

const router = useRouter()
const user = ref<User | null>(null) // User metadata is dynamic, keeping any for now or strictly typing if possible. 
// Supabase user is complex, 'any' is often tolerated or use Generic. Lint complained about refs but maybe tolerates if I cast.
// Actually lint said: "Unexpected any. Specify a different type."
// Let's try to type user as `any` specifically to silence or use `Record<string, any>`.
// Better: don't touch user type if complex, focus on Order types. Lint might persist on user.
// Attempt: `ref<any>` -> `ref<any>`. The lint error is explicit.
// Let's use `ref<object | null>(null)` or leave user as is and fix others first.
// Wait, I can import { User } from '@supabase/supabase-js'

const loading = ref(true)

// --- STATE DỮ LIỆU ---
const orders = ref<RawOrder[]>([])
const activeOrder = ref<DashboardOrder | null>(null)
const recentOrders = ref<RecentOrder[]>([])
const stats = ref({
  total: 0,
  processing: 0,
})

// State cho Modal & Confirm
const isConfirming = ref(false)
const showDetailModal = ref(false)
const showContactModal = ref(false)
const selectedOrderForModal = ref<OrderDetailForModal | null>(null)

// --- HELPERS ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

// Hàm parse note cho Moving House (reused)
const parseMovingNote = (note: string) => {
  if (!note) return undefined
  const lines = note.split('\n')
  return {
      houseType: lines.find((l) => l.includes('Loại nhà:'))?.split(':')[1]?.trim() || '---',
      hasElevator: lines.find((l) => l.includes('Thang máy:'))?.split(':')[1]?.trim() || '---',
      items: lines.find((l) => l.includes('Đồ đạc'))?.split(':')[1]?.trim() || 'Không có đồ đạc',
      extraNote: lines.find((l) => l.includes('Ghi chú thêm:'))?.split(':')[1]?.trim() || ''
  }
}

const getProgress = (status: string) => {
  switch (status) {
    case 'pending':
      return 10
    case 'processing':
      return 50
    case 'shipping':
      return 80
    case 'completed':
      return 100
    case 'cancelled':
      return 0
    default:
      return 0
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Hoàn tất'
    case 'processing':
      return 'Đang xác nhận'
    case 'shipping': 
      return 'Đang thực hiện'
    case 'cancelled':
      return 'Đã hủy'
    default:
      return 'Chờ duyệt'
  }
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

// --- FETCH DATA ---
const fetchDashboardData = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    user.value = session.user

    // Lấy đơn processing (chờ xác nhận) HOẶC shipping (đang thực hiện)
    // Để driver thấy được đơn mình đã nhận
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      // .eq('status', 'processing') // Chỉ lấy processing thì khi accept xong sẽ mất khỏi dash?
      // User request: "khi chưa bấm xác nhận... status là đang xác nhận... sau khi bấm ... chuyển sang đang thực hiện"
      // Driver cần thấy cả processing (để nhận) và shipping (để làm).
      // Tạm thời lấy cả 2 hoặc fetch hết rồi filter client.
      // Dùng .in() cho status
      .in('status', ['processing', 'shipping', 'completed', 'cancelled']) 
      .order('created_at', { ascending: false })

    if (error) throw error

    if (data) {
      orders.value = data as RawOrder[]

        // Logic chọn Active Order: Ưu tiên đơn 'shipping' (đang làm), sau đó đến đơn mới nhất 'processing'
      // Sort: shipping lên đầu
      const sorted = [...data].sort((a, b) => {
          if (a.status === 'shipping' && b.status !== 'shipping') return -1
          if (b.status === 'shipping' && a.status !== 'shipping') return 1
          return 0
      })

      // Filter: Active order chỉ lấy shipping hoặc processing. Completed/cancelled chỉ hiện ở Recent Activity.
      const foundActive = sorted.find((order: any) => ['processing', 'shipping'].includes(order.status))

      if (foundActive) {
        activeOrder.value = {
          id: foundActive.order_code || foundActive.id.slice(0, 8).toUpperCase(),
          statusLabel: getStatusLabel(foundActive.status),
          status: foundActive.status,
          driver: 'Chưa có', // Backend field
          vehicle: 'Xe tiêu chuẩn', 
          from: foundActive.pickup_address,
          to: foundActive.dropoff_address,
          progress: getProgress(foundActive.status),
          serviceType: ['standard', 'express', 'delivery'].includes(foundActive.service_type) ? 'delivery' : 'moving',
        }
      } else {
        activeOrder.value = null
      }

      recentOrders.value = data.map((item: RawOrder) => ({
        id: item.order_code || item.id.slice(0, 8).toUpperCase(),
        date: new Date(item.created_at).toLocaleDateString('vi-VN'),
        type: ['standard', 'express', 'delivery'].includes(item.service_type) ? 'Giao hàng' : 'Chuyển nhà',
        price: item.total_price || 0,
        status: item.status,
        statusLabel: getStatusLabel(item.status),
      }))

      stats.value = {
        total: data.length,
        processing: data.filter(x => x.status === 'processing').length,
      }
    }
  } catch (err) {
    console.error('Lỗi tải dữ liệu:', err)
  } finally {
    loading.value = false
  }
}

// Helper prepare data for modal (shared between Detail and Contact)
const prepareModalData = () => {
    const active = activeOrder.value
    if (!active) return false
    
    // Tìm order object gốc tương ứng với activeOrder
    const raw = orders.value.find(o => (o.order_code === active.id) || (o.id.slice(0,8).toUpperCase() === active.id))
    
    if (!raw) return false

    const dateObj = new Date(raw.created_at)
    const isDeliveryGroup = ['standard', 'express', 'delivery'].includes(raw.service_type)

    selectedOrderForModal.value = {
        id: raw.id,
        displayId: raw.order_code || raw.id.slice(0, 8).toUpperCase(),
        serviceType: isDeliveryGroup ? 'delivery' : 'moving',
        status: raw.status,
        date: dateObj.toLocaleDateString('vi-VN'),
        time: dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        price: raw.total_price || 0,
        from: raw.pickup_address,
        to: raw.dropoff_address,
        senderName: raw.sender_name || '---',
        senderPhone: raw.sender_phone || '---',
        receiverName: raw.receiver_name || '---',
        receiverPhone: raw.receiver_phone || '---',
        weight: raw.weight || 0,
        packageType: raw.package_type || 'standard',
        note: raw.note || '',
        paymentMethod: raw.payment_method || 'cod',
        movingDetails: !isDeliveryGroup ? parseMovingNote(raw.note || '') : undefined,
    }
    return true
}

// Logic mở modal chi tiết từ Dashboard
const openActiveOrderDetails = () => {
    if (prepareModalData()) {
        showDetailModal.value = true
    }
}



// Logic Confirm
const confirmActiveOrder = async () => {
    const active = activeOrder.value
    // Tìm đơn tương ứng
    if (!active) return
    const raw = orders.value.find(o => (o.order_code === active.id) || (o.id.slice(0,8).toUpperCase() === active.id))
    if (!raw) return
    
    // Nếu status là processing -> Confirm
    if (active.status === 'processing') {
      isConfirming.value = true
      try {
          const { error } = await supabase
              .from('orders')
              .update({ status: 'shipping' })
              .eq('id', raw.id)
          
          if (error) throw error
          await fetchDashboardData()
      } catch (e) {
          console.error(e)
      } finally {
          isConfirming.value = false
      }
    } 
    // Nếu status là shipping -> Complete
    else if (active.status === 'shipping') {
       isConfirming.value = true
       try {
          const { error } = await supabase
              .from('orders')
              .update({ status: 'completed' })
              .eq('id', raw.id)
          
          if (error) throw error
          // Sau khi hoàn thành, order sẽ mất khỏi Active (vì logic sort/filter của ta).
          // Active order sẽ chuyển sang đơn shipping tiếp theo hoặc null.
          await fetchDashboardData()
      } catch (e) {
          console.error(e)
      } finally {
          isConfirming.value = false
      }
    }
}


// --- LIFECYCLE ---
let realtimeChannel: RealtimeChannel | null = null

onMounted(() => {
  fetchDashboardData()
  realtimeChannel = supabase
    .channel('dashboard-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      fetchDashboardData()
    })
    .subscribe()
})

onActivated(() => {
  fetchDashboardData()
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})

</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-slate-900 flex font-sans text-slate-800 dark:text-slate-200 w-full transition-colors duration-300"
  >
    <main class="flex-1 md:ml-64 p-6 lg:p-10 w-full transition-all duration-300">
      <header class="flex flex-col md:flex-row justify-between md:items-center mb-10 gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
            Xin chào, {{ user?.user_metadata?.full_name || 'Tài xế' }} 👋
          </h2>
          <p class="text-slate-500 dark:text-slate-400 mt-1">
            Chào mừng quay trở lại với GoTransDriver.
          </p>
        </div>
      </header>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div class="xl:col-span-2 space-y-8">
          <!-- Loading State -->
          <div
            v-if="loading"
            class="h-64 bg-white dark:bg-slate-800 rounded-2xl animate-pulse flex items-center justify-center border border-gray-100 dark:border-slate-700"
          >
            <div
              class="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"
            ></div>
          </div>

          <!-- Active Order Card -->
          <div
            v-else-if="activeOrder"
            class="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group transition-all hover:shadow-2xl"
          >
            <!-- ... existing content for active order ... -->
            <div
              class="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition duration-700"
            ></div>

            <div class="flex justify-between items-start mb-6 relative z-10">
              <div>
                <span
                  class="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 uppercase tracking-wider animate-pulse"
                >
                  {{ activeOrder.statusLabel }}
                </span>
                <h3 class="text-xl font-bold mt-3 flex items-center gap-2">
                  Đơn hàng #{{ activeOrder.id }}
                </h3>
                <p class="text-slate-400 text-sm mt-1 flex items-center gap-2">
                  Khách hàng: <span class="text-white font-medium">Nguyễn Văn Khách</span> •
                  {{ activeOrder.vehicle }}
                </p>
              </div>
              <div
                class="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5 shadow-inner"
              >
                <Truck
                  v-if="activeOrder.serviceType === 'moving'"
                  class="w-8 h-8 text-emerald-400"
                />
                <Package v-else class="w-8 h-8 text-orange-400" />
              </div>
            </div>

            <div class="space-y-4 relative z-10 my-6 pl-1">
              <div class="flex gap-4 relative">
                <div class="absolute left-[5.5px] top-3 bottom-0 w-0.5 bg-slate-700 h-full"></div>
                <div class="flex flex-col items-center relative z-10">
                  <div
                    class="w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  ></div>
                </div>
                <div>
                  <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Điểm nhận hàng
                  </p>
                  <p class="font-medium text-sm text-slate-100 mt-0.5 line-clamp-1">
                    {{ activeOrder.from }}
                  </p>
                </div>
              </div>

              <div class="flex gap-4 relative z-10 pt-2">
                <div class="flex flex-col items-center">
                  <div class="w-3 h-3 bg-white rounded-full border-2 border-slate-500"></div>
                </div>
                <div>
                  <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Điểm trả hàng
                  </p>
                  <p class="font-medium text-sm text-slate-100 mt-0.5 line-clamp-1">
                    {{ activeOrder.to }}
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-8 relative z-10">
              <div class="flex justify-between text-xs text-slate-400 mb-2 font-medium">
                <span>Tiến độ chuyến đi</span>
                <span class="text-emerald-400">{{ activeOrder.progress }}%</span>
              </div>
              <div class="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                  <div
                  class="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  :style="{ width: activeOrder.progress + '%' }"
                ></div>
              </div>
              <div class="mt-6 flex gap-3">
                <button
                  @click="confirmActiveOrder"
                  :disabled="isConfirming || activeOrder.status !== 'processing'"
                  v-if="activeOrder.status === 'processing'"
                  class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-bold text-sm transition shadow-lg shadow-emerald-900/50 flex justify-center items-center gap-2"
                >
                  <span v-if="isConfirming" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {{ isConfirming ? 'Đang xử lý...' : 'Xác nhận đơn' }}
                </button>
                <button
                  v-if="activeOrder.status === 'shipping'"
                  @click="confirmActiveOrder"
                  :disabled="isConfirming"
                  class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-bold text-sm transition shadow-lg shadow-emerald-900/50 flex justify-center items-center gap-2"
                >
                  <span v-if="isConfirming" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <CheckCircle class="w-4 h-4" v-else /> 
                  {{ isConfirming ? 'Đang xử lý...' : 'Hoàn thành đơn' }}
                </button>

                <button
                  @click="openActiveOrderDetails"
                  class="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-bold text-sm transition"
                >
                  Chi tiết
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else
            class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 text-center flex flex-col items-center justify-center h-64 animate-fade-in transition-colors"
          >
            <div class="bg-gray-100 dark:bg-slate-700 p-4 rounded-full mb-4 transition-colors">
              <Truck class="w-8 h-8 text-gray-500 dark:text-slate-400" />
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Chưa có đơn hàng mới</h3>
            <p class="text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">
              Hiện tại khu vực xung quanh chưa có đơn hàng nào. Hệ thống sẽ tự động cập nhật khi có đơn mới.
            </p>
          </div>

          <!-- Recent Activity -->
          <div
            class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors"
          >
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock class="w-5 h-5 text-emerald-600" /> Đơn hàng chờ nhận
              </h3>
              <RouterLink
                to="/dashboard/order-list"
                class="text-emerald-600 text-sm font-bold hover:underline flex items-center group"
              >
                Xem tất cả
                <ChevronRight class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </RouterLink>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr
                    class="text-left text-xs text-slate-400 border-b border-gray-100 dark:border-slate-700 uppercase tracking-wider"
                  >
                    <th class="pb-3 font-semibold pl-2">Mã đơn</th>
                    <th class="pb-3 font-semibold">Loại xe</th>
                    <th class="pb-3 font-semibold">Ngày</th>
                    <th class="pb-3 font-semibold text-right">Thu nhập</th>
                    <th class="pb-3 font-semibold text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody class="text-sm">
                  <tr v-if="recentOrders.length === 0">
                    <td colspan="5" class="py-8 text-center text-slate-400 italic">
                      Chưa có chuyến đi nào
                    </td>
                  </tr>
                  <tr
                    v-for="order in recentOrders"
                    :key="order.id"
                    class="group border-b border-gray-50 dark:border-slate-700/50 last:border-0 hover:bg-gray-50/80 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td
                      class="py-4 font-bold text-slate-800 dark:text-slate-200 pl-2 group-hover:text-emerald-600 transition"
                    >
                      #{{ order.id }}
                    </td>
                    <td class="py-4 text-slate-600 dark:text-slate-400 font-medium">
                      <div class="flex items-center gap-2">
                        <component
                          :is="order.type === 'Giao hàng' ? Package : Truck"
                          class="w-4 h-4 text-slate-400"
                        />
                        {{ order.type }}
                      </div>
                    </td>
                    <td class="py-4 text-slate-500 dark:text-slate-400">{{ order.date }}</td>
                    <td class="py-4 font-bold text-emerald-600 text-right">
                      +{{ formatCurrency(order.price * 0.8) }}
                      <!-- Giả lập thu nhập 80% -->
                    </td>
                    <td class="py-4 text-center">
                      <span
                        class="px-2.5 py-1 rounded-full text-xs font-bold border capitalize"
                        :class="getStatusColor(order.status)"
                      >
                        {{ order.statusLabel }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="space-y-8">
          <!-- Stats Cards -->
          <div
            class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors"
          >
            <h3 class="text-lg font-bold mb-4 text-slate-900 dark:text-white">
              Thống kê tháng này
            </h3>
            <div class="space-y-4">
              <div
                class="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full bg-emerald-200 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400"
                  >
                    <span class="font-bold">$</span>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Tổng thu nhập
                    </p>
                    <p class="font-bold text-slate-800 dark:text-white text-lg">15.5 tr</p>
                  </div>
                </div>
              </div>
              <div
                class="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400"
                  >
                    <Truck class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Đã hoàn thành
                    </p>
                    <p class="font-bold text-slate-800 dark:text-white text-lg">
                      {{ stats.total }} chuyến
                    </p>
                  </div>
                </div>
              </div>
              <div
                class="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/20"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full bg-orange-200 dark:bg-orange-900/30 flex items-center justify-center text-orange-700 dark:text-orange-400"
                  >
                    <span class="font-bold">★</span>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Đánh giá chung
                    </p>
                    <p class="font-bold text-slate-800 dark:text-white text-lg">4.9/5.0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Promo Card (Already dark mode compatible by design, mostly) -->
          <div
            class="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
          >
            <!-- ... existing promo content ... -->
            <div class="relative z-10">
              <h3 class="font-bold text-lg mb-2">Thưởng thi đua tuần</h3>
              <p class="text-white/80 text-sm mb-4">
                Hoàn thành thêm 5 chuyến xe nữa để nhận thưởng 500k!
              </p>
              <div class="w-full bg-black/20 rounded-full h-2.5 mb-2">
                <div class="bg-yellow-400 h-2.5 rounded-full" style="width: 70%"></div>
              </div>
              <div class="flex justify-between text-xs text-white/70 font-medium">
                <span>15/20 chuyến</span>
                <span>Còn 2 ngày</span>
              </div>
            </div>
            <!-- Decor -->
            <div
              class="absolute -right-5 -bottom-5 w-32 h-32 bg-white/10 rounded-full blur-2xl"
            ></div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div
              class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 flex flex-col justify-center items-center text-center hover:shadow-md transition-colors"
            >
              <div class="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">
                Tỉ lệ nhận
              </div>
              <div class="text-2xl font-extrabold text-slate-800 dark:text-white">98%</div>
            </div>
            <div
              class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 flex flex-col justify-center items-center text-center hover:shadow-md transition-colors"
            >
              <div class="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">
                Tỉ lệ hủy
              </div>
              <div class="text-2xl font-extrabold text-slate-800 dark:text-white">1%</div>
            </div>
          </div>
        </div>
      </div>
          
      <OrderDetailModal 
        :isOpen="showDetailModal" 
        :order="selectedOrderForModal" 
        @close="showDetailModal = false"
        @update="fetchDashboardData"
      />

      <!-- Contact Modal -->
      <div v-if="showContactModal && activeOrder" class="fixed inset-0 z-[1000] flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showContactModal = false"></div>
        <div class="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 relative z-10 animate-fade-in-up shadow-2xl">
           <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Phone class="w-5 h-5 text-blue-500" /> Liên hệ
              </h3>
              <button @click="showContactModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X class="w-6 h-6" />
              </button>
           </div>
           
           <div class="space-y-6">
              <!-- Sender -->
              <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <User class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Người gửi</p>
                    <p class="text-slate-900 dark:text-white font-bold text-lg leading-tight">{{ selectedOrderForModal?.senderName || '---' }}</p>
                    <a :href="`tel:${selectedOrderForModal?.senderPhone}`" class="text-blue-500 font-medium hover:underline flex items-center gap-1 mt-1">
                      {{ selectedOrderForModal?.senderPhone || '---' }}
                    </a>
                  </div>
              </div>

               <div class="h-px bg-gray-100 dark:bg-slate-700 w-full"></div>

              <!-- Receiver -->
              <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <User class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Người nhận</p>
                    <p class="text-slate-900 dark:text-white font-bold text-lg leading-tight">{{ selectedOrderForModal?.receiverName || '---' }}</p>
                    <a :href="`tel:${selectedOrderForModal?.receiverPhone}`" class="text-blue-500 font-medium hover:underline flex items-center gap-1 mt-1">
                      {{ selectedOrderForModal?.receiverPhone || '---' }}
                    </a>
                  </div>
              </div>
           </div>

           <button @click="showContactModal = false" class="w-full mt-8 bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
              Đóng
           </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
