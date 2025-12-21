<template>
  <section class="py-24 px-6 lg:px-24 bg-white overflow-hidden relative">
    <div
      class="absolute -right-20 top-20 w-96 h-96 bg-emerald-50 rounded-full blur-3xl pointer-events-none"
    ></div>

    <div class="grid md:grid-cols-2 gap-16 items-center relative z-10">
      <div class="order-2 md:order-1">
        <h2 class="text-3xl lg:text-4xl font-bold mb-6 text-slate-900">Về GoTrans</h2>

        <p class="text-slate-600 leading-relaxed text-lg mb-6">
          GoTrans được thành lập với sứ mệnh
          <span
            class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500"
          >
            định nghĩa lại tiêu chuẩn vận chuyển
          </span>
          tại Việt Nam. Chúng tôi kết hợp công nghệ định vị chính xác và đội ngũ nhân sự tận tâm.
        </p>

        <div class="space-y-4">
          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 mt-1"
            >
              <span class="font-bold">01</span>
            </div>
            <div>
              <h4 class="font-bold text-slate-900">Minh bạch tuyệt đối</h4>
              <p class="text-slate-500 text-sm">
                Hệ thống báo giá tự động, cam kết không phát sinh chi phí ngoài hợp đồng.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 mt-1"
            >
              <span class="font-bold">02</span>
            </div>
            <div>
              <h4 class="font-bold text-slate-900">Nhân sự tận tâm</h4>
              <p class="text-slate-500 text-sm">
                Tài xế và nhân viên bốc xếp được đào tạo bài bản về thái độ và kỹ năng.
              </p>
            </div>
          </div>
        </div>
        <RouterLink to="/about">
          <button
            class="mt-8 border-b-2 border-emerald-500 text-emerald-700 font-bold pb-1 hover:text-emerald-500 transition"
          >
            Tìm hiểu thêm về văn hóa GoTrans
          </button>
        </RouterLink>
      </div>

      <div class="order-1 md:order-2 relative rounded-3xl overflow-hidden shadow-2xl group">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          class="object-cover w-full h-[500px] transform group-hover:scale-105 transition duration-700"
        />
        <div class="absolute bottom-8 left-8 z-20 text-white">
          <p class="text-3xl font-bold">5000+</p>
          <p class="text-white/80">Khách hàng hài lòng</p>
        </div>
      </div>
    </div>
  </section>
</template>
