# Desatascos Urgentes Valencia — Web SEO + Captación de leads

Web estática multi-página para negocio local de desatascos en Valencia, con captación de leads vía formulario que notifica al instante por **Telegram** + email de confirmación al cliente vía **Resend**.

🌐 **Producción:** [desatascos-valencia.vercel.app](https://desatascos-valencia.vercel.app)
📦 **Repo:** [github.com/Freskan23/desatascos-valencia](https://github.com/Freskan23/desatascos-valencia)

---

## ¿Qué hace este proyecto?

1. **Posicionar en Google** búsquedas tipo "desatascos urgentes valencia", "desatascos ruzafa", "cuánto cuesta desatasco valencia", etc.
2. **Convertir** el tráfico orgánico en llamadas y leads cualificados.
3. **Notificar instantáneamente** al comercial en su Telegram cuando alguien rellena el formulario.
4. **Confirmar al cliente** por email automáticamente para que sepa que su solicitud está en marcha.

## Stack

| Capa | Tecnología | Por qué |
|---|---|---|
| Frontend | HTML + CSS + JS vanilla (sin framework) | Carga ultra rápida (LCP <1s), cero build, fácil de iterar |
| Hosting | Vercel (plan gratis) | CDN global, deploy en cada push, HTTPS automático |
| Backend mínimo | Vercel Serverless Functions (Node) | Solo para el endpoint del formulario, no necesitamos servidor |
| Notificación interna | Bot de Telegram | Push instantáneo al móvil del comercial, gratis, sin coste de SMTP |
| Email transaccional | Resend (plan gratis 100/día) | API moderna, integración nativa con Vercel |

## Estructura

```
.
├── index.html                  # Home: hero, servicios, proceso, precios, FAQ, reviews, contacto
├── servicios/                  # 6 páginas de servicio (1 por tipo de atasco)
├── barrios/                    # 6 páginas de barrio de Valencia
├── blog/                       # Blog index + 2 artículos long-form
├── api/
│   └── contact.js              # Serverless function: form → Telegram + Resend
├── assets/                     # Imágenes (hero, logos)
├── sitemap.xml                 # 15 URLs para Google Search Console
├── robots.txt
├── README.md                   # Este archivo
├── CHANGELOG.md                # Historial de iteraciones
└── docs/
    ├── PLAYBOOK.md             # Cómo replicar este proyecto para otro negocio
    ├── ARCHITECTURE.md         # Decisiones técnicas
    └── SEO-CHECKLIST.md        # Factores SEO implementados
```

## Variables de entorno

Configuradas en **Vercel → Settings → Environment Variables**, nunca en código:

| Variable | Para qué |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Token del bot (de @BotFather) |
| `TELEGRAM_CHAT_ID` | ID del chat destino (de @userinfobot) |
| `RESEND_API_KEY` | API key de Resend para emails de confirmación |

## Quick start (desarrollador)

```bash
git clone https://github.com/Freskan23/desatascos-valencia.git
cd desatascos-valencia
# Abrir index.html directamente en el navegador para ver el frontend
# Para probar /api/contact en local:
npm i -g vercel
vercel dev
```

## Deploy

Automático con cada `git push` a `main` si conectas el repo en Vercel dashboard. O manual:

```bash
vercel --prod
```

## Iterar

Cada cambio significativo → entrada en [CHANGELOG.md](CHANGELOG.md) con fecha + descripción.
Para clonar este proyecto a otro negocio (otra ciudad u otro vertical) → leer [docs/PLAYBOOK.md](docs/PLAYBOOK.md).

---

**Autor:** Eduardo Laborda (Freskan23) — [YinyangSEO Academy](https://github.com/Freskan23/clase-1-agentes-ia-webs)
**Construido con:** Claude Code (Sonnet 4.6) como asistente IA
