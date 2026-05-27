# Playbook: clonar este proyecto a otro negocio local

Receta paso a paso para crear una web SEO + captación de leads similar para otro negocio local (otra ciudad, otro vertical: cerrajeros, electricistas, fontaneros, reformas, etc.).

**Tiempo estimado:** 2–3 horas si tienes el contenido listo, 1 día completo con investigación.

---

## Fase 0 — Investigación (45 min)

Antes de escribir una línea de código.

### 0.1 Definir la keyword principal
Ej: "desatascos urgentes valencia", "cerrajero 24h madrid", "electricista barato sevilla".

### 0.2 Análisis competitivo
1. Hacer las 5–10 búsquedas más relevantes en Google (modo incógnito).
2. Listar los 5 primeros competidores orgánicos y el Local Pack.
3. Auditar cada uno respondiendo:
   - ¿Tiene precios transparentes? ¿Hasta qué nivel de detalle?
   - ¿Tiene FAQ? ¿Cuántas preguntas?
   - ¿Tiene páginas por barrio/zona?
   - ¿Tiene blog? ¿Cuántos artículos?
   - ¿Reviews en la web (no solo en Google)?
   - ¿Tiempo de respuesta específico (X minutos)?
   - ¿Garantía explícita?
4. **El gap = tu diferenciador.** En nuestro caso descubrimos que nadie usaba tiempo de respuesta específico ni precios desde X€ → eso lo elevamos al hero.

**Herramienta:** `google_search.py` (scraper Camoufox que evita bloqueos de Google). Está en `C:\Users\panoj\Scripts\` en mi entorno.

### 0.3 Definir la información del negocio
Recopilar antes de empezar:
- Nombre comercial y razón social
- Teléfono (formato internacional: `+34 XXX XXX XXX`)
- Email
- Dominio (si aún no se ha comprado, decidirlo ya)
- WhatsApp
- Coordenadas GPS (para schema)
- Reviews de Google (al menos las 3 mejores con nombre del autor y fecha)
- Identidad visual: 1 color de marca + 1 color de acento + tipografía + logo PNG con fondo transparente

---

## Fase 1 — Setup del repo (15 min)

```bash
# 1. Crear carpeta nueva
mkdir nombre-proyecto && cd nombre-proyecto

# 2. Clonar este proyecto como plantilla
git clone https://github.com/Freskan23/desatascos-valencia.git .
rm -rf .git

# 3. Inicializar nuevo repo
git init -b main
gh repo create nombre-proyecto --private --source=. --remote=origin
git add . && git commit -m "Initial commit desde plantilla"
git push -u origin main
```

---

## Fase 2 — Personalizar el contenido (90 min)

### 2.1 Buscar y reemplazar globales
Reemplazar en TODOS los archivos:

| Buscar | Reemplazar con |
|---|---|
| `Desatascos urgentes en Valencia` | Nombre del nuevo negocio |
| `desatascosvalencia24h.com` | Nuevo dominio |
| `+34 677 123 123` | Nuevo teléfono |
| `info@desatascosvalencia24h.com` | Nuevo email |
| `--brand: #ffc13b` | Color de marca del nuevo negocio |
| `--accent: #22c55e` | Color de acento |
| `Valencia` | Nueva ciudad (cuidado: solo donde se refiere a la ubicación, no a "Valencia FC" si aparece) |

### 2.2 Renombrar las páginas de servicio
- `servicios/desatasco-tuberias-valencia.html` → `servicios/desatasco-tuberias-[ciudad].html`
- Adaptar el contenido al vertical real (si no son desatascos sino cerrajería, cambiar todo).

### 2.3 Renombrar las páginas de barrio
- `barrios/desatascos-ruzafa-valencia.html` → `barrios/[servicio]-[barrio]-[ciudad].html`
- Cambiar el sabor local: nombres de barrios reales, infraestructura típica, edificios.

### 2.4 Actualizar `sitemap.xml`
Reemplazar las 15 URLs con las nuevas. Cambiar `lastmod` a la fecha actual.

