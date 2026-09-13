export const shippingFields = [
  { key: 'recipient', label: 'Nombre de quien recibe', autocomplete: 'shipping name', max: 80, required: true },
  { key: 'street', label: 'Calle y número exterior', autocomplete: 'shipping address-line1', max: 160, required: true },
  { key: 'apartment', label: 'Interior / departamento (opcional)', autocomplete: 'shipping address-line2', max: 80 },
  { key: 'neighborhood', label: 'Colonia', autocomplete: 'shipping address-line3', max: 100, required: true },
  { key: 'city', label: 'Ciudad / municipio', autocomplete: 'shipping address-level2', max: 100, required: true },
  { key: 'state', label: 'Estado', autocomplete: 'shipping address-level1', max: 80, required: true },
  { key: 'postal_code', label: 'Código postal', autocomplete: 'shipping postal-code', max: 5, required: true, pattern: '[0-9]{5}', inputmode: 'numeric' },
  { key: 'notes', label: 'Referencias para la entrega (opcional)', autocomplete: 'off', max: 300 },
]

// Shared by checkout and the server so delivery cannot bypass address validation.
export function parseShipping(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const address = { country: 'MX' }
  for (const field of shippingFields) {
    const value = input[field.key] ?? ''
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    if ((field.required && !trimmed) || trimmed.length > field.max) return null
    if (field.pattern && !new RegExp(`^(?:${field.pattern})$`).test(trimmed)) return null
    address[field.key] = trimmed
  }
  return address
}
