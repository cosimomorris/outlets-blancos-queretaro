<template>
  <nav class="navbar">
    <div class="navbar-container">
      <a href="#" class="navbar-brand">
        <img src="/images/logo-color.jpg" alt="Outlet Blancos Querétaro" class="logo" />
      </a>

      <button class="mobile-menu-btn" @click="toggleMenu" :class="{ active: isMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul class="nav-links" :class="{ open: isMenuOpen }">
        <li><a href="#quienes-somos" @click="closeMenu">Quiénes Somos</a></li>
        <li><a href="#catalogo" @click="closeMenu">Catálogo</a></li>
        <li><a href="#contacto" @click="closeMenu">Contacto</a></li>
      </ul>

      <a href="#contacto" class="btn btn-primary nav-cta">Pedir Orden</a>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 0.75rem 0;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.logo {
  height: 50px;
  width: auto;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: var(--text-dark);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-links a:hover {
  color: var(--primary-blue);
}

.nav-cta {
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 28px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.mobile-menu-btn span {
  display: block;
  height: 3px;
  width: 100%;
  background: var(--text-dark);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.mobile-menu-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-btn.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }

  .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: white;
    padding: 1rem;
    gap: 1rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    display: none;
  }

  .nav-links.open {
    display: flex;
  }

  .nav-links li {
    text-align: center;
  }

  .nav-cta {
    display: none;
  }
}
</style>
