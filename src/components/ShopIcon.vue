<script setup>
defineProps({ name: String });
const paths = {
  bag: "M6 7h12l2 14H4L6 7Zm3 0V5a3 3 0 0 1 6 0v2",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  close: "m6 6 12 12M6 18 18 6",
  leaf: "M20 3C7 2 2 9 6 16c6 7 15 0 14-13ZM4 21 15 9",
  check: "m5 12 4 4L19 6",
  pin: "M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  layers: "m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5",
  menu: "M4 6h16M4 12h16M4 18h16",
};
</script>
<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name] || paths.bag" />
  </svg>
</template>
