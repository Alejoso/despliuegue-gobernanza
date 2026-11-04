# Current limitations

## Integrated data

The current snapshot has four generalized 2025 Statistics Finland municipal polygons and 6,027 HSL GTFS boarding-stop records: 1,787 Espoo, 2,601 Helsinki, 1,560 Vantaa and 79 Kauniainen. The source GTFS contained 8,389 stop records, 8,267 boarding locations; 2,240 boarding records lie outside the selected four municipalities. The checked-in feed validity was 2026-09-18 through 2026-11-16; it is a dated schedule snapshot, refreshed daily upstream, not a realtime stop feed.

Statistics Finland boundaries are generalized to 1:1,000,000 and are not district/neighborhood geometries. Stop counts are counts of GTFS boarding-point records and can include separate directional or platform records; they are not unique stations or service frequency.

## Live and 3D

The documented HSL raw GTFS-Realtime endpoint was queried through the actual proxy with Node: HTTP 200, `application/x-protobuf`, GTFS-RT v2.0 and 360 real VehiclePosition entities with valid coordinates in the latest recorded probe. The registry records that observation and does not imply constant availability. Vite runs the same handler through its development middleware. The Vercel function is not deployed from this workspace, so production runtime execution and cache headers still need a deployed check. No scheduled positions are labelled live.

The official Helsinki 3D viewer is no longer used. The 3D view extrudes Paavo postal areas, so its height encodes a statistic, not buildings. Local building geometry and heights are pending.

## Failed and pending sources

Attempts to query Helsinki's city WFS and an OSM Overpass endpoint timed out during this phase. Consequently there are no local building footprints or heights. Helsinki Service Map is documented as a candidate source, but endpoint response size/reliability and redistribution terms need verification. Population, housing, energy, climate, services, universities, companies, jobs, publications, patents and funding are not integrated. The interface avoids assigning them a numeric zero.

## Platform

The Vercel functions, PostGIS schema and bbox endpoint are prepared but have not been deployed or exercised in production. There is no automated schedule or hosted database. The public OSM raster tile endpoint is best-effort and not a production SLA. Full HSL GTFS is large; only the stop and feed metadata tables are retained. Changes in provider schema or policy require a fresh quality/licensing review.