### 2.5 Actualizar schemas JSON-LD
- `LocalBusiness`: nombre, teléfono, email, dirección, coordenadas, `aggregateRating` con reviews reales.
- `Review`: 3 reseñas reales del nuevo negocio (mínimo).
- `FAQPage`: revisar que las preguntas siguen aplicando.
- Schemas `Service`: precios reales en `priceRange`.

---

## Fase 3 — Captación de leads (30 min)

### 3.1 Crear bot de Telegram
1. Abrir Telegram → buscar `@BotFather` → `/newbot`.
2. Nombre + username (debe acabar en `bot`).
3. Copiar el token.
4. **Importante:** abrir chat con el bot recién creado y darle "Start", si no Telegram no te puede enviar mensajes.

### 3.2 Obtener Chat ID
1. Abrir Telegram → buscar `@userinfobot` → Start.
2. Te devuelve tu chat ID (número).

### 3.3 Setup Resend
1. Sign up en [resend.com](https://resend.com).
2. API Keys → Create API Key → "Sending access" / All domains.
3. Copiar la key (`re_...`).

### 3.4 Configurar Vercel
```bash
vercel link  # asociar carpeta a un proyecto Vercel
printf "TOKEN_AQUI" | vercel env add TELEGRAM_BOT_TOKEN production
printf "CHAT_ID_AQUI" | vercel env add TELEGRAM_CHAT_ID production
printf "RESEND_KEY_AQUI" | vercel env add RESEND_API_KEY production
vercel --prod
```

### 3.5 Test end-to-end
```bash
curl -X POST "https://tu-proyecto.vercel.app/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"TEST","telefono":"+34600000000","email":"tu@email.com","mensaje":"prueba"}'
```
Debe llegar Telegram + email.

---

## Fase 4 — SEO técnico (20 min)

1. **Google Search Console:** añadir propiedad → verificar (DNS o HTML tag) → enviar `sitemap.xml`.
2. **Google Analytics 4** (o Plausible si quieres privacy-friendly): añadir snippet a `<head>` de todas las páginas.
3. **Google Business Profile:** si el negocio aún no lo tiene, crear y verificar (postal o video). Vincular el sitio.
4. **Schema Validator:** pasar la home y al menos 1 página de cada tipo por [validator.schema.org](https://validator.schema.org/) y por [Google Rich Results Test](https://search.google.com/test/rich-results).
5. **PageSpeed Insights:** [pagespeed.web.dev](https://pagespeed.web.dev/) → debe estar en verde (90+) en mobile y desktop.

---

## Fase 5 — Dominio real (cuando esté listo)

1. Comprar dominio (Namecheap, Hostinger, GoDaddy — ~10€/año).
2. En Vercel: Settings → Domains → Add → seguir instrucciones DNS.
3. En Resend: Domains → Add Domain → añadir 3 registros DNS → cambiar el `from` en `api/contact.js` de `onboarding@resend.dev` a `noreply@tudominio.com`.
4. Actualizar `canonical` y `og:url` en todas las páginas al dominio nuevo.
5. Actualizar `sitemap.xml` con el dominio nuevo.
6. En Search Console: verificar nuevo dominio.

---

## Cosas que NO se replican (hay que rehacer)

- **Investigación competitiva**: cada ciudad/vertical tiene competidores distintos.
- **Reviews**: nunca copies reviews de otro negocio (ilegal + Google penaliza).
- **Imagen hero**: usa una real del negocio o de stock libre (Unsplash, Pexels).
- **Sabor local de las páginas de barrio**: requiere conocer la zona.
- **FAQ**: revisa que las respuestas siguen siendo verdad para el nuevo negocio (precios, horarios, etc.).

---

## Costes (resumen)

| Concepto | Coste |
|---|---|
| Hosting (Vercel) | 0 € (plan gratis suficiente) |
| Bot Telegram | 0 € |
| Resend (100 emails/día) | 0 € |
| Dominio | ~10 €/año |
| GitHub repo | 0 € |
| Google Search Console, Analytics | 0 € |
| **TOTAL año 1** | **~10 €** |
