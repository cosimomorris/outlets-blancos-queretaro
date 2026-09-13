<script setup>
import { computed, nextTick, ref } from "vue";
import { products, money, findVariant } from "../catalog";
import ShopIcon from "./ShopIcon.vue";
import ShopDialog from "./ShopDialog.vue";
const emit = defineEmits(["add"]);
const category = ref("Todos");
const categories = ["Todos", ...new Set(products.map(product => product.category))];
const filtered = computed(() =>
  products.filter(
    (product) =>
      category.value === "Todos" || product.category === category.value,
  ),
);
const selected = ref(null);
const variant = ref("");
const photo = ref(0);
const option = computed(() => findVariant(selected.value, variant.value));
const wholesaleLink = computed(() => {
  const message = `Hola, me interesa cotizar ${selected.value?.name}, tamaño ${option.value?.name}, a precio de mayoreo (${money(option.value?.wholesalePrice)} MXN). ¿Cuál es el pedido mínimo?`;
  return `https://wa.me/524426098771?text=${encodeURIComponent(message)}`;
});
function openProduct(product) {
  selected.value = product;
  variant.value = product.variants[0].id;
  photo.value = 0;
}
async function add() {
  const item = {
    id: selected.value.id,
    variant: variant.value,
    quantity: 1,
  };
  selected.value = null;
  await nextTick();
  emit("add", item);
}
</script>

<template>
  <section id="catalogo" class="catalog section-container">
    <div class="section-heading">
      <div>
        <p class="eyebrow">BLANCOS PARA CADA ESTANCIA</p>
        <h2>Catálogo</h2>
      </div>
    </div>
    <div class="catalog-toolbar">
      <div class="category-filters" aria-label="Categorías de productos">
        <button
          v-for="item in categories"
          :key="item"
          :class="{ active: category === item }"
          :aria-pressed="category === item"
          @click="category = item"
        >
          {{ item }}
        </button>
      </div>
    </div>
    <p class="catalog-meta">
      Precios en MXN · Pago seguro con Mercado Pago
    </p>
    <div class="product-grid">
      <article
        v-for="product in filtered"
        :key="product.id"
        class="product-card"
      >
        <button
          type="button"
          class="product-photo"
          :aria-label="'Ver detalles de ' + product.name"
          @click="openProduct(product)"
        >
          <img
            :src="product.images[0]"
            :alt="product.name"
            loading="lazy"
            width="1086"
            height="1448"
          />
          <span class="product-badge">{{ product.label }}</span>
        </button>
        <div class="product-info">
          <p class="product-detail">{{ product.detail }}</p>
          <h3 class="product-title">{{ product.name }}</h3>
          <div class="product-bottom">
            <p>
              <small>Desde</small> {{ money(product.variants[0].price) }}
              <small>MXN</small>
            </p>
            <button
              class="choose-button"
              :aria-label="'Elegir opciones de ' + product.name"
              @click="openProduct(product)"
            >
              Elegir
            </button>
          </div>
          <p v-if="product.variants[0].wholesalePrice" class="product-rates">
            Menudeo · Mayoreo desde {{ money(product.variants[0].wholesalePrice) }} MXN
          </p>
        </div>
      </article>
    </div>
  </section>
  <ShopDialog
    class="product-dialog"
    :open="!!selected"
    :title="selected?.name || 'Producto'"
    @close="selected = null"
  >
    <div v-if="selected" class="product-modal">
      <div class="product-gallery">
        <img
          class="detail-image"
          :src="selected.images[photo]"
          :alt="selected.name + ', foto ' + (photo + 1)"
        />
        <div v-if="selected.images.length > 1" class="thumbnails">
          <button
            v-for="(src, index) in selected.images"
            :key="src"
            :class="{ active: photo === index }"
            :aria-label="'Ver foto ' + (index + 1)"
            :aria-pressed="photo === index"
            @click="photo = index"
          >
            <img :src="src" :alt="'Foto ' + (index + 1)" />
          </button>
        </div>
      </div>
      <div class="product-options">
        <p class="eyebrow">{{ selected.label }}</p>
        <p>{{ selected.description }}</p>
        <p v-if="selected.extra" class="secondary-copy">{{ selected.extra }}</p>
        <p v-if="selected.tagline" class="secondary-copy">{{ selected.tagline }}</p>
        <p v-if="selected.contents" class="secondary-copy">{{ selected.contents }}</p>
        <table v-if="selected.variants[0].wholesalePrice" class="price-table">
          <caption>Precios {{ selected.category === 'Sábanas' ? 'por set ' : '' }}en MXN</caption>
          <thead><tr><th scope="col">Tamaño</th><th scope="col">Menudeo</th><th scope="col">Mayoreo</th></tr></thead>
          <tbody>
            <tr v-for="item in selected.variants" :key="item.id" :class="{ 'selected-size': variant === item.id }">
              <th scope="row">{{ item.name }}</th><td>{{ money(item.price) }}</td><td>{{ money(item.wholesalePrice) }}</td>
            </tr>
          </tbody>
        </table>
        <p class="detail-price">
          {{ money(option?.price ?? selected.variants[0].price) }} <small>MXN</small>
          <small v-if="option?.wholesalePrice"> · Menudeo{{ selected.category === 'Sábanas' ? ' por set' : '' }}</small>
        </p>
        <label class="field-label" for="product-size">Tamaño</label
        ><select id="product-size" v-model="variant">
          <option
            v-for="item in selected.variants"
            :key="item.id"
            :value="item.id"
          >
            {{ item.name }}
          </option>
        </select>
        <button class="btn btn-primary full-width" @click="add">
          Agregar al carrito <ShopIcon name="bag" />
        </button>
        <p class="demo-explanation">
          Pagas al final con Mercado Pago: tarjeta, SPEI u OXXO.
        </p>
        <a v-if="option?.wholesalePrice" :href="wholesaleLink" class="text-link wholesale-link" target="_blank" rel="noopener noreferrer">
          Cotizar mayoreo por WhatsApp <ShopIcon name="arrow" />
        </a>
      </div>
    </div>
  </ShopDialog>
</template>
