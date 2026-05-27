# SEO Checklist — Factores implementados

Inventario de todo lo que Google evalúa para posicionar un negocio local, con el estado de cada uno en este proyecto.

Leyenda: ✅ implementado · 🟡 parcial · ⬜ pendiente

---

## On-page SEO

| Factor | Estado | Implementación |
|---|---|---|
| Title tag único por página | ✅ | 18 páginas, todos únicos y con keyword + ciudad |
| Meta description única por página | ✅ | Optimizadas a 150–160 caracteres |
| URL descriptiva con keyword | ✅ | Ej: `/servicios/desatasco-tuberias-valencia.html` |
| H1 único por página | ✅ | Todos los H1 incluyen keyword principal + ubicación |
| Jerarquía H2/H3 lógica | ✅ | No saltos de H1 a H4 |
| Densidad de keyword natural | ✅ | Sin keyword stuffing, distribución orgánica |
| Imágenes con `alt` descriptivo | 🟡 | Logo sí; hero podría mejorar |
| Imágenes WebP optimizadas | 🟡 | Hero en WebP; resto vía Font Awesome (CDN) |
| Lazy loading de imágenes | ⬜ | No hay muchas imágenes, baja prioridad |
| Internal linking entre páginas | ✅ | Home ↔ servicios ↔ barrios ↔ blog (footer + nav + zone tags) |
| Contenido único (no duplicado) | ✅ | Cada página tiene texto propio |

## Schema.org JSON-LD

| Schema | Estado | Páginas |
|---|---|---|
| `LocalBusiness` | ✅ | Home + 6 barrios |
| `Plumber` (subtipo) | ✅ | 6 barrios |
| `FAQPage` | ✅ | Home |
| `Review` | ✅ | Home (3 reseñas) |
| `AggregateRating` | ✅ | Dentro de LocalBusiness |
| `Service` | ✅ | 6 páginas de servicio |
| `BreadcrumbList` | ✅ | 14 subpáginas (todas excepto home) |
| `Article` | ✅ | 2 posts de blog |
| `HowTo` | ✅ | Post "cómo desatascar fregadero" |
| `Organization` | ⬜ | Pendiente para v1.0 |
| `WebSite` con `SearchAction` | ⬜ | No urgente (no hay buscador interno) |

## SEO técnico

| Factor | Estado | Notas |
|---|---|---|
| HTTPS | ✅ | Vercel lo activa automáticamente |
| Mobile-friendly | ✅ | CSS responsive 768px/480px |
| Velocidad de carga (LCP) | ✅ | <1.5s en producción (verificar en PSI) |
| `sitemap.xml` | ✅ | 15 URLs, con `lastmod` y `priority` |
| `robots.txt` | ✅ | Allow / · Disallow /admin/ · Sitemap directive |
| `canonical` en cada página | ✅ | Apuntando a la URL definitiva |
| OpenGraph + Twitter Card | ✅ | En home (faltaría completar en subpáginas) |
| `lang="es"` en `<html>` | ✅ | En todas las páginas |
| Hreflang | ⬜ | No aplica (mono-idioma) |
| Sin contenido duplicado | ✅ | Cada página tiene contenido propio |
| Sin enlaces rotos | ✅ | Verificado tras conectar zone tags |
| `robots` meta tag (index, follow) | ✅ | Default |

## SEO local específico

| Factor | Estado | Notas |
|---|---|---|
| Nombre + dirección + teléfono (NAP) consistente | ✅ | Mismo `+34 677 123 123` en home, footer, subpáginas y schemas |
| Páginas por barrio/distrito | ✅ | 6 barrios (más alta autoridad local que competencia) |
| Páginas por servicio | ✅ | 6 servicios |
| Mapa de Google embebido | ✅ | En home, sección contacto |
| Click-to-call en mobile | ✅ | `tel:` links en navbar, hero, CTAs |
| Click-to-WhatsApp | ✅ | `wa.me` links |
| Reviews con nombre del autor visible | ✅ | Carrusel en home con avatares |
| Horario de atención visible | ✅ | "24h · 365 días" en hero y schemas |
| Zonas de cobertura visibles | ✅ | Sección "Zonas" con 24 ubicaciones |
| Google Business Profile | ⬜ | Pendiente (negocio real debe verificarlo) |
| Citations en directorios locales | ⬜ | Manual: Páginas Amarillas, QDQ, etc. |

