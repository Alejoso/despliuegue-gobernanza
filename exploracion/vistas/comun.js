// Lo que comparten las dos páginas: mismos datos, misma métrica, misma rampa y mismas medidas.
export const RUTA = '/data/postal_areas.geojson'
export const CENTRO = { longitude: 24.87, latitude: 60.24 }
export const ALTURA_MAX = 2600
const claro = [250, 248, 244], fuerte = [156, 82, 54] // --papel y --terracota-fuerte de la app

export function escala(features) {
  const v = features.map(f => f.properties.income_mean).filter(x => x != null).sort((a, b) => a - b)
  const cortes = [...new Set([1, 2, 3, 4, 5, 6].map(i => v[Math.floor((i / 7) * (v.length - 1))]))]
  const colores = Array.from({ length: cortes.length + 1 }, (_, i) => claro.map((c, k) => Math.round(c + (fuerte[k] - c) * (0.12 + (i / cortes.length) * 0.88))))
  return { cortes, colores, min: v[0], max: v.at(-1) }
}
export const colorDe = (e, valor) => e.colores[e.cortes.filter(c => valor >= c).length]
export const alturaDe = (e, valor) => ALTURA_MAX * (valor - e.min) / (e.max - e.min)

// Un punto dentro del área, para probar la selección: el vértice promedio del anillo más grande.
export function puntoDe(features, codigo) {
  const f = features.find(x => x.id === codigo)
  const anillo = f.geometry.coordinates.map(p => p[0]).sort((a, b) => b.length - a.length)[0]
  return [anillo.reduce((s, p) => s + p[0], 0) / anillo.length, anillo.reduce((s, p) => s + p[1], 0) / anillo.length]
}

export function medirFps(ms = 3000) {
  return new Promise(listo => {
    let cuadros = 0
    const inicio = performance.now()
    const paso = ahora => { cuadros++; if (ahora - inicio < ms) requestAnimationFrame(paso); else listo(Math.round((cuadros * 1000) / (ahora - inicio))) }
    requestAnimationFrame(paso)
  })
}
