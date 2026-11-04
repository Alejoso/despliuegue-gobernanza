# Comparación de herramientas de visualización: MapLibre y deck.gl

Prueba hecha el 2026-11-03 para el tramo de Vistas: las dos herramientas dibujan **los mismos datos**, con la misma métrica y la misma rampa de color. Es un experimento: **no forma parte de la app publicada** (las páginas no entran al build).

## Cómo repetirla

```bash
npm install
npm run dev
```

Abre cada página en una pestaña **al frente** y, cuando termine, lee `window.__medida` en la consola del navegador:

- http://127.0.0.1:5173/exploracion/vistas/maplibre.html
- http://127.0.0.1:5173/exploracion/vistas/deckgl.html

El código está en [`exploracion/vistas/`](../exploracion/vistas/). `comun.js` tiene lo que comparten: datos, rampa, altura y el punto de prueba.

## Qué se probó

- **Datos:** `public/data/postal_areas.geojson` (167 áreas), con `income_mean`.
- **Tarea:** coroplético 2D, seleccionar el área 00100 por coordenada, y pasar a 3D con la altura según la métrica.
- **Equipo:** Chrome en Windows, GPU AMD Radeon 840M, ventana de 1536 × 826.
- **Versiones:** MapLibre GL JS 6.10.0 (instalada por npm) y deck.gl 9.4.1 (`dist.min.js` desde unpkg).

## Resultados

Cada fila es una carga de la página. Son 3 corridas por herramienta, en el mismo equipo y con el servidor de desarrollo.

| Herramienta | Corrida | Datos (ms) | Dibujo 2D (ms) | Paso a 3D (ms) | Selección de 00100 |
|---|---|---:|---:|---:|---|
| MapLibre | 1 | 26 | 426 | 174 | 00100 |
| MapLibre | 2 | 16 | 612 | 187 | 00100 |
| MapLibre | 3 | 20 | 2.021 | 511 | 00100 |
| deck.gl | 1 | 28 | 149 | 768 | 00100 |
| deck.gl | 2 | 29 | 143 | 43 | 00100 |
| deck.gl | 3 | 25 | 136 | 45 | 00100 |

**Peso de lo que descarga el navegador**

| Herramienta | Archivos | Sin comprimir | Con gzip |
|---|---|---:|---:|
| MapLibre (build de la app) | `maplibre-*.js` + worker | 1,52 MB | 422 kB |
| deck.gl | `dist.min.js`, paquete completo | 2,08 MB | 577 kB |

**Cómo leerlos:**
- deck.gl dibujó primero en las 3 corridas (136–149 ms frente a 426–2.021 ms). El paso a 3D también suele ser más rápido, pero tuvo una corrida lenta.
- Son 3 corridas y MapLibre varía mucho entre ellas: indican una tendencia, no una medida fina. Para el usuario, ambas dibujan 167 áreas en un tiempo razonable.
- El peso de deck.gl es el del paquete completo. Con npm y solo los módulos necesarios podría bajar; **eso no se probó**.

**Lo que se descartó de la medición:** también medí cuadros por segundo girando el mapa, y salieron entre 1 y 17 sin patrón claro. En las últimas corridas de deck.gl dio 1, frente a 8–11 antes con el mismo código, porque Chrome limita el dibujo de una pestaña que no está al frente. **Los FPS no son confiables y no se usan para decidir.** La página los sigue midiendo; para compararlos hay que repetir con la pestaña visible.

## Comparación

| | MapLibre GL JS | deck.gl |
|---|---|---|
| **Requisitos de inicio** | `npm install`; registrar a mano la URL del worker con Vite (sin esto, el mapa sale vacío y sin error) | Una etiqueta `<script>` o npm; se crea sin mapa base. Sin llave |
| **Licencia** | BSD-3-Clause (`LICENSE.txt` y `package.json`) | MIT (`LICENSE` de la versión 9.4.1 y npm) |
| **Dónde quedan los datos al publicar** | Archivo estático en Vercel (`public/data/`), procesado en el navegador; no van a un tercero | Igual. En la prueba, el código salió de unpkg; para publicarlo convendría empaquetarlo |
| **Qué resolvió** | 2D, 3D y selección en esta prueba. En la app, además: trama para datos suprimidos, bordes, zonas A·B y controles de navegación | 2D, 3D y selección, con primer dibujo más rápido |
| **Qué no resolvió o no se probó** | Primer dibujo más lento; hay que registrar el worker | **Sin probar:** trama, bordes, zonas A·B, controles ni teléfono. Con la iluminación por defecto, los colores se ven más grises en 3D y dejan de coincidir con la leyenda; quitarla no se probó |
| **Decisión** | **Quedó** | No quedó, por ahora |

**Por qué queda MapLibre:** la diferencia de velocidad no se nota en una tarea de 167 áreas, y sí costaría rehacer y volver a probar lo que la app ya hace con MapLibre (trama, A·B, controles). Pesa menos, y conserva los colores de la leyenda en lo observado. deck.gl sería la opción a revisar si la app tuviera que dibujar decenas de miles de elementos, como edificios.

**La IA hizo la prueba y propone esta decisión. El grupo debe confirmarla.**

## Errores durante la prueba

1. La página de MapLibre se colgaba esperando un evento `idle` que ya había ocurrido. Se cambió por una espera que consulta el estado del mapa.
2. La de deck.gl se colgaba por lo mismo al pasar a 3D: empezaba a escuchar después de pedir el cambio.
3. deck.gl parecía no seleccionar nada. No era una limitación: la prueba preguntaba justo tras el primer dibujo. Con 300 ms de margen devuelve 00100.
4. Los FPS salieron afectados por la pestaña en segundo plano (ver arriba).
