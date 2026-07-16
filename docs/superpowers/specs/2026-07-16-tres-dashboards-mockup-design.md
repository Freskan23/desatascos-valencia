# Mockup visual: 3 dashboards (dueño / SEO / comercial)

**Fecha:** 2026-07-16
**Estado:** aprobado, pendiente de implementación
**Alcance:** solo frontend con datos de ejemplo. Sin modelo de datos, sin integraciones, sin conexión a `/dashboard` real todavía.

## Contexto

Briefing recibido del usuario describe un sistema completo de 3 dashboards (comercial, SEO, cliente) sobre una base de datos Prisma compartida, con event tracking, atribución, integraciones (Twilio, WhatsApp, GA4, Search Console, GBP, Stripe) y una capa MCP — roadmap de 7 fases. Ese sistema completo queda **fuera de este spec**; aquí solo se cubre la fase visual: 3 pantallas mockeadas para validar dirección de producto antes de construir el backend.

El usuario adjuntó un mockup de referencia (screenshot) en tema oscuro con paleta arcoíris (donuts multicolor, iconos de color por KPI). Se decidió **no** adoptar ese tema: el repo ya tiene un sistema claro establecido (`--brand:#1e6fc8`, `--accent:#22b14c`, sidebar oscura `#0f172a`, ver `src/layouts/Dashboard.astro` y `src/pages/login.astro`), y las reglas de paleta de datos (`dataviz` skill) desaconsejan donuts y colores no funcionales. Se mantiene el tema claro existente, adaptando la estructura de información del mockup (funnel, kanban, tabla de leads, panel de detalle).

## Rutas

Tres páginas nuevas, patrón "preview sin auth" ya usado hoy (`export const prerender = false`, sin gate de middleware por no empezar con `/dashboard`):

- `/preview-dashboard-dueno` — resumen ejecutivo del negocio
- `/preview-dashboard-seo` — rendimiento y adquisición
- `/preview-dashboard-comercial` — pipeline de leads a facturación

Todas comparten `Dashboard.astro` como layout. El sidebar de `Dashboard.astro` se amplía con las nuevas secciones (ver más abajo) — enlazando a las 3 rutas preview por ahora; cuando se apruebe la dirección, se renombran a rutas reales bajo `/dashboard/*`.

## Nav unificado

En vez de 3 sidebars distintos (como en el screenshot), un único sidebar con:

- Resumen → `/preview-dashboard-dueno`
- Leads → `/preview-dashboard-comercial`
- SEO → `/preview-dashboard-seo`
- Facturación → placeholder deshabilitado (fase futura)
- Configuración → placeholder deshabilitado (fase futura)

Justificación: es una pyme con un dueño, no una agencia con 3 productos separados — un solo mapa mental es más usable que 3 apps.

## Componentes nuevos

1. **StatTile** — label, value (auto-compact), delta opcional (signo + color por dirección×si-subir-es-bueno). Sustituye a los `.kpi` actuales, mismo look pero con delta.
2. **OrdinalFunnel** — igual forma que `SectionFunnel` de hoy, pero con ramp de un solo hue (azul, pasos claro→oscuro por etapa) en vez de barra uniforme — transmite orden sin caer en arcoíris.
3. **PipelineKanban** — columnas estáticas (sin drag) con contador por estado. 11 estados del briefing agrupados en 6: Nuevo, En atención, Presupuesto enviado, Presupuesto aceptado, Trabajo realizado, Facturado (Perdido se muestra aparte, en gris, al final).
4. **LeadsTable** — filas con pill de estado (paleta status reservada: bueno=verde/aviso=ámbar/urgente=rojo), click abre panel de detalle.
5. **LeadDetailPanel** — slide-over lateral con tabs Detalle/Actividad/Notas, cierra con X.

Reutilizados sin cambios de fondo: `TrendChart` (evolución de facturación / visitas orgánicas), patrón `RankingBars` (páginas/leads por URL, keywords), patrón `ClicksBreakdown` (fuentes de tráfico, conversiones por CTA — sustituye los donuts del mockup).

## Pantalla 1 — Resumen del dueño

KPIs (StatTile ×4): Leads confirmados, Trabajos realizados, Facturación, Ticket medio — cada uno con delta vs periodo anterior.
Embudo comercial (OrdinalFunnel): Visitas → Intenciones de contacto → Leads confirmados → Presupuestos enviados → Trabajos realizados → Facturación.
Evolución de facturación (TrendChart, reetiquetado a € en vez de visitas).
Trabajos por servicio (RankingBars en vez de donut): Desatascos urgentes, Limpieza de tuberías, Vaciado de fosas, Inspección con cámara, Otros.

## Pantalla 2 — SEO

KPIs (StatTile ×4): Visitas totales, CTR orgánico, Posición media, Leads confirmados.
Dos TrendChart lado a lado: Visitas orgánicas / Leads confirmados.
Fuentes de tráfico (RankingBars en vez de donut): Orgánico, Directo, Referral, Social, Paid.
Conversiones por CTA (ClicksBreakdown): WhatsApp, Teléfono, Formulario, Chatbot.
Leads por página de destino (tabla simple: página, leads, % conversión).

## Pantalla 3 — Seguimiento comercial

Resumen de pipeline (StatTile ×5, uno por etapa clave: Nuevos, En atención, Presupuesto enviado, Trabajo realizado, Facturado).
PipelineKanban con las 6 columnas.
LeadsTable con 5-6 leads de ejemplo (nombre, fuente/página, CTA, estado, valor estimado, fecha).
LeadDetailPanel mockeado con un lead de ejemplo abierto (Laura Martín, como en el screenshot de referencia).

## Datos de ejemplo

Todo hardcodeado en el frontmatter de cada `.astro`, mismo patrón que las 4 gráficas de hoy — números plausibles para un negocio real de desatascos en Valencia, coherentes entre las 3 pantallas donde se solapan (ej. "Leads confirmados" igual en pantalla 1 y 3).

## Fuera de alcance (explícito)

- Modelo de datos Prisma (Lead/Event/atribución) — briefing Fase 1, no hoy.
- Cualquier integración (Twilio, WhatsApp, GA4, Search Console, GBP, Stripe, proveedor SEO, MCP).
- Autenticación/gating de estas 3 rutas — quedan como preview público hasta que se apruebe la dirección.
- Interactividad real (kanban drag, tabla filtrable/ordenable, panel editable) — todo estático para esta fase de mockup.
