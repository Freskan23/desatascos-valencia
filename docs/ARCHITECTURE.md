# Architecture

Decisiones técnicas y el por qué de cada una. Para entender no solo qué hace el proyecto, sino por qué está construido así.

---

## Principios de diseño

1. **Velocidad ante todo.** El SEO local castiga sin piedad los sitios lentos. LCP <1.5s, CLS <0.1.
2. **Cero JavaScript innecesario.** No es una SPA, no necesita React/Vue/Svelte. JS solo donde aporta (formulario, navbar scroll).
3. **El backend mínimo posible.** Una sola función serverless para el formulario. Nada más.
4. **Coste cero hasta que escale.** Todo el stack en plan gratuito hasta que el negocio facture lo suficiente para justificar pagar.
5. **Iteración rápida.** Cada cambio se ve en producción en <30 segundos vía push a `main`.

---

## Stack y por qué

### Frontend: HTML + CSS + JS vanilla

**Alternativas descartadas:**
- **Next.js / Astro:** overkill para un sitio de 18 páginas, añade un build step y dependencias.
- **WordPress:** lento, vulnerable, requiere mantenimiento, panel innecesario para esto.
- **Webflow/Framer:** rápido de hacer, pero te ata a su plataforma (~30€/mes) y dificulta versionado en Git.

**Por qué vanilla:**
- LCP <1s en mobile sin esfuerzo.
- Cualquier desarrollador puede editar el HTML sin onboarding.
- No hay build, no hay node_modules, no hay version conflicts.
- Funciona abierto directamente desde `file://` (útil para previsualizar).
- Trivial de cachear en CDN.

### Hosting: Vercel (plan Hobby)

**Por qué Vercel y no Netlify, Cloudflare Pages o GitHub Pages:**
- **Serverless functions integradas** sin configuración (carpeta `api/` y listo).
- **Preview deploys** automáticos en cada PR (no usados aún pero útiles a futuro).
- **Edge network global** de fábrica.
- Plan gratis suficiente: 100 GB de ancho de banda, 1M de invocaciones de función al mes.

**Limitaciones del free tier que debemos conocer:**
- 100 GB/mes de bandwidth (a saturarse: ~500k visitas/mes con páginas de 100 KB → muy lejos del problema).
- Función serverless máximo 10 segundos de ejecución (suficiente: nuestro endpoint tarda <500ms).
- Sin custom domain SSL directo en producción si se queda en `.vercel.app` (solo aplica al verificar dominio propio).

### Backend: Vercel Serverless Function

**Una sola función:** `api/contact.js`. Procesa el formulario, llama a Telegram, llama a Resend.

**Por qué no un servidor tradicional (Node + Express en VPS):**
- Cero mantenimiento (sin OS updates, sin firewall, sin SSL renewal).
- Escala automático.
- Coste real de un negocio local: prácticamente 0 invocaciones/día → 0€.

**Por qué no Edge Functions:**
- Edge Functions (Cloudflare Workers, Vercel Edge) tienen runtime limitado (no todas las librerías Node funcionan).
- Para esto, una Serverless Function clásica (Node.js) es más predecible.

### Notificación interna: Telegram Bot

**Alternativas descartadas:**
- **Email al comercial:** se mira tarde, puede ir a spam, el comercial no tiene notificación push fiable.
- **SMS (Twilio):** funciona pero cuesta €0.04 por mensaje + número virtual mensual.
- **Slack / Discord:** requieren que el comercial tenga la app instalada, más fricción.
- **WhatsApp Business API:** caro (€0.01–0.05 por mensaje + setup complicado de Meta Business).

**Por qué Telegram:**
- Push notification real al móvil del comercial, gratis e ilimitado.
- Bot creado en 2 minutos vía `@BotFather`.
- API REST simple (`fetch` + JSON, sin SDK).
- Si el negocio crece, cambias el chat_id por un grupo y notificas a todo el equipo.
- Markdown soportado → mensajes legibles con negrita, emoji, etc.

### Email transaccional: Resend

**Alternativas descartadas:**
- **SendGrid:** UI antigua, onboarding pesado, integración menos fluida con Vercel.
- **Mailgun:** free tier solo 3 meses, después de pago.
- **Brevo:** 300/día gratis (más que Resend), pero API más verbosa y dashboard más cargado.
- **SMTP Gmail/Outlook:** bloqueos frecuentes, no escala, requiere App Passwords.

**Por qué Resend:**
- API moderna (REST + JSON, una sola llamada).
- 100 emails/día gratis = 3.000/mes (suficiente para un negocio local).
- Integración nativa con Vercel: 1 click en marketplace y la `RESEND_API_KEY` se inyecta sola.
- Email HTML responsive sin esfuerzo.
- Mejor deliverability que SMTP genérico.

---

## Estructura de URLs (decisión SEO)

```
/                                              ← home (keyword principal)
/servicios/desatasco-tuberias-valencia.html   ← variante de servicio + ciudad
/barrios/desatascos-ruzafa-valencia.html      ← intent local específico
/blog/cuanto-cuesta-desatasco-urgente-valencia.html ← intent informacional
```

**Por qué `.html` en la URL y no URLs limpias:**
- Vercel + sitio estático funciona out-of-the-box con `.html`.
- URLs limpias requerirían `vercel.json` con rewrites, complica el deploy.
- Para SEO local NO penaliza tener `.html`, lo que importa es el contenido.

**Por qué `/servicios/`, `/barrios/`, `/blog/` como subdirectorios:**
- Da estructura semántica clara al crawler.
- Facilita identificar tipos de página en analytics.
- Permite reglas `Disallow:` granulares si en el futuro hace falta.

---

## Estrategia de schemas JSON-LD

| Schema | Dónde | Por qué |
|---|---|---|
| `LocalBusiness` | Home + barrios | Activa el knowledge panel y Local Pack |
| `FAQPage` | Home | Rich snippet de FAQ en SERP (ocupa más espacio) |
| `Review` + `aggregateRating` | Home | Estrellas amarillas en SERP |
| `Service` | Páginas de servicio | Marca cada servicio para búsquedas tipo "servicio X cerca de mí" |
| `BreadcrumbList` | Todas las subpáginas | Rich snippet de breadcrumb en SERP |
| `Article` | Posts de blog | Mejora apariencia en News y Discover |
| `HowTo` | Post "cómo desatascar fregadero" | Rich snippet de pasos numerados |

---

## Anti-patrones evitados

- ❌ **API keys en el frontend.** Todo lo sensible en env vars del servidor.
- ❌ **Forms que dependen de servicios SaaS externos** (Formspree, Typeform): ata a una plataforma + coste mensual + latencia.
- ❌ **Plugins/iframes de chat** que añaden 500 KB de JS al LCP.
- ❌ **Optimización prematura.** No metemos un framework "por si crece"; cuando crezca, migramos.
- ❌ **Tracking pesado.** Cuando se añada analytics será Plausible o GA4 mínimo, no 5 herramientas de Marketing Stack.

---

## Si esto crece

Cuándo dejaría de ser óptimo este stack:
- **Más de 50 páginas que comparten estructura:** migrar a generador estático (Astro/Eleventy) para no copiar HTML.
- **Necesidad de CMS para que no-devs editen contenido:** añadir un headless CMS (Sanity, Strapi) o pasar a Webflow.
- **Más de 3.000 leads/mes:** plan Resend de pago (€20/mes) o migrar a SES de AWS.
- **Aplicaciones interactivas (chat, dashboard de leads):** añadir un framework de UI (probablemente Next.js).
