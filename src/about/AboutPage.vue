<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-slate-800">
    <TheNavbar />

    <main class="flex-1">
      <section
        class="relative py-20 bg-gradient-to-br from-teal-500 to-emerald-700 text-white overflow-hidden"
      >
        <div
          class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"
        ></div>
        <div class="container mx-auto px-6 text-center relative z-10">
          <h1 class="text-4xl lg:text-5xl font-extrabold mb-4">Câu chuyện của GoTrans</h1>
          <p class="text-emerald-100 text-lg max-w-2xl mx-auto">
            Hành trình kiến tạo tiêu chuẩn vận chuyển mới tại Việt Nam - Nơi công nghệ gặp gỡ sự tận
            tâm.
          </p>
        </div>
      </section>

      <section class="py-20 container mx-auto px-6">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div class="relative">
            <div
              class="absolute -top-4 -left-4 w-24 h-24 bg-emerald-100 rounded-full blur-2xl"
            ></div>
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              class="relative rounded-3xl shadow-2xl z-10 transform hover:scale-[1.02] transition duration-500"
              alt="Team meeting"
            />
            <div
              class="absolute -bottom-6 -right-6 w-48 h-48 bg-teal-100 rounded-full blur-3xl -z-0"
            ></div>
          </div>

          <div class="space-y-6">
            <h2 class="text-3xl font-bold text-slate-900">Sứ mệnh của chúng tôi</h2>
            <p class="text-slate-600 leading-relaxed">
              Thành lập từ năm 2018, GoTrans ra đời với một trăn trở duy nhất: "Tại sao việc chuyển
              nhà lại phải vất vả và thiếu minh bạch đến thế?".
            </p>
            <p class="text-slate-600 leading-relaxed">
              Chúng tôi không chỉ cung cấp xe tải, chúng tôi cung cấp sự an tâm. Bằng việc áp dụng
              công nghệ vào quy trình báo giá và điều phối, GoTrans đã loại bỏ hoàn toàn nỗi lo
              "chặt chém" giá cả và sự chậm trễ thường thấy trong ngành vận tải truyền thống.
            </p>

            <div class="grid grid-cols-2 gap-6 pt-4">
              <div class="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <p class="text-3xl font-bold text-emerald-600">5+</p>
                <p class="text-sm text-slate-500 font-medium">Năm kinh nghiệm</p>
              </div>
              <div class="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <p class="text-3xl font-bold text-emerald-600">98%</p>
                <p class="text-sm text-slate-500 font-medium">Khách hàng hài lòng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-20 bg-white">
        <div class="container mx-auto px-6">
          <div class="text-center max-w-2xl mx-auto mb-16">
            <h2 class="text-3xl font-bold text-slate-900">Giá trị cốt lõi</h2>
            <p class="text-slate-500 mt-2">Kim chỉ nam cho mọi hành động của người GoTrans</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div
              v-for="val in values"
              :key="val.title"
              class="text-center p-8 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition duration-300 group"
            >
              <div
                class="w-16 h-16 mx-auto bg-white rounded-full shadow-md flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition"
              >
                <component :is="val.icon" class="w-8 h-8" />
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">{{ val.title }}</h3>
              <p class="text-slate-600 text-sm leading-relaxed">{{ val.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="py-20 container mx-auto px-6 text-center">
        <div
          class="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-12 text-white relative overflow-hidden shadow-xl"
        >
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <h2 class="text-3xl font-bold mb-6 relative z-10">Sẵn sàng trải nghiệm dịch vụ 5 sao?</h2>
          <button
            class="px-8 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 shadow-lg transition transform hover:-translate-y-1 relative z-10"
          >
            Liên hệ ngay
          </button>
        </div>
      </section>
    </main>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheNavbar from '@/components/TheNavbar.vue'
import TheFooter from '@/components/TheFooter.vue'
import { Heart, Users, Clock } from 'lucide-vue-next'

const values = [
  {
    icon: Heart,
    title: 'Tận Tâm',
    desc: 'Chúng tôi coi tài sản của khách hàng như tài sản của chính mình. Nâng niu từng món đồ nhỏ nhất.',
  },
  {
    icon: Users,
    title: 'Con Người',
    desc: 'Tài xế và nhân viên được đào tạo bài bản không chỉ về kỹ năng mà còn về thái độ phục vụ văn minh.',
  },
  {
    icon: Clock,
    title: 'Tốc Độ',
    desc: 'Tối ưu hóa quy trình để tiết kiệm thời gian quý báu của khách hàng, nhưng không bao giờ làm ẩu.',
  },
]
</script>
