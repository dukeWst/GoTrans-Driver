<script setup lang="ts">
import { ref, onMounted, onActivated, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import { Package, Truck, ChevronRight, Clock } from 'lucide-vue-next'

const router = useRouter()
const user = ref<any>(null)
const loading = ref(true)

// --- STATE DỮ LIỆU ---
const orders = ref<any[]>([])
const activeOrder = ref<any>(null)
const recentOrders = ref<any[]>([])
const stats = ref({
  total: 0,
  processing: 0,
})

// --- HELPERS ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
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
      return 'Đang xử lý'
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
  // loading.value = true

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    user.value = session.user

    // LOGIC MỚI: Lấy tất cả các đơn hàng đang "processing" (Chờ tài xế)
    // Thay vì get theo user_id (Lịch sử cá nhân), ta get đơn có status = processing
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'processing') // Lấy đơn đang chờ
      .order('created_at', { ascending: false })

    if (error) throw error

    if (data) {
      orders.value = data

      // 1. New Order (Đơn mới nhất) -> Có thể hiển thị nổi bật
      // Tạm thời lấy đơn đầu tiên làm "Active Order" giả lập để demo UI
      const foundActive = data[0]

      if (foundActive) {
        activeOrder.value = {
          id: foundActive.order_code || foundActive.id.slice(0, 8).toUpperCase(),
          statusLabel: 'Chờ nhận đơn', // Label custom cho driver
          status: foundActive.status,
          driver: 'Chưa có',
          vehicle: 'Xe tiêu chuẩn', // Cần mapping lại nếu có field này
          from: foundActive.pickup_address,
          to: foundActive.dropoff_address,
          progress: 10, // Mới tạo thì progress thấp
          serviceType: ['standard', 'express'].includes(foundActive.service_type)
            ? 'delivery'
            : 'moving',
        }
      } else {
        activeOrder.value = null
      }

      // 2. Available Orders List (Danh sách đơn chờ)
      // Hiển thị ở bảng bên dưới
      recentOrders.value = data.map((item: any) => ({
        id: item.order_code || item.id.slice(0, 8).toUpperCase(),
        date: new Date(item.created_at).toLocaleDateString('vi-VN'),
        type: ['standard', 'express', 'delivery'].includes(item.service_type)
          ? 'Giao hàng'
          : 'Chuyển nhà',
        price: item.total_price || 0,
        status: item.status,
        statusLabel: 'Chờ tài xế',
      }))

      // 3. Stats
      stats.value = {
        total: data.length, // Tổng đơn đang chờ
        processing: data.length,
      }
    }
  } catch (err) {
    console.error('Lỗi tải dữ liệu dashboard:', err)
  } finally {
    loading.value = false
  }
}

// --- LIFECYCLE ---
let realtimeChannel: any = null

onMounted(() => {
  fetchDashboardData()

  // Realtime subscription: Tự động cập nhật nếu có thay đổi từ DB (ví dụ mở 2 tab)
  realtimeChannel = supabase
    .channel('dashboard-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      fetchDashboardData()
    })
    .subscribe()
})

// QUAN TRỌNG: Khi quay lại tab này từ OrderList, code này sẽ chạy để lấy số liệu mới
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
                  class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-bold text-sm transition shadow-lg shadow-emerald-900/50"
                >
                  Xác nhận đơn
                </button>
                <button
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
