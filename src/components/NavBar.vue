<script setup>
import { ref } from "vue";
import ShopIcon from "./ShopIcon.vue";
defineProps({ count: Number });
defineEmits(["cart"]);
const menuOpen = ref(false);
</script>
<template>
  <header class="site-header">
    <nav class="nav-container" aria-label="Navegación principal">
      <a
        href="#inicio"
        class="brand"
        aria-label="Outlet Blancos Querétaro, inicio"
        ><img
          src="/images/catalog/logo.jpeg"
          alt=""
          width="58"
          height="52"
        /><span>OUTLET BLANCOS<small>QUERÉTARO</small></span></a
      >
      <div id="main-navigation" class="nav-links" :class="{ open: menuOpen }">
        <a href="#catalogo" @click="menuOpen = false">Catálogo</a
        ><a href="#quienes-somos" @click="menuOpen = false">Quiénes Somos</a
        ><a href="#contacto" @click="menuOpen = false">Contacto</a>
      </div>
      <div class="nav-actions">
        <button class="cart-trigger" @click="$emit('cart')">
          <ShopIcon name="bag" /><span>Mi carrito</span
          ><span class="cart-count">{{ count }}</span></button
        ><button
          class="icon-button mobile-menu"
          :aria-expanded="menuOpen"
          aria-controls="main-navigation"
          :aria-label="menuOpen ? 'Cerrar menú' : 'Abrir menú'"
          @click="menuOpen = !menuOpen"
        >
          <ShopIcon :name="menuOpen ? 'close' : 'menu'" />
        </button>
      </div>
    </nav>
  </header>
</template>
