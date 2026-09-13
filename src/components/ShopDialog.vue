<script setup>
import { ref, watch, onBeforeUnmount } from "vue";
import ShopIcon from "./ShopIcon.vue";
const props = defineProps({ open: Boolean, title: String, drawer: Boolean });
const emit = defineEmits(["close"]);
const dialog = ref(null);
let previousOverflow = "";
watch(
  () => props.open,
  (open) => {
    if (open) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      dialog.value.showModal();
    } else {
      dialog.value.close();
      document.body.style.overflow = previousOverflow;
    }
  },
  { flush: "post" },
);
onBeforeUnmount(() => {
  if (props.open) document.body.style.overflow = previousOverflow;
});
</script>
<template>
  <dialog
    ref="dialog"
    :class="['shop-dialog', { drawer }]"
    :aria-label="title"
    @cancel.prevent="emit('close')"
    @click="
      (event) => {
        if (event.target === dialog) emit('close');
      }
    "
  >
    <div class="dialog-shell">
      <header class="dialog-header">
        <h2>{{ title }}</h2>
        <button class="icon-button" aria-label="Cerrar" @click="emit('close')">
          <ShopIcon name="close" />
        </button>
      </header>
      <slot />
    </div>
  </dialog>
</template>
