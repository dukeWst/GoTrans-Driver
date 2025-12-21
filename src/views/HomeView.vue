<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-slate-800">
    <TheNavbar />

    <main class="flex-1 container mx-auto px-6 py-12 space-y-20">
      <Hero />
      <div class="">
        <Features />
        <HowItWorks />
        <AboutSection />
        <ServicesSection />
      </div>
    </main>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import Hero from './Hero.vue'
import HowItWorks from './HowItWorks.vue'
import AboutSection from './AboutSection.vue'
import ServicesSection from './ServicesSection.vue'

import TheFooter from '@/components/TheFooter.vue'
import TheNavbar from '@/components/TheNavbar.vue'
import Features from './Features.vue'
</script>
