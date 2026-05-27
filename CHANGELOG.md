# Changelog

Historial de iteraciones del proyecto. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/).
Fecha en formato `YYYY-MM-DD`.

---

## [0.3.1] — 2026-05-27

### Corregido
- Bug crítico en `api/contact.js`: el envío de email via Resend estaba implementado como fire-and-forget (sin `await`), pero **Vercel mata el proceso de la función al devolver la respuesta HTTP**, por lo que la promesa de Resend nunca se completaba y el email nunca llegaba al cliente.
- Solución: `await sendClientEmail(...)` dentro de try/catch — si Resend falla no bloquea la respuesta, pero ahora se ejecuta hasta el final.
- Añadido campo `email: "sent" | "failed: ..." | "skipped"` en la respuesta JSON para debugging.

### Lección aprendida
- En serverless functions (Vercel/AWS Lambda) **NO usar fire-and-forget** para tareas que deben completar — el runtime puede pausar/matar la función al devolver. Siempre `await`. Si se quiere paralelismo, usar `Promise.all` y luego await.

## [0.4.0] — 2026-05-27

### Añadido
- **Documentación completa** del proyecto: `README.md`, `CHANGELOG.md`, `docs/PLAYBOOK.md`, `docs/ARCHITECTURE.md`, `docs/SEO-CHECKLIST.md`.
- Objetivo: permitir clonar este proyecto a otros negocios locales y dejar trazabilidad de las decisiones.

## [0.3.0] — 2026-05-27

### Añadido
- **Email de confirmación al cliente** vía Resend en `api/contact.js`.
- Plantilla HTML del email con la identidad visual de la marca (logo, colores, CTA al teléfono).
- Configuración con `from: onboarding@resend.dev` + `reply-to` al email real (opción A: sin verificar dominio, válida para clase y demo).
- Variable de entorno `RESEND_API_KEY` en Vercel.

### Por qué
- Reduce la ansiedad del cliente (sabe que su solicitud llegó).
- Refuerza la marca con un email cuidado, no solo un "gracias" genérico.

## [0.2.0] — 2026-05-27

### Añadido
- **Integración formulario → Telegram** via Vercel serverless function `api/contact.js`.
- Bot `@desatascos_valencia_bot` creado en Telegram (via @BotFather).
- Variables de entorno `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` configuradas en Vercel.
- Anti-bot honeypot (campo `website` oculto, si se rellena se ignora la submisión).
- JS del formulario con feedback visual (loading, éxito, error).
- Etiquetas de zona (`Ruzafa`, `Benimaclet`, `Patraix`, `Campanar`, `Jesús`, `Cabanyal`) ahora son enlaces a las páginas de barrio correspondientes.

### Por qué
- Push instantáneo al móvil del comercial > email que cae en spam o se mira tarde.
- Sin coste de SMTP, sin riesgo de exposición de credenciales en el frontend.
- Enlaces internos entre zonas y páginas de barrio refuerzan la autoridad temática local.

## [0.1.0] — 2026-05-27

### Añadido
- **Deploy a producción en Vercel**: [desatascos-valencia.vercel.app](https://desatascos-valencia.vercel.app).
- Conexión repo GitHub ↔ Vercel para deploys automáticos en cada push a `main`.

## [0.0.1] — 2026-05-27

### Añadido — Build SEO inicial completo (18 páginas)

#### Home (`index.html`)
- Meta tags completos: canonical, OpenGraph, Twitter Card.
- Sección "Cómo trabajamos" (proceso de 4 pasos).
- Sección "Precios transparentes" (desde €105/h diurno, desde €140/h nocturno).
- 8 FAQs con JSON-LD `FAQPage` para rich snippets.
- Sección de reviews con JSON-LD `Review` (3 reseñas verificadas).
- Schema `LocalBusiness` completo.
- Footer expandido a 5 columnas con sección de Barrios.
- Etiquetas de zona enlazadas a páginas de barrio.

#### 6 páginas de servicio (`servicios/`)
- `desatasco-tuberias-valencia.html`
- `desatasco-wc-valencia.html`
- `desatasco-fregadero-valencia.html`
- `desatasco-canalones-valencia.html`
- `inspeccion-camara-tuberias-valencia.html`
- `limpieza-fosa-septica-valencia.html`
- Cada una con: hero, 3 cards de propuesta de valor, prose de 400+ palabras, 4 FAQ con schema, schema `Service` + `BreadcrumbList`.

#### 6 páginas de barrio (`barrios/`)
- Ruzafa, Benimaclet, Campanar, Patraix, Cabanyal, Jesús.
- Cada una con sabor local (referencias a infraestructura, antigüedad de edificios, zonas vecinas), schema `LocalBusiness` + `Plumber` con `areaServed` específico.

#### Blog (`blog/`)
- `index.html` con listado de artículos y schemas `BreadcrumbList` + `Blog ItemList`.
- `cuanto-cuesta-desatasco-urgente-valencia.html` (~950 palabras, tabla de precios, schema `Article`).
- `como-desatascar-fregadero-sin-plomero.html` (~1.000 palabras, 5 métodos paso a paso, schema `HowTo`).

#### Infraestructura SEO
- `sitemap.xml` con las 15 URLs.
- `robots.txt` con directiva `Sitemap`.

### Investigación previa (no en código)
- Análisis competitivo en Google con 6 búsquedas vía Camoufox (`google_search.py`).
- Auditoría de 4 competidores principales: ninguno usa tiempo de respuesta específico, FAQ ni precios transparentes → diferenciadores claros.
- Identificación de oportunidad "blue ocean" en páginas de barrio (ningún competidor las tiene).

---

## Próximas iteraciones (backlog)

- [ ] Verificar dominio `desatascosvalencia24h.com` en Resend cuando esté comprado → emails desde `noreply@desatascosvalencia24h.com`.
- [ ] Conectar Google Search Console y subir sitemap.
- [ ] Conectar Google Analytics 4 o Plausible.
- [ ] Añadir páginas de barrio adicionales (Algirós, Quatre Carreres, La Saïdia, Extramurs, etc.).
- [ ] Más artículos de blog (mínimo 10 para autoridad temática).
- [ ] Formulario más rico (selector de servicio, urgencia, dirección).
- [ ] Bot de Telegram bidireccional: marcar lead como atendido desde el chat.
- [ ] Schema `Organization` global + página "Sobre nosotros" para E-E-A-T.
- [ ] Imágenes optimizadas en WebP + lazy loading.
