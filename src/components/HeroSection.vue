<script setup>
import ShopIcon from "./ShopIcon.vue";
</script>
<template>
  <section id="inicio" class="hero">
    <div class="hero-content">
      <p class="eyebrow">
        <span class="small-line"></span> OUTLET BLANCOS QUERÉTARO
      </p>
      <h1>Calidad hotelera<br />a precio <em>inteligente.</em></h1>
      <p class="hero-description">
        Blancos nuevos y reacondicionados 100% algodón para hoteles, Airbnbs y
        alojamientos a precio de mayoreo.
      </p>
      <p class="hero-description textile-copy">
        <ShopIcon name="leaf" /><span
          >Retazo textil de algodón a la medida,<br class="desktop-break" />
          con o sin costura.</span
        >
      </p>
      <div class="hero-buttons">
        <a href="#catalogo" class="btn btn-primary"
          >Ver Catálogo <ShopIcon name="arrow"
        /></a>
      </div>
      <p class="hero-footnote">
        Recuperamos <span>•</span> reacondicionamos <span>•</span> reutilizamos
      </p>
    </div>
    <div class="hero-photo">
      <img
        src="/images/catalog/bedroom.jpeg"
        alt="Cama con sábanas blancas y fundas de almohada de nuestro catálogo"
        fetchpriority="high"
        width="1089"
        height="1445"
      />
    </div>
  </section>
  <div class="benefits">
    <div>
      <ShopIcon name="layers" /><span>Blancos hoteleros de alta calidad</span>
    </div>
    <div><ShopIcon name="leaf" /><span>Una alternativa sustentable</span></div>
    <div><ShopIcon name="pin" /><span>Punto de entrega en Querétaro</span></div>
  </div>
</template>
