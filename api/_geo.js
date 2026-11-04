import { readFile } from 'node:fs/promises'
import path from 'node:path'

let municipalities

export const loadMunicipalities = async () => (municipalities ||= JSON.parse(await readFile(path.join(process.cwd(), 'public', 'data', 'municipalities.geojson'), 'utf8')))

const inRing = (lon, lat, ring) => {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j]
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
const inGeometry = (lon, lat, geometry) => (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates)
  .some(([outer, ...holes]) => inRing(lon, lat, outer) && !holes.some(hole => inRing(lon, lat, hole)))

// Municipal code of the point, or null when it lies outside the four municipalities. Matching is by geometry, never by name.
export const municipalityCodeAt = (collection, lon, lat) =>
  collection.features.find(item => inGeometry(lon, lat, item.geometry))?.properties.municipality_code ?? null
