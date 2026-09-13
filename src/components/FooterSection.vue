<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-brand">
        <img
          src="/images/catalog/logo.jpeg"
          alt="Outlet Blancos Querétaro"
          class="footer-logo"
        />
        <p>Blancos premium sustentables para tu negocio de hospedaje.</p>
      </div>

      <div class="footer-links">
        <h4>Enlaces</h4>
        <ul>
          <li><a href="#quienes-somos">Quiénes Somos</a></li>
          <li><a href="#catalogo">Catálogo</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
      </div>

      <div class="footer-horario">
        <h4>Horario</h4>
        <p>Lun - Sáb: 9:00 a.m. - 6:00 p.m.</p>
        <p>Domingo: Cerrado</p>
      </div>

      <div class="footer-contacto">
        <h4>Contacto</h4>
        <p>+52 442 609 8771</p>
        <p>outletblancosqro@gmail.com</p>
        <p>Querétaro, México</p>
      </div>
    </div>

    <div class="footer-bottom">
      <p>
        &copy; {{ currentYear }} Outlet Blancos Querétaro. Todos los derechos
        reservados.
      </p>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear();
</script>
