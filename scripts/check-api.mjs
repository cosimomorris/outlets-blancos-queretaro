import { readdir } from 'node:fs/promises'

const apiDirectory = new URL('../api/', import.meta.url)
const entries = await readdir(apiDirectory, { withFileTypes: true })

for (const entry of entries) {
  if (!entry.isFile() || !entry.name.endsWith('.js')) continue
  await import(new URL(entry.name, apiDirectory))
  console.log(`API imports OK: ${entry.name}`)
}
