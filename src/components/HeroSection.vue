<template>
  <section class="hero">
    <div class="hero-container">
      <div class="hero-content">
        <img src="/images/logo-color.jpg" alt="Outlet de Blancos Premium en Querétaro" class="hero-logo" />
        <p class="hero-subtitle">
          En Outlet Blancos Querétaro nos especializamos en blancos hoteleros nuevos y reacondicionados de alta calidad, elaborados en 100% algodón.
Atendemos hoteles, Airbnbs y negocios de hospedaje que buscan soluciones duraderas, confiables y a precio justo.
        </p>
        <div class="hero-buttons">
          <a href="#catalogo" class="btn btn-primary">Ver Catálogo</a>
          <a href="#contacto" class="btn btn-outline">Pedir Orden</a>
        </div>
      </div>
      <div class="hero-image">
        <img src="/images/hero-main.png" alt="Sábanas premium blancas" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding-top: 100px;
  background: linear-gradient(135deg, var(--light-blue) 0%, white 100%);
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.hero-logo {
  max-width: 350px;
  height: auto;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--text-gray);
  line-height: 1.7;
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-image {
  display: flex;
  justify-content: center;
}

.hero-image img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(74, 122, 181, 0.2);
}

@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-logo {
    max-width: 250px;
  }

  .hero-buttons {
    justify-content: center;
  }

  .hero-image {
    order: -1;
  }

  .hero-image img {
    max-width: 80%;
  }
}
</style>
