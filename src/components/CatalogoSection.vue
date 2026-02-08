<template>
  <section id="catalogo" class="catalogo">
    <div class="catalogo-container">
      <h2>Catálogo</h2>
      <div class="productos-grid">
        <div class="producto-card" v-for="producto in productos" :key="producto.nombre">
          <div class="producto-image">
            <img :src="producto.imagen" :alt="producto.nombre" />
          </div>
          <div class="producto-info">
            <h3>{{ producto.nombre }}</h3>
            <p>{{ producto.descripcion }}</p>
          </div>
        </div>
      </div>

      <div class="catalogo-cta">
        <p>¿Tienes preguntas o quieres hacer un pedido personalizado?</p>
        <a href="#contacto" class="btn btn-primary">Contáctanos</a>
      </div>
    </div>
  </section>
</template>

<script setup>
const productos = [
  {
    nombre: 'Sábanas Reacondicionadas',
    descripcion: 'Blancos 100% algodón, recuperados de hoteles de alta gama y reacondicionados con procesos certificados. Limpios, suaves, confiables y accesibles.',
    imagen: '/images/linens-pile.jpg'
  },
  {
    nombre: 'Toallas de Baño',
    descripcion: 'Toallas de mano, toallas faciales y toallas de baño grandes.',
    imagen: '/images/IMG_4620.jpg'
  },
  {
    nombre: 'Sets de Sábanas',
    descripcion: 'Sets completos que incluyen 2 sábanas planas + 2 fundas de almohada.',
    imagen: '/images/F517F672-1472-41BB-A05D-3EBA6A22872B.PNG'
  },
  {
    nombre: 'Fundas de Almohada',
    descripcion: 'Fundas de almohada de algodón king size y matrimonial.',
    imagen: '/images/products-grid.jpg'
  }
]
</script>

<style scoped>
.catalogo {
  padding: 5rem 0;
  background: white;
}

.catalogo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.catalogo h2 {
  font-size: 2rem;
  color: var(--primary-blue);
  text-align: center;
  margin-bottom: 1rem;
}

.catalogo-subtitle {
  text-align: center;
  color: var(--text-gray);
  max-width: 600px;
  margin: 0 auto 3rem;
  line-height: 1.7;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

.producto-card {
  background: var(--cream-bg);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.producto-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(74, 122, 181, 0.15);
}

.producto-image {
  height: 200px;
  overflow: hidden;
}

.producto-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.producto-card:hover .producto-image img {
  transform: scale(1.05);
}

.producto-info {
  padding: 1.5rem;
}

.producto-info h3 {
  color: var(--text-dark);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.producto-info p {
  color: var(--text-gray);
  font-size: 0.9rem;
  line-height: 1.6;
}

.catalogo-cta {
  text-align: center;
  padding: 2rem;
  background: var(--light-blue);
  border-radius: 12px;
}

.catalogo-cta p {
  color: var(--text-dark);
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .productos-grid {
    grid-template-columns: 1fr;
  }
}
</style>