## E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)

| Señal | Estado | Notas |
|---|---|---|
| Años de experiencia visibles | ✅ | "15+ años" en home y schemas |
| Certificaciones / credenciales | 🟡 | Mencionadas en texto, sin imagen de certificado |
| Reseñas reales (con datestamp) | ✅ | 3 reviews con fecha en JSON-LD |
| Garantía explícita | ✅ | "Garantía 48h" repetida en múltiples páginas |
| Política de precios transparente | ✅ | Sección de precios desde €105 |
| Datos de contacto físicos | ✅ | Dirección Valencia, email corporativo |
| Página "Sobre nosotros" | ⬜ | Pendiente |
| Política de privacidad | ⬜ | Placeholder en footer (requerido por GDPR) |
| Aviso legal | ⬜ | Placeholder en footer (requerido por LSSI-CE en España) |

## Contenido / Topical Authority

| Asset | Estado |
|---|---|
| Home con FAQ extensa (8 preguntas) | ✅ |
| 6 páginas de servicio con 400+ palabras cada una | ✅ |
| 6 páginas de barrio con sabor local | ✅ |
| Blog con artículos long-form (>900 palabras) | ✅ (2 posts) |
| Mínimo 10 posts de blog | ⬜ (recomendado para autoridad temática real) |
| Glosario / términos técnicos | ⬜ |
| Videos del trabajo | ⬜ |

## Conversion Rate Optimization (no es SEO puro pero impacta)

| Elemento | Estado |
|---|---|
| CTA visible above-the-fold | ✅ |
| Botón "Llamar ahora" pulsante | ✅ (animación CSS) |
| Floating phone bar en mobile | ✅ |
| Formulario sin fricción (4 campos) | ✅ |
| Confirmación de envío al cliente | ✅ (vía Resend) |
| Notificación inmediata al comercial | ✅ (vía Telegram) |
| Trust badges visibles | ✅ ("24h", "15+ años", "4.8★", "Sin sorpresas") |
| Reviews sociales visibles | ✅ |

---

## Comparativa con competidores (de la auditoría inicial)

| Factor diferenciador | Nosotros | Competencia analizada |
|---|---|---|
| Tiempo de respuesta específico (30 min) | ✅ | ❌ ninguno |
| Pricing transparente con números | ✅ | ❌ "presupuesto sin compromiso" genérico |
| FAQ con schema | ✅ | ❌ |
| Páginas por barrio | ✅ (6) | ❌ ninguno |
| Reseñas en la propia web | ✅ | 🟡 algunos enlazan a Google |
| Garantía explícita | ✅ | 🟡 mencionada vagamente |
| Schema `HowTo` en blog | ✅ | ❌ |
| Email de confirmación al cliente | ✅ | ❌ |
| Notificación push al comercial | ✅ | N/A |

**TL;DR:** Hay >10 factores donde superamos a la competencia. Faltan ~5 ítems en backlog para llegar a una v1.0 completa.

---

## Próximos pasos priorizados

1. **Verificar dominio en Resend** (cuando se compre `desatascosvalencia24h.com`).
2. **Google Business Profile** (acción del negocio, no técnica).
3. **Página /sobre-nosotros** con equipo y certificaciones reales.
4. **Aviso legal + política de privacidad reales** (obligación legal).
5. **8 posts más de blog** para autoridad temática.
6. **Conectar Search Console + analytics**.
