// Product catalog. Shared by the Vue app and the serverless API (api/), so keep it free of browser-only code.
// Prices are MXN. The API re-derives every amount from this file; the client never sets prices.
export const products = [
  {
    id: 'reacondicionadas', name: 'Sábanas reacondicionadas', category: 'Sábanas', label: 'Set de 4 piezas', detail: '2 sábanas planas + 2 fundas · 300 hilos',
    description: 'Sábanas 100% algodón de 300 hilos, frescas, suaves y resistentes, con la calidad de blancos de alta gama que encuentras en hoteles premium.',
    extra: 'Una opción inteligente para disfrutar de confort y calidad a un precio accesible.',
    tagline: '♻️ Recuperamos • Reacondicionamos • Reutilizamos',
    contents: 'Cada set incluye 2 sábanas planas y 2 fundas de almohada.',
    images: ['/images/catalog/bedroom.jpeg', '/images/catalog/reading.jpeg'],
    variants: [
      { id: 'individual', name: 'Individual', price: 275, wholesalePrice: 250 },
      { id: 'matrimonial', name: 'Matrimonial', price: 325, wholesalePrice: 280 },
      { id: 'queen', name: 'Queen', price: 500, wholesalePrice: 400 },
      { id: 'king', name: 'King', price: 600, wholesalePrice: 500 },
    ],
  },
  {
    id: 'nuevas', name: 'Sábanas Nuevas', category: 'Sábanas', label: 'Set de 4 piezas', detail: '2 sábanas planas + 2 fundas · 180 hilos',
    description: 'Set de sábanas nuevas: incluye 2 sábanas planas y 2 fundas de almohada. 180 hilos, 100% algodón.',
    images: ['/images/catalog/sabanas-nuevas.jpeg', '/images/catalog/pillowcases.jpeg'],
    variants: [
      { id: 'matrimonial', name: 'Matrimonial', price: 280, wholesalePrice: 280 },
      { id: 'queen', name: 'Queen', price: 400, wholesalePrice: 400 },
      { id: 'king', name: 'King', price: 500, wholesalePrice: 500 },
    ],
  },
  {
    id: 'fundas', name: 'Fundas de Almohada', category: 'Fundas', label: '100% algodón', detail: 'Matrimonial y king size',
    description: 'Fundas de almohada de algodón king size y matrimonial.',
    images: ['/images/catalog/pillowcases.jpeg', '/images/catalog/pillowcase-king.jpeg'],
    variants: [{ id: 'matrimonial', name: 'Matrimonial', price: 99 }, { id: 'king', name: 'King size', price: 129 }],
  },
]
export const findVariant = (product, variantId) => product?.variants.find(v => v.id === variantId)
export const money = value => new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
}).format(value)
