<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-brand">
        <img src="/images/logo-white.jpg" alt="Outlet Blancos Querétaro" class="footer-logo" />
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
      <p>&copy; {{ currentYear }} Outlet Blancos Querétaro. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background: var(--primary-blue);
  color: white;
  padding: 3rem 0 0;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
}

.footer-logo {
  height: 60px;
  width: auto;
  margin-bottom: 1rem;
  border-radius: 8px;
}

.footer-brand p {
  opacity: 0.9;
  line-height: 1.6;
  font-size: 0.9rem;
}

.footer h4 {
  font-size: 1rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.footer-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: white;
  text-decoration: none;
  opacity: 0.9;
  transition: opacity 0.3s ease;
  font-size: 0.9rem;
}

.footer-links a:hover {
  opacity: 1;
}

.footer-horario p,
.footer-contacto p {
  opacity: 0.9;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  text-align: center;
}

.footer-bottom p {
  font-size: 0.85rem;
  opacity: 0.8;
  margin: 0;
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .footer-brand {
    grid-column: span 2;
    text-align: center;
  }

  .footer-logo {
    margin: 0 auto 1rem;
    display: block;
  }
}

@media (max-width: 480px) {
  .footer-container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-brand {
    grid-column: span 1;
  }
}
</style>
