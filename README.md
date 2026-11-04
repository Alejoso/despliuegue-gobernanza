# Cerebro Helsinki · Biblioteca de una nueva vida

Sistema de información para personas extranjeras que evalúan mudarse al área de Helsinki, o que ya viven allí y buscan dónde crecer. Entrega del Taller de Datos · Gestión y Gobernanza de Datos, EAFIT 2026-2 (profesor: Santiago Jiménez Londoño).

- **Sistema publicado:** https://cerebrohelsinki.vercel.app
- **Grupo:** Juan Esteban Trujillo Montes, Andrés Pérez Quinchía, Simón Sloan García y Alejandro Tirado Ramirez
- **Ciudad:** Helsinki (091), Espoo (049), Vantaa (092) y Kauniainen (235)
- **Repositorios:** [SSloan07/Cerebro-Helsinki](https://github.com/SSloan07/Cerebro-Helsinki) (trabajo del grupo, rama `feat/biblioteca-front`) y [Alejoso/despliuegue-gobernanza](https://github.com/Alejoso/despliuegue-gobernanza) (el que publica Vercel)

> Estado al 2026-11-03. Las secciones marcadas **Pendiente** o **Borrador** aún no están completas. Se dejan visibles a propósito: el taller pide contar también lo que falta.

## Cómo correrlo

Requiere Node.js 20.19+ (o 22.12+) y Python 3.10+. No hace falta ninguna llave.

```bash
npm install
npm run dev                            # app en http://localhost:5173
python3 -m etl.helsinki.run            # reconstruye el lago desde data/raw, sin red
python3 -m etl.helsinki.run --refresh  # vuelve a descargar todas las fuentes
python3 -m etl.helsinki.run --refresh --only statfin-rents-15fa,hsy-land-cover  # solo esas fuentes
python3 verificar.py                   # termina con error si algo falla
npm test
npm run build
```

`--only` acepta los ID de las fuentes del ETL y se salta los archivos base. Para renovar el horario GTFS o los límites municipales hay que usar `--refresh` sin `--only`.

Cada push a `main` de `despliuegue-gobernanza` se publica solo en Vercel. Los datos publicados son los del commit, porque Vercel no corre el ETL.

**Mapa del repositorio:** `src/biblioteca/` (app) · `api/` (consultas en vivo) · `etl/helsinki/` (ingesta) · `data/raw/` y `public/data/` (lago) · `verificar.py` · `catalogo/` y `docs/catalogo/fuentes.json` (fuentes) · `docs/guia-implementacion-front.md` (cómo seguir construyendo).

## Arquitectura y vistas

```text
Statistics Finland, HSL, HSY, PRH ── etl/helsinki/ ── data/raw/ ──► public/data/ ──► verificar.py
                                                                         │
HSL, FMI, HSY, Digitraffic ── api/ (consulta en vivo, sin guardar) ──────┤
                                                                         ▼
                                                     src/biblioteca/ (React + MapLibre)
                                                                         │
                                 docs/catalogo/fuentes.json ── ficha de cada fuente a un clic
```

- **Lago:** archivos estáticos en `public/data/`. No hay base de datos.
- **En vivo:** funciones de Vercel en `api/`. Si una fuente falla, responden «no disponible», nunca un valor viejo.
- **Vistas:** un estante con 5 libros, y cada libro tiene pliegos. Están definidos en `src/biblioteca/libros.js`.

| Libro · pliego | Pregunta | Fuentes (ID en el catálogo) | Estado |
|---|---|---|---|
| Llegar 1 · Cuatro municipios | Contexto | `fi-municipal-boundaries` | Datos |
| Llegar 2 · Población | Contexto | `statfin-population-11ra` | Datos |
| Llegar 3 · Ahora mismo | Contexto | `fmi-weather`, `hsy-air-quality-now`, `digitraffic-road-tms`, `digitraffic-rail` | En vivo |
| Habitar 1 · Ingreso por zona (2D/3D, A·B) | P1 | `stat-fi-postal-areas-paavo` | Datos (proxy) |
| Habitar 2 · Distribución | P1 | `stat-fi-postal-areas-paavo` | Datos (proxy) |
| Habitar 3 · Alquiler e ingreso | P1 | `stat-fi-postal-areas-paavo` | Datos (proxy) |
| Habitar 4 · Moverse | P1 | `hsl-gtfs-stops`, `hsl-gtfs-realtime-vehicles`, `fi-municipal-boundaries` | Datos y en vivo |
| Habitar 5 · Costo frente a salario | P1 | `statfin-rents-15fa`, `statfin-earnings-15b2` | Datos (ciudad y región) |
| Investigar 1 · Empleo por sector y zona | P2 | `stat-fi-postal-areas-paavo` | Datos |
| Investigar 2 · Peso de cada sector | P2 | `stat-fi-postal-areas-paavo` | Datos |
| Investigar 3 · Desempleo por zona | P2 | `stat-fi-postal-areas-paavo` | Datos |
| Investigar 4 · Empresas por sector | P2 | `prh-ytj-companies` | Datos (solo conteos) |
| Investigar 5 · Expansión 2016–2024 | P2 | `hsy-land-cover` | Datos |
| Investigar 6 · Innovación y vacantes | P2 | Ninguna integrada | **Hueco declarado** |
| Aprender 1 · Nivel educativo por zona | P3 | `stat-fi-postal-areas-paavo` | Datos (indirecto) |
| Aprender 2 · Dónde estudiar | P3 | `statfin-education-11c4` | Datos |
| Aprender 3 · Empleo por nacionalidad | P3 | `statfin-employment-nationality-115f` | Datos (región) |
| Aprender 4 · Lo que estos datos no pueden decirte | P3 | — | Texto |
| Fuentes 1–3 · Catálogo, fichas y lo que no se muestra | Todas | `docs/catalogo/fuentes.json` | Datos y texto |

## Para quién y qué pregunta

**Usuario:** una persona extranjera, antes o después de mudarse. Compara zonas y sectores, muchas veces sin hablar finés.

**Escala:** área postal (167), municipio (4) y, cuando la fuente no da más, región de Uusimaa.

**Comparación:** una zona frente a otra y frente a los cuatro municipios juntos.

Las preguntas son las del grupo, con el texto literal de la columna «Pregunta del sistema» de [la hoja 2. Diccionario](docs/Diccionario_de_datos_TallerDatos_Helsinki.xlsx). El informe de `Context-docs/` no las contiene.

| Pregunta | Vistas | Qué responde hoy | Qué sigue pendiente |
|---|---|---|---|
| **P1:** ¿Cómo se ve el prospecto salarial en cada provincia de Helsinki? | Habitar 1–5 | **Parcial, con proxy:** ingreso disponible de residentes por área postal, alquiler por ciudad y salario de la región de Uusimaa | **No hay salario por zona ni alquiler por barrio.** La app no llama salario al ingreso. Tampoco trabaja por «provincias»: su escala es el área postal |
| **P2:** ¿A qué posiciones laborales se puede aspirar según la capacidad de innovación y expansión territorial de la ciudad? | Investigar 1–6 | **Parcial e indirecta:** empleos por sector y zona, empresas por sector y municipio, desempleo por zona, superficie impermeable 2016–2024 | **No hay vacantes ni posiciones concretas, ni indicadores de innovación abiertos.** OpenAlex responde, pero sin llave comparte un cupo mínimo |
| **P3:** ¿Cuál es el prospecto de escalabilidad laboral de una persona extranjera que migra? | Aprender 1–4 | **Parcial, solo contexto:** empleo por nacionalidad en Uusimaa, estudiantes por municipio y sector, nivel educativo por zona | **No hay trayectorias laborales ni empleo por lengua materna o por municipio.** Tampoco reconocimiento de títulos ni salario por origen |

**Lo que no se muestra:**
- direcciones por edificio;
- empresas una por una;
- celdas de empresas con menos de 5;
- contactos de Service Map;
- reportes ciudadanos de Open311;
- eficiencia energética por edificio;
- puntajes o predicciones sobre una persona.

## Límites de interpretación

Estos límites también aparecen en la app o en la ficha de cada fuente.

- **Paavo (áreas postales):**
  - El año de referencia es 2024, aunque la edición sea 2026.
  - Las áreas postales no son barrios ni unidades administrativas.
  - Su población no suma los totales de StatFin 11ra, que son de 2025.
  - Un área con pocos residentes puede no tener dato.
- **Ingresos:**
  - `income_mean` es el ingreso monetario disponible de residentes de 18 años o más. Se mide donde viven, no donde trabajan.
  - Incluye pensiones y transferencias, así que **no es el salario de un puesto**.
  - Las medianas de cada área no se pueden promediar, y por eso esa métrica no tiene valor metropolitano.
  - El salario de Habitar 5 sí es salario, pero bruto, de asalariados a jornada completa y de toda la región de Uusimaa.
- **Empleo por nacionalidad:**
  - Es **nacionalidad**, no lengua materna ni origen: quien se naturalizó cuenta como finlandés.
  - Es la región de Uusimaa, no un municipio, y cubre personas de 18 a 64 años.
  - Muestra una diferencia entre grupos, no su causa, y no predice el caso de nadie.
- **Empresas (PRH):**
  - Cuenta empresas registradas por el municipio de su dirección. **No mide empleos ni tamaño:** una empresa de una persona pesa igual que una de mil.
  - Incluye empresarios individuales y sociedades de vivienda, por eso el sector L sale tan alto.
  - Puede incluir empresas que ya no operan.
  - Las que no declaran actividad solo cuentan en el total.

## La réplica

**Qué se replicó de Cerebro Lima:** la ruta por tramos, el catálogo que incluye lo que no sirvió, el contrato de datos, la ingesta con scripts, `verificar.py` y la fuente a un clic de cada cifra.

**Qué cambió:**
- Se empezó como un gemelo digital de la ciudad y se reemplazó por una app para una decisión concreta: mudarse o no, y a dónde.
- La interfaz parte del Figma del grupo: un estante de libros donde cada libro responde una pregunta.

| Fuentes catalogadas | Integradas | Candidatas | Condicionadas | Caídas | Descartadas | No existen para la ciudad |
|---:|---:|---:|---:|---:|---:|---:|
| 67 | 15 | 17 | 7 | 6 | 20 | 2 |

El detalle y la razón de cada una están en [docs/catalogo/fuentes.json](docs/catalogo/fuentes.json), [docs/catalogo-fuentes.md](docs/catalogo-fuentes.md) y [catalogo/](catalogo/README.md). De esas 15, 10 están en el lago y 5 se consultan en vivo sin guardarse.

**Otros huecos de la ciudad:** altura oficial por edificio y distritos de Helsinki (`kartta.hel.fi` da timeout), energía por edificio, decisiones municipales, y áreas protegidas y calidad de aguas (SYKE). Google Open Buildings no cubre Finlandia.

## ¿Se puede usar?

Solo las fuentes integradas. Las demás están en el catálogo con su semáforo.

| Fuente | Licencia | Personas | Estado | Condición |
|---|---|---|---|---|
| Límites municipales 2025 (kunta1000k_2025) | CC BY 4.0 | No | 🟢 Integrada | Ninguna |
| Áreas de código postal con estadística Paavo 2026 (pno_tilasto_2026) | CC BY 4.0 | Agregados por área postal | 🟢 Integrada | Valores suprimidos (-1) e ingreso de áreas sin residentes se publican vacíos, nunca como 0 |
| Cobertura del suelo 2024 (maanpeite_*_2024) | CC BY 4.0 | No | 🟢 Integrada | Ninguna |
| Calidad del aire ahora (ilmanlaatu:Ilmanlaatu_nyt) | CC BY 4.0 | No | 🟢 Integrada | Se consulta en vivo y no se guarda |
| StatFin 11ra – Cifras clave de población por región | CC BY 4.0 | No | 🟢 Integrada | Ninguna |
| PRH/YTJ – registro de empresas (API abierta v3) | CC BY 4.0 | Sí en los registros (empresarios individuales); no en lo publicado | 🟡 Integrada | Solo conteos por municipio y sector; celdas con menos de 5 quedan vacías; no se guarda ningún nombre |
| HSL GTFS estático (paradas) | CC BY 4.0 | No | 🟢 Integrada | Ninguna |
| HSL GTFS-Realtime (posiciones de vehículos) | CC BY 4.0 | No (vehículos, no pasajeros) | 🟢 Integrada | Se consulta en vivo y no se guarda |
| Digitraffic – estaciones de conteo de tráfico (TMS/LAM) | CC BY 4.0 | No (conteos de vehículos) | 🟢 Integrada | Se consulta en vivo y no se guarda |
| Digitraffic – tráfico ferroviario (estaciones y trenes) | CC BY 4.0 | No | 🟢 Integrada | Se consulta en vivo y no se guarda |
| FMI – observaciones meteorológicas (Kaisaniemi, fmisid 100971) | CC BY 4.0 | No | 🟢 Integrada | Se consulta en vivo y no se guarda |
| StatFin 15fa – Alquileres medios por m² por ciudad | CC BY 4.0 | No | 🟢 Integrada | Ninguna |
| StatFin 15b2 – Salarios de asalariados a tiempo completo por región | CC BY 4.0 | No | 🟢 Integrada | Ninguna |
| StatFin 115f – Población 18–64 por actividad principal y nacionalidad | CC BY 4.0 | No | 🟢 Integrada | Ninguna |
| StatFin 11c4 – Estudiantes por región de la institución y sector | CC BY 4.0 | No | 🟢 Integrada | Ninguna |

## Bitácora de exploración

**Comparación completa solo en Vistas; el resto sigue pendiente.** El taller pide al menos 2 herramientas por tramo sobre los mismos datos. Se comparó MapLibre con deck.gl en Vistas, y Rastreo se acerca. Abajo está lo que se usó de verdad; no se rellena con herramientas que nadie abrió.

### Comparación de herramientas de visualización

La prueba se hizo el 2026-11-03: las dos dibujan el mismo `public/data/postal_areas.geojson` (167 áreas), con la misma métrica y rampa, en 3 corridas cada una. Los pasos para repetirla, los datos crudos y los errores de la prueba están en [docs/exploracion-vistas.md](docs/exploracion-vistas.md).

| | MapLibre GL JS 6.10.0 | deck.gl 9.4.1 |
|---|---|---|
| **Requisitos de inicio** | `npm install`; registrar a mano el worker con Vite | Un `<script>` o npm; sin mapa base. Sin llave |
| **Licencia** | BSD-3-Clause | MIT |
| **Datos al publicar** | Archivo estático en Vercel, procesado en el navegador | Igual |
| **Primer dibujo 2D** | 426–2.021 ms | 136–149 ms |
| **Paso a 3D** | 174–511 ms | 43–768 ms |
| **Peso (gzip)** | 422 kB | 577 kB (paquete completo) |
| **Selección de un área** | Devolvió 00100 | Devolvió 00100 |
| **Qué resolvió** | 2D, 3D y selección; en la app, además trama, zonas A·B y controles | 2D, 3D y selección, con primer dibujo más rápido |
| **Qué no resolvió o no se probó** | Primer dibujo más lento; hay que registrar el worker | Sin probar: trama, bordes, A·B, controles ni teléfono. Con la iluminación por defecto, los colores en 3D dejan de coincidir con la leyenda |
| **Decisión** | **Quedó** (propuesta de la IA; el grupo debe confirmarla) | No quedó, por ahora |

**Por qué:** la diferencia de velocidad no se nota con 167 áreas, y cambiar obligaría a rehacer lo que la app ya hace. Son 3 corridas en un solo equipo: indican una tendencia, no una medida fina. Los cuadros por segundo se descartaron porque salieron afectados por la pestaña en segundo plano. En teléfono solo se probó la app, que usa MapLibre.

### Otras herramientas usadas

| Tramo | Herramienta | Qué pidió para empezar | Licencia | Dónde quedan los datos | ¿Se rehace con un comando? | Estado del proyecto | Qué resolvió | Qué no pudo | ¿Quedó? ¿Por qué? |
|---|---|---|---|---|---|---|---|---|---|
| Rastreo | DuckDB | `pip install duckdb` | Por verificar | Solo el conteo, en `candidate_probes.json` | Sí: `probe_candidates --overture` | Por verificar | Leer Overture sin llave: 258.743 edificios en el recuadro | Decidir si las alturas sirven (media ≈ 5 m, sospechosa) | No por ahora: Overture no se integró |
| Rastreo | Overture Maps | Nada (S3 público) | ODbL en edificios | Remoto | Sí, con el anterior | Por verificar | Sustituto de Google Open Buildings | Ser fuente primaria: es un agregador | No por ahora |
| Rastreo | Python (`urllib`) y curl | Nada | PSF / curl | `data/metadata/candidate_probes.json` | Sí: `probe_candidates` | Activo | Dejar el error exacto de cada fuente | — | Sí: sin dependencias |
| Contrato y lago | Python (ETL propio) | Nada | PSF | `data/raw/`, `public/data/` | Sí: `python3 -m etl.helsinki.run` | Propio | Borrar el lago y volver a los mismos sha256 | Comparar con otra herramienta | Sí, pero **sin comparar** |
| Contrato y lago | WFS y PxWeb de Statistics Finland (dos vías al mismo dato) | Nada | CC BY 4.0 | WFS en `data/raw/`; PxWeb sin ingerir | WFS sí | Oficial | Fijar el año de referencia de Paavo en 2024: 4 valores coinciden | PxWeb no trae geometría | WFS: trae los polígonos |
| Verificación | `verificar.py` | Nada | Propio | No guarda datos | Sí | Propio | 3.213 comprobaciones; atrapa datos rotos a propósito | Comparar con otra herramienta | Sí, pero **sin comparar** |
| Vistas | MapLibre GL JS 6.10.0 + React 19.3.0 + Vite 7.3.6 | `npm install`; registrar el worker de MapLibre a mano | BSD-3-Clause; MIT; MIT | Navegador | Sí: `npm run build` | Activos | Mapas 2D y 3D sin llave ni teselas | Primer dibujo más lento que deck.gl | Sí: ver la comparación de arriba |
| Vistas | deck.gl 9.4.1 | Un `<script>` o npm | MIT | Navegador | Sí: `exploracion/vistas/` | Activo (publicado el 2026-10-28) | 2D, 3D y selección con los mismos datos | Sin probar: trama, A·B, controles, teléfono | No: ver la comparación |
| Protección | Vercel | Cuenta gratuita | Servicio | Vercel | Sí: push a `main` | Activo | Publicar la app y las funciones en vivo | Limitar los datos: el sistema es abierto | Sí |
| Entrega | Git + GitHub | Cuenta gratuita | GPL-2.0 (Git); servicio | GitHub | — | Activos | Coordinar el grupo con `docs/registro-integracion.md` | — | Sí |

**Sin probar todavía:**
- **Rastreo:** QGIS.
- **Pregunta:** kepler.gl, Cube.
- **Permiso:** Presidio, OpenDP.
- **Contrato y lago:** dlt, DuckDB, Polars, DuckLake, Iceberg.
- **Verificación:** dbt, Frictionless, Data Contract CLI, Great Expectations, Soda Core.
- **Vistas:** Streamlit, Datawrapper, Observable Framework, Data Studio, Metabase.
- **Protección:** Open Policy Agent.
- **Entrega:** GitHub Actions.

## Protección

**Nivel: abierto, por decisión del grupo, y solo agregados.** Todo lo publicado son datos abiertos agregados. No hay compuerta, así que cualquiera puede descargar `public/data/`.

**Qué se protege y de quién:** a los empresarios individuales y a los hogares, de quedar identificados. No se protege el acceso, sino lo que entra al lago.

**Qué se publica.** El detalle de cada campo está en la hoja [2. Diccionario](docs/Diccionario_de_datos_TallerDatos_Helsinki.xlsx): 121 filas, todas clasificadas como «Pública».

| Archivo en `public/data/` | Qué trae | Agregación |
|---|---|---|
| `municipalities.geojson` | Códigos, nombres y polígonos de los municipios | Municipio |
| `transit_stops.geojson` | Paradas: código, nombre, zona tarifaria, accesibilidad, coordenadas | Infraestructura pública, no personas |
| `postal_areas.geojson` | Población, ingreso, hogares, educación, actividad y empleos por sector | Área postal |
| `population.json` | Población | Municipio |
| `rents.json` | Alquiler medio y número de contratos | Ciudad |
| `earnings.json` | Salarios y número de asalariados, por sexo | Región de Uusimaa |
| `employment_nationality.json` | Población, ocupados y desempleados por grupo de nacionalidad | Región de Uusimaa |
| `education.json` | Estudiantes, extranjeros y de lengua extranjera por sector | Municipio |
| `companies.json` | Conteo de empresas por sección TOL | Municipio |
| `land_cover.json` | Superficie impermeable en km² | Municipio |

**Qué se agrega o se oculta:**
- Paavo: los valores que Statistics Finland suprime (-1) y el ingreso de áreas sin residentes se publican vacíos. Hoy son 9 valores.
- PRH: se guarda solo el conteo; cada registro se descarta al leerlo.
- Empleo: se usa Paavo por área postal en lugar de la rejilla de 250 m de HSY, que puede señalar a un solo empleador.

**Qué no se publica:** nombres o direcciones de empresas, registros individuales de PRH, direcciones de edificios, contactos de Service Map, reportes de Open311 y el perfil de quien usa la app.

**Decisión sobre un campo delicado: `by_municipality.<código>.sections.<TOL>` en `companies.json`.** Es un conteo y el diccionario lo clasifica como público, pero en un municipio pequeño como Kauniainen una celda con pocas empresas podría señalar a un empresario individual, cuyo nombre comercial suele ser el suyo. **Decisión: las celdas con menos de 5 empresas se publican vacías, y `verificar.py` falla si aparece una.** Hoy hay 9 celdas vacías. La regla está en el código desde la sesión de Juan; el grupo debe confirmarla.

**Límite abierto, decisión pendiente del grupo:** la regla de 5 se aplica en `public/data/companies.json`, pero el archivo de entrada `data/raw/prh_company_counts.json`, también en el repositorio público, guarda conteos por división TOL sin ese filtro: 49 de 304 celdas tienen menos de 5, y 23 tienen 1. No trae nombres y no se publica en la app, pero cualquiera que abra el repositorio puede leerlo. El grupo debe decidir si lo acepta o si cambia la ingesta para guardar solo lo que se publica. `verificar.py` hoy solo revisa `public/data/`.

**La clave de los enlaces no es protección, y el grupo decidió dejarla así.** Los enlaces a fuentes descartadas o en semáforo rojo piden una clave, que se compara con un hash en el JavaScript (`HASH_CLAVE` en `src/biblioteca/pliegos.jsx`).
- Es un freno para no abrirlos por accidente.
- Cualquiera puede leer el hash y saltársela, y lo que hay detrás son enlaces públicos.
- La clave se entrega aparte al profesor.

**Pruebas (2026-11-03, sobre la URL publicada):**
- `curl` a `/data/sources.json`, `/data/rents.json`, `/data/companies.json` y `/api/stops` responde 200: el sistema es abierto, como se decidió.
- Las cinco funciones `/api/live-*` y `/api/live-mobility` responden con datos reales.
- En `public/data/companies.json` no hay nombres ni direcciones, y ninguna celda visible es menor que 5.

**Revisión de secretos (2026-11-03):** se revisaron todas las líneas agregadas en el historial (25 commits de todas las ramas locales y remotas), buscando archivos `.env` y de credenciales, llaves privadas, llaves de AWS, GitHub, Google, Slack y OpenAI, y asignaciones de `api_key`, `password`, `secret`, `token` y similares. **Cero hallazgos.** Se comprobó primero que la búsqueda detecta secretos falsos de prueba. Quedaron fuera `package-lock.json` y el Excel, que es binario. El único valor de este tipo es `HASH_CLAVE`, descrito arriba.

**Pendiente:** que otro grupo intente sacar datos, con acuerdo escrito previo.

## Herramienta elegida para las vistas

**MapLibre GL JS con React y Vite.** Son de código abierto (BSD-3-Clause y MIT, leído en cada paquete), no necesitan llave y permiten dibujar solo datos del lago, con la altura del 3D ligada a la métrica.

**Comparada con deck.gl** sobre los mismos datos ([docs/exploracion-vistas.md](docs/exploracion-vistas.md)). Quedó MapLibre porque ya resuelve lo que la app necesita y pesa menos. deck.gl dibujó más rápido, pero eso no se nota con 167 áreas. El grupo debe confirmar esta decisión.

## Nuestra posición

**Borrador de la IA, no es todavía la posición del grupo.** No hay una posición escrita por el grupo en el repositorio. El grupo debe confirmar o reescribir estos textos.

**Datos · El mapa no es el territorio.** El mapa más vistoso de la app no muestra salarios: muestra el ingreso disponible de quienes viven en cada área postal, que incluye pensiones y transferencias. Un área postal no es un barrio, y en 3D la altura es una estadística, no edificios. Por eso la pregunta 1 se contesta con un proxy declarado en pantalla y no con la palabra «salario». Evidencia: `Habitar 1`, `etl/helsinki/sources/paavo.py`.

**Seguridad · Parecer protegido no es estar protegido.** Nuestra app tiene una pantalla que pide una clave y no protege nada: el hash está en el JavaScript y los enlaces son públicos. Lo que sí protege a las personas es menos visible: `empresas.py` descarta los nombres antes de guardar y `verificar.py` falla si aparece una celda con menos de 5. Dejamos la clave y la describimos como lo que es. Evidencia: `src/biblioteca/pliegos.jsx`, `etl/helsinki/sources/empresas.py`.

## Bitácora de IA

**Herramienta:** Claude Code, en las sesiones de Alejandro (Opus 5 y 5.5) y de Juan (Sonnet 5.5). El registro detallado, con pruebas y fechas, está en [docs/registro-integracion.md](docs/registro-integracion.md). La hoja **3. Bitácora IA** del [Excel](docs/Diccionario_de_datos_TallerDatos_Helsinki.xlsx) lleva los encargos del rastreo.

**Errores y correcciones reales del registro:**

| Fecha · sesión | Encargo | Qué salió mal | Cómo se detectó | Corrección |
|---|---|---|---|---|
| 10-27 · Alejandro | Integrar Paavo | El ingreso se llamaba «ingreso medio» | Etiquetas oficiales de PxWeb 12f1 | Se nombra ingreso monetario disponible de adultos residentes |
| 10-27 · Alejandro | Integrar Paavo | La ficha no traía el año de referencia | 4 valores coinciden con PxWeb 2024 | El año de referencia es 2024, no 2026 |
| 10-27 · Alejandro | Mapa de empleo | Los cortes de color se repetían en sectores con muchos ceros, y el mapa se quedaba sin color | Revisión del código; validación contra la especificación de MapLibre | Se quitan los cortes repetidos |
| 10-27 · Alejandro | Subir la integración | Un commit dejó fuera `run.py` | `git status` | Se corrigió en el commit siguiente |
| 10-30 · Juan | Contar empresas de PRH | Las divisiones sumaban 326.872 frente a 90.333 en Helsinki | La validación del ETL | Se cuentan registros por páginas |
| 10-30 · Juan | Superficie de HSY | Polígonos de área 0 hacían fallar la ingesta, y 2020 baja en los 4 municipios a la vez | La ingesta y la lectura de la serie | Se omiten esos polígonos; el pliego avisa que las ediciones no son comparables |
| 10-30 · Juan | Oferta educativa | Vipunen no trae código de municipio | Al abrir la fuente | Se descartó y se usó StatFin 11c4 |
| 10-30 · Juan | Empleo por lengua | No existe por región | Al abrir las tablas 115g y 115f | Se publicó nacionalidad, y el pliego dice que no es lengua |
| 11-03 · Alejandro | Fechas de prueba | El ETL sellaba «probado» el día en que corría | Comparar `sources.json` con `data/metadata/` | Usa la fecha de descarga, y `verificar.py` falla si no coincide |
| 11-03 · Alejandro | Contar integradas | Afirmó 5 sin traer el trabajo de Juan; eran 15 | `git fetch` antes de subir | Se fusionó y se rehízo el Excel antes de publicar |
| 11-03 · Alejandro | Revisar secretos | El primer escaneo usó una regex que no funcionaba | Al repasar el comando | Se repitió, tras comprobar que detecta secretos falsos |
| 11-03 · Alejandro | Comparar herramientas | Las esperas se colgaban, deck.gl parecía no seleccionar y los FPS salieron afectados | Corridas en Chrome | Se corrigió la prueba y se descartaron los FPS |

## Revisión cruzada

**Pendiente: no hay evidencia de ninguna de las dos revisiones. El grupo debe hacerlas y añadirlas aquí.**

| Revisión | Resultado |
|---|---|
| 3 cifras al azar llevadas hasta su fuente original por otro grupo | Pendiente |
| Ataque recibido de otro grupo (con acuerdo escrito previo) | Pendiente |

### Vueltas atrás

- **Pregunta sin fuente → rastreo:** no hay salario por zona; P1 se responde con ingreso de residentes, y se agregó salario a nivel región.
- **Fuente que no existe → otra:** Google Open Buildings no cubre Finlandia, y el 3D sale de extruir las áreas de Paavo.
- **Mirar antes de agregar:** la rejilla de empleo de HSY se liberó sin ingerirla porque Paavo ya trae empleos por sector y área postal, sin el riesgo de señalar a un empleador.
- **Fuente que no cruza → otra:** Vipunen se descartó por no traer código de municipio, y se usó StatFin 11c4.
- **Pregunta más estrecha:** empleo por lengua materna no existe por región; se publicó nacionalidad en Uusimaa, y el pliego dice que no es lengua ni municipio.
- **Verificación falla → arreglar la ingesta:** las fechas de prueba falsas y el método de PRH se corrigieron en la ingesta, sin aflojar `verificar.py`.
- **Cambio de producto:** el gemelo digital se reemplazó por la biblioteca; las teselas de OSM y el visor 3D dejaron de usarse y pasaron a descartadas.

## Guía para la presentación oral

Presentación corta, con el sistema abierto en pantalla y sin diapositivas. La pregunta del taller es: *¿qué herramienta descartaron que casi eligen, qué decidieron no mostrar, y qué tendría que cambiar —en la fuente, en la herramienta o en su propio sistema— para que la respuesta fuera otra?*

**Recorrido sugerido:**
1. Estante: qué es y a quién sirve.
2. Habitar 1: comparar dos zonas y abrir la nota al pie de una cifra.
3. Investigar 4 o Aprender 3: una vista con un límite explícito.
4. Fuentes: lo que no sirvió y por qué.

| Lo que preguntarán | Evidencia disponible | Respuesta del grupo |
|---|---|---|
| **Herramienta que casi eligieron y descartaron** | deck.gl se comparó con MapLibre, pero no hay evidencia de que el grupo casi la eligiera | **Pendiente** |
| **Dato que decidieron no mostrar** | Candidatos documentados: empresas una por una, celdas con menos de 5, direcciones por edificio | **Pendiente:** el grupo debe elegir uno y decir por qué |
| **Qué cambiaría la decisión** | Posibles ejemplos, a confirmar. **En la fuente:** salario publicado por área postal. **En la herramienta:** dibujar edificios, donde pesaría la velocidad de deck.gl. **En el sistema:** publicar datos más finos que exijan una compuerta real | **Pendiente** |

## Estado frente al piso técnico

| Requisito | Estado |
|---|---|
| Abre desde un teléfono | Hecho: Alejandro abrió la app publicada en un teléfono real y se ve bien (2026-11-03) |
| Cada cifra con fuente, vigencia y fecha de prueba a un clic | Hecho en los pliegos revisados; falta una auditoría completa |
| Al menos una vista sobre el territorio | Hecho |
| El lago se reconstruye desde los scripts | Hecho: se borró, se corrió el ETL y las 10 salidas de datos volvieron con el mismo sha256 (2026-11-03) |
| Cada tramo con 2 herramientas | **Parcial:** comparación completa en Vistas; los demás tramos siguen pendientes |
| Ninguna pieza depende de una llave paga | Hecho |
| Compuerta | No aplica: abierto por decisión escrita (ver Protección) |
| Números de la prosa salen del lago | Hecho en la app; las cifras de este README se copiaron a mano y hay que revisarlas si cambia el lago |

**Vencimiento:** el horario GTFS de HSL vence el **2026-11-16**. Antes de esa fecha hay que descargarlo de nuevo con `python3 -m etl.helsinki.run --refresh` y hacer push; si no, la app mostrará el sello de vigencia vencida.

## Licencia de los datos

Los datos son de sus productores, bajo las licencias de la tabla «¿Se puede usar?». Más detalle en [docs/licensing.md](docs/licensing.md).
