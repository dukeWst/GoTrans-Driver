// src/i18n.ts
import { createI18n } from 'vue-i18n'

const messages = {
  vi: {
    // --- SIDEBAR (Thanh bên) ---
    sidebar: {
      dashboard: 'Tổng quan',
      services: 'Dịch vụ',
      moving: 'Chuyển nhà',
      delivery: 'Giao hàng',
      orders: 'Đơn hàng',
      profile: 'Tài khoản',
      settings: 'Cài đặt',
      logout: 'Đăng xuất',
    },

    // --- DASHBOARD (Trang chủ) ---
    dashboard: {
      welcome: 'Xin chào, {name} 👋',
      welcome_sub: 'Chào mừng quay trở lại với GoTrans.',
      stats: {
        total: 'Tổng đơn',
        processing: 'Đang xử lý',
      },
      active_order: {
        title: 'Đơn hàng đang chạy',
        driver: 'Tài xế',
        pickup: 'Điểm đi',
        dropoff: 'Điểm đến',
        progress: 'Tiến độ',
      },
      empty: {
        title: 'Bạn đang rảnh rỗi?',
        desc: 'Chưa có đơn hàng nào đang thực hiện. Hãy đặt dịch vụ ngay!',
        btn: 'Đặt dịch vụ mới',
      },
      history: {
        title: 'Lịch sử gần đây',
        view_all: 'Xem tất cả',
        headers: {
          id: 'Mã đơn',
          service: 'Dịch vụ',
          date: 'Ngày',
          price: 'Giá tiền',
          status: 'Trạng thái',
        },
      },
      service_card: {
        moving: 'Chuyển nhà',
        moving_desc: 'Trọn gói, tháo lắp',
        delivery: 'Giao hàng',
        delivery_desc: 'Nội thành siêu tốc',
      },
    },

    // --- SETTINGS (Trang cài đặt) ---
    settings: {
      title: 'Cài đặt chung',
      subtitle: 'Quản lý các tùy chọn bảo mật, thông báo và giao diện.',
      menu: 'Các mục cài đặt',
      logout: 'Đăng xuất',
      tabs: {
        security: 'Bảo mật & Mật khẩu',
        notifications: 'Cài đặt Thông báo',
        general: 'Tùy chọn chung',
      },
      general: {
        title: 'Tùy chọn chung',
        language: 'Ngôn ngữ',
        theme: 'Giao diện',
        light: 'Sáng (Mặc định)',
        dark: 'Tối',
        btn_save: 'Lưu cài đặt',
        saving: 'Đang lưu...',
      },
      security: {
        title: 'Đổi mật khẩu',
        new_pass: 'Mật khẩu mới',
        confirm_pass: 'Xác nhận mật khẩu',
        placeholder: 'Ít nhất 6 ký tự',
        btn_change: 'Đổi mật khẩu',
      },
      notifications: {
        title: 'Tùy chọn Thông báo',
        order: 'Cập nhật đơn hàng',
        order_desc: 'Thông báo trạng thái đơn hàng.',
        promo: 'Khuyến mãi',
        promo_desc: 'Nhận thông tin ưu đãi.',
        email: 'Email',
        email_desc: 'Nhận hóa đơn qua email.',
      },
      danger: {
        title: 'Vùng nguy hiểm',
        desc: 'Thao tác này sẽ xóa vĩnh viễn tài khoản của bạn và không thể hoàn tác.',
        btn_delete: 'Xóa vĩnh viễn tài khoản',
      },
    },

    // --- STATUS (Trạng thái đơn hàng) ---
    status: {
      pending: 'Chờ duyệt',
      processing: 'Đang xử lý',
      shipping: 'Đang vận chuyển',
      completed: 'Hoàn tất',
      cancelled: 'Đã hủy',
    },
  },

  en: {
    // --- SIDEBAR ---
    sidebar: {
      dashboard: 'Dashboard',
      services: 'Services',
      moving: 'Moving House',
      delivery: 'Delivery',
      orders: 'My Orders',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Log out',
    },

    // --- DASHBOARD ---
    dashboard: {
      welcome: 'Hello, {name} 👋',
      welcome_sub: 'Welcome back to GoTrans.',
      stats: {
        total: 'Total Orders',
        processing: 'Processing',
      },
      active_order: {
        title: 'Active Order',
        driver: 'Driver',
        pickup: 'Pickup',
        dropoff: 'Dropoff',
        progress: 'Progress',
      },
      empty: {
        title: 'Are you free?',
        desc: 'No active orders. Book a service now!',
        btn: 'Book New Service',
      },
      history: {
        title: 'Recent History',
        view_all: 'View All',
        headers: {
          id: 'Order ID',
          service: 'Service',
          date: 'Date',
          price: 'Price',
          status: 'Status',
        },
      },
      service_card: {
        moving: 'Moving House',
        moving_desc: 'Full package, assembly',
        delivery: 'Delivery',
        delivery_desc: 'Express city',
      },
    },

    // --- SETTINGS ---
    settings: {
      title: 'General Settings',
      subtitle: 'Manage security, notifications, and interface options.',
      menu: 'Settings Menu',
      logout: 'Log out',
      tabs: {
        security: 'Security & Password',
        notifications: 'Notification Settings',
        general: 'General Options',
      },
      general: {
        title: 'General Options',
        language: 'Language',
        theme: 'Theme',
        light: 'Light (Default)',
        dark: 'Dark',
        btn_save: 'Save Settings',
        saving: 'Saving...',
      },
      security: {
        title: 'Change Password',
        new_pass: 'New Password',
        confirm_pass: 'Confirm Password',
        placeholder: 'At least 6 chars',
        btn_change: 'Update Password',
      },
      notifications: {
        title: 'Notification Preferences',
        order: 'Order Updates',
        order_desc: 'Get updates on order status.',
        promo: 'Promotions',
        promo_desc: 'Receive offers and deals.',
        email: 'Email',
        email_desc: 'Receive invoices via email.',
      },
      danger: {
        title: 'Danger Zone',
        desc: 'This action will permanently delete your account and cannot be undone.',
        btn_delete: 'Delete Account Permanently',
      },
    },

    // --- STATUS ---
    status: {
      pending: 'Pending',
      processing: 'Processing',
      shipping: 'Shipping',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
  },
}

const i18n = createI18n({
  legacy: false, // Sử dụng Composition API
  locale: 'vi', // Ngôn ngữ mặc định
  fallbackLocale: 'en',
  messages,
})

export default i18n
