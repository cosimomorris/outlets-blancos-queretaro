<script setup>
import NavBar from './components/NavBar.vue'
import HeroSection from './components/HeroSection.vue'
import QuienesSomos from './components/QuienesSomos.vue'
import CatalogoSection from './components/CatalogoSection.vue'
import ContactoSection from './components/ContactoSection.vue'
import FooterSection from './components/FooterSection.vue'
</script>

<template>
  <div id="app">
    <NavBar />
    <main>
      <HeroSection />
      <QuienesSomos />
      <CatalogoSection />
      <ContactoSection />
    </main>
    <FooterSection />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>
