<template>
  <section id="quienes-somos" class="about">
    <div class="about-container">
      <div class="about-image">
        <img src="/images/gallerygrid.png" alt="Nuestros productos" />
      </div>
      <div class="about-content">
        <h2>Blancos Reacondicionados (Pre-loved)</h2>
        <p>
          Contamos con Blancos hoteleros cuidadosamente seleccionados y curados bajo estándares de calidad, que ofrecen una alternativa sustentable y funcional con precios de outlet.
          Se entregan limpios, en excelente estado y sin detalles visibles, ideales para reposiciones rápidas.
        </p>
        <div class="about-buttons">
          <a href="#catalogo" class="btn btn-primary">Explorar Catálogo</a>
          <a href="#contacto" class="btn btn-outline">Contactar</a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  padding: 5rem 0;
  background: var(--cream-bg);
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.about-image img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.about-content h2 {
  font-size: 2rem;
  color: var(--primary-blue);
  margin-bottom: 1.5rem;
}

.about-content p {
  color: var(--text-gray);
  line-height: 1.8;
  margin-bottom: 1rem;
}

.about-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .about-container {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }

  .about-buttons {
    justify-content: center;
  }
}
</style>
