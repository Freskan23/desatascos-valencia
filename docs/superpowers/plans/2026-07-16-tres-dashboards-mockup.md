# Tres Dashboards Mockup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir 3 páginas mock (dueño / SEO / comercial) con datos de ejemplo, tema claro, reusando y ampliando los componentes de gráfica creados hoy — cero backend, cero auth nueva.

**Architecture:** Componentes Astro server-rendered (sin cliente framework), estilo scoped por componente, mismo patrón que `TrendChart`/`RankingBars`/`ClicksBreakdown`/`SectionFunnel` ya existentes. Datos hardcodeados en el frontmatter de cada página. Sin test framework en el repo (`package.json` no define `test`) — la verificación es visual: renderizar en el preview del navegador y comprobar contenido/estructura con `get_page_text` / `read_page`, siguiendo el mismo método usado hoy para las 4 gráficas iniciales.

**Tech Stack:** Astro 7 (SSR, `prerender = false`), CSS vainilla con custom properties (`--brand`, `--accent`, `--ink`, etc. ya definidas en `Dashboard.astro`), sin librerías de gráficos.

---

## Notas para quien ejecute este plan

- No hay `git commit` por paso: el repo tiene la norma de no commitear salvo petición explícita del usuario. Al final del plan hay un único paso opcional de commit — solo ejecutarlo si el usuario lo pide en ese momento.
- No hay pasos de test automatizado (no hay test runner en el repo). Cada tarea termina con un paso de verificación visual vía el Browser pane (`preview_start` con la config `pillaleads` de `.claude/launch.json`, puerto 4321).
- Las páginas nuevas van fuera de `/dashboard` (sin prefijo, ej. `/preview-dashboard-dueno`) para no quedar detrás del middleware de auth (`src/middleware.ts` solo gatea `path.startsWith('/dashboard')`). **Nunca nombrarlas con `_` inicial** — Astro excluye del routing cualquier archivo/carpeta que empiece por `_` (aprendido hoy: `_preview-dashboard.astro` daba 404).
- Paleta: brand `#1e6fc8`, accent `#22b14c`, tercer color funcional `#eb6834` (naranja aviso) — validados CVD-safe hoy con `scripts/validate_palette.js` del skill `dataviz`. No introducir colores nuevos sin razón.

---

### Task 1: Generalizar `TrendChart` para reusarlo con unidades distintas (€ en vez de visitas)

**Files:**
- Modify: `src/components/dashboard/TrendChart.astro`

- [ ] **Step 1: Añadir prop `unit` opcional (default `'visitas'`) y usarla en el tooltip y en el label del punto final**

Reemplazar el bloque de `Props`/desestructuración y el script de tooltip:

```astro
---
interface Props {
  title: string;
  data: { label: string; value: number }[];
  unit?: string;
}
const { title, data, unit = 'visitas' } = Astro.props;
```

Y en el `<script>` del final del archivo, cambiar la línea del tooltip:

```ts
tooltip.textContent = `${label} · ${value} ${hit.dataset.unit}`;
```

Para que esto funcione, el `data-unit` debe viajar en el `<rect class="hit">`. Añadir el atributo `data-unit={unit}` junto a `data-x`/`data-label`/`data-value` en la sección `{points.map(...)}` del template.

- [ ] **Step 2: Verificar que el resto de props (`data-x`, `data-label`, `data-value`) siguen igual y que el componente compila**

Run: no hay build step aislado — se verifica en Task 8/9 cuando la página que lo usa renderiza. Revisar visualmente el diff del archivo antes de continuar (no debe cambiar nada más que lo de arriba).

---

### Task 2: `StatTile.astro` — KPI con delta

**Files:**
- Create: `src/components/dashboard/StatTile.astro`

- [ ] **Step 1: Crear el componente**

```astro
---
interface Props {
  label: string;
  value: string;
  delta?: { text: string; good: boolean };
}
const { label, value, delta } = Astro.props;
---
<div class="stat-tile">
  <span class="stat-value">{value}</span>
  <span class="stat-label">{label}</span>
  {delta && (
    <span class={`stat-delta ${delta.good ? 'up' : 'down'}`}>
      {delta.good ? '▲' : '▼'} {delta.text}
    </span>
  )}
</div>
<style>
  .stat-tile{background:#fff;border:1px solid var(--border,#e2e8f0);border-radius:14px;padding:20px;text-align:center;}
  .stat-value{display:block;font-size:30px;font-weight:800;color:var(--brand,#1e6fc8);letter-spacing:-1px;}
  .stat-label{font-size:12px;color:var(--ink-muted,#64748b);margin-top:4px;display:block;}
  .stat-delta{display:inline-block;margin-top:8px;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;}
  .stat-delta.up{color:#0ca30c;background:rgba(12,163,12,.1);}
  .stat-delta.down{color:#d03b3b;background:rgba(208,59,59,.1);}
</style>
```

- [ ] **Step 2: Verificación visual**

Se verifica junto con Task 8 (primera página que lo consume). No requiere paso aislado.

---

### Task 3: `OrdinalFunnel.astro` — embudo con ramp de un solo hue

**Files:**
- Create: `src/components/dashboard/OrdinalFunnel.astro`

- [ ] **Step 1: Crear el componente**

Usa 6 pasos de la ordinal ramp azul (`references/palette.md` del skill `dataviz`, adaptada al brand `#1e6fc8`): del más claro al más oscuro, nunca por debajo del step "250" ni por encima del "600" para mantener contraste legible sobre blanco.

```astro
---
interface Props {
  title: string;
  stages: { label: string; value: string; sublabel?: string }[];
}
const { title, stages } = Astro.props;
const ramp = ['#9ec5f4', '#5598e7', '#2a78d6', '#1c5cab', '#184f95', '#0d366b'];
---
<div class="chart-card">
  <div class="chart-head">
    <h3>{title}</h3>
    <span class="chart-caption">datos de ejemplo</span>
  </div>
  <div class="funnel">
    {stages.map((s, i) => (
      <div class="stage" style={`background:${ramp[Math.min(i, ramp.length - 1)]}`}>
        <span class="stage-value">{s.value}</span>
        <span class="stage-label">{s.label}</span>
        {s.sublabel && <span class="stage-sub">{s.sublabel}</span>}
      </div>
    ))}
  </div>
</div>
<style>
  .chart-card{background:var(--surface,#fff);border:1px solid var(--border,#e2e8f0);border-radius:14px;padding:22px;}
  .chart-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px;}
  .chart-head h3{font-size:14px;font-weight:700;color:var(--ink,#0f172a);}
  .chart-caption{font-size:11px;color:var(--ink-muted,#64748b);}
  .funnel{display:flex;flex-direction:column;gap:2px;}
  .stage{color:#fff;padding:10px 16px;border-radius:8px;display:flex;align-items:baseline;gap:10px;}
  .stage-value{font-size:18px;font-weight:800;font-variant-numeric:tabular-nums;}
  .stage-label{font-size:12.5px;font-weight:600;}
  .stage-sub{font-size:11px;opacity:.8;margin-left:auto;}
</style>
```

- [ ] **Step 2: Verificación visual** — junto con Task 8.

---

### Task 4: `PipelineKanban.astro` — columnas estáticas con contador

**Files:**
- Create: `src/components/dashboard/PipelineKanban.astro`

- [ ] **Step 1: Crear el componente**

```astro
---
interface Props {
  columns: { label: string; count: number; accent?: string }[];
}
const { columns } = Astro.props;
---
<div class="kanban">
  {columns.map((c) => (
    <div class="col">
      <div class="col-head">
        <span class="col-label">{c.label}</span>
        <span class="col-count" style={c.accent ? `background:${c.accent}` : ''}>{c.count}</span>
      </div>
    </div>
  ))}
</div>
<style>
  .kanban{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;}
  .col{background:var(--surface-alt,#f8fafc);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:16px;}
  .col-head{display:flex;flex-direction:column;gap:6px;}
  .col-label{font-size:12px;color:var(--ink-muted,#64748b);font-weight:600;}
  .col-count{font-size:24px;font-weight:800;color:var(--ink,#0f172a);}
  @media(max-width:900px){.kanban{grid-template-columns:repeat(3,1fr);}}
  @media(max-width:520px){.kanban{grid-template-columns:repeat(2,1fr);}}
</style>
```

- [ ] **Step 2: Verificación visual** — junto con Task 10.

---

### Task 5: `LeadsTable.astro` — tabla con pills de estado

**Files:**
- Create: `src/components/dashboard/LeadsTable.astro`

- [ ] **Step 1: Crear el componente**

Paleta de status reservada (nunca reusada para otra cosa): bueno `#0ca30c`/fondo `rgba(12,163,12,.1)`, aviso `#b45309`/fondo `#fef3c7`, info `#1e6fc8`/fondo `rgba(30,111,200,.1)`, neutro `#64748b`/fondo `#f1f5f9`.

```astro
---
interface Lead {
  name: string;
  phone: string;
  source: string;
  cta: string;
  status: string;
  statusTone: 'good' | 'warning' | 'info' | 'neutral';
  value: string;
  date: string;
}
interface Props {
  title: string;
  rows: Lead[];
}
const { title, rows } = Astro.props;
const tones: Record<Lead['statusTone'], string> = {
  good: 'color:#0ca30c;background:rgba(12,163,12,.1);',
  warning: 'color:#b45309;background:#fef3c7;',
  info: 'color:#1e6fc8;background:rgba(30,111,200,.1);',
  neutral: 'color:#64748b;background:#f1f5f9;',
};
---
<div class="chart-card">
  <div class="chart-head">
    <h3>{title}</h3>
    <span class="chart-caption">datos de ejemplo</span>
  </div>
  <table>
    <thead>
      <tr><th>Lead</th><th>Fuente</th><th>CTA</th><th>Estado</th><th>Valor</th><th>Fecha</th></tr>
    </thead>
    <tbody>
      {rows.map((r) => (
        <tr>
          <td><strong>{r.name}</strong><br /><span class="muted">{r.phone}</span></td>
          <td>{r.source}</td>
          <td>{r.cta}</td>
          <td><span class="pill" style={tones[r.statusTone]}>{r.status}</span></td>
          <td>{r.value}</td>
          <td class="muted">{r.date}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
<style>
  .chart-card{background:var(--surface,#fff);border:1px solid var(--border,#e2e8f0);border-radius:14px;padding:22px;overflow-x:auto;}
  .chart-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px;}
  .chart-head h3{font-size:14px;font-weight:700;color:var(--ink,#0f172a);}
  .chart-caption{font-size:11px;color:var(--ink-muted,#64748b);}
  table{width:100%;border-collapse:collapse;font-size:13px;}
  th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--ink-muted,#64748b);padding:0 10px 10px;border-bottom:1px solid var(--border,#e2e8f0);}
  td{padding:10px;border-bottom:1px solid #f1f5f9;color:var(--ink,#0f172a);}
  .muted{color:var(--ink-muted,#64748b);font-size:12px;}
  .pill{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11.5px;font-weight:700;}
</style>
```

- [ ] **Step 2: Verificación visual** — junto con Task 10.

---

### Task 6: `LeadDetailPanel.astro` — panel lateral de detalle

**Files:**
- Create: `src/components/dashboard/LeadDetailPanel.astro`

- [ ] **Step 1: Crear el componente**

```astro
---
interface ActivityItem { text: string; date: string; }
interface Props {
  name: string;
  status: string;
  fields: { label: string; value: string }[];
  activity: ActivityItem[];
}
const { name, status, fields, activity } = Astro.props;
---
<div class="panel">
  <div class="panel-head">
    <div>
      <h3>{name}</h3>
      <span class="pill">{status}</span>
    </div>
  </div>
  <dl class="fields">
    {fields.map((f) => (
      <div class="field-row">
        <dt>{f.label}</dt>
        <dd>{f.value}</dd>
      </div>
    ))}
  </dl>
  <div class="activity">
    <h4>Actividad</h4>
    <ul>
      {activity.map((a) => (
        <li>
          <span class="dot"></span>
          <div>
            <p>{a.text}</p>
            <span class="muted">{a.date}</span>
          </div>
        </li>
      ))}
    </ul>
  </div>
</div>
<style>
  .panel{background:var(--surface,#fff);border:1px solid var(--border,#e2e8f0);border-radius:14px;padding:22px;max-width:340px;}
  .panel-head h3{font-size:16px;font-weight:800;color:var(--ink,#0f172a);}
  .pill{display:inline-block;margin-top:6px;padding:3px 10px;border-radius:999px;font-size:11.5px;font-weight:700;color:#b45309;background:#fef3c7;}
  .fields{margin-top:18px;display:flex;flex-direction:column;gap:10px;}
  .field-row{display:flex;justify-content:space-between;font-size:12.5px;border-bottom:1px solid #f1f5f9;padding-bottom:8px;}
  dt{color:var(--ink-muted,#64748b);}
  dd{color:var(--ink,#0f172a);font-weight:600;text-align:right;}
  .activity{margin-top:20px;}
  .activity h4{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--ink-muted,#64748b);margin-bottom:12px;}
  .activity ul{display:flex;flex-direction:column;gap:14px;}
  .activity li{display:flex;gap:10px;}
  .dot{width:8px;height:8px;border-radius:50%;background:var(--brand,#1e6fc8);margin-top:5px;flex-shrink:0;}
  .activity p{font-size:12.5px;color:var(--ink,#0f172a);}
  .muted{font-size:11px;color:var(--ink-muted,#64748b);}
</style>
```

- [ ] **Step 2: Verificación visual** — junto con Task 10.

---

### Task 7: Ampliar el nav de `Dashboard.astro`

**Files:**
- Modify: `src/layouts/Dashboard.astro:7-11`

- [ ] **Step 1: Sustituir el array `nav` actual**

Buscar:

```astro
const nav = [
  { href: '/dashboard', label: 'Métricas', icon: 'M3 13h2v8H3v-8zm4-6h2v14H7V7zm4 3h2v11h-2V10zm4-7h2v18h-2V3zm4 10h2v8h-2v-8z' },
  { href: '/dashboard/leads', label: 'Leads', icon: 'M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z' },
];
```

Reemplazar por (añade SEO, Facturación y Configuración; estas dos últimas quedan sin `href` real todavía — placeholder deshabilitado):

```astro
const nav = [
  { href: '/preview-dashboard-dueno', label: 'Resumen', icon: 'M3 13h2v8H3v-8zm4-6h2v14H7V7zm4 3h2v11h-2V10zm4-7h2v18h-2V3zm4 10h2v8h-2v-8z' },
  { href: '/preview-dashboard-comercial', label: 'Leads', icon: 'M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z' },
  { href: '/preview-dashboard-seo', label: 'SEO', icon: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' },
];
const navSoon = [
  { label: 'Facturación', icon: 'M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2z' },
  { label: 'Configuración', icon: 'M19.14 12.94a7.14 7.14 0 0 0 .06-.94 7.14 7.14 0 0 0-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.3 7.3 0 0 0-1.62-.94L14.4 2.6a.5.5 0 0 0-.5-.4h-3.8a.5.5 0 0 0-.5.4l-.36 2.66c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.14 7.14 0 0 0 0 1.88l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.42.32.6.22l2.39-.96c.49.38 1.03.7 1.62.94l.36 2.66c.05.24.25.4.5.4h3.8c.25 0 .45-.16.5-.4l.36-2.66c.59-.24 1.13-.56 1.62-.94l2.39.96c.24.1.5 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z' },
];
```

- [ ] **Step 2: Renderizar `navSoon` como items deshabilitados debajo del `<nav class="nav">` existente**

Justo después del bloque `{nav.map((n) => (...))}` dentro de `<nav class="nav">`, añadir:

```astro
{navSoon.map((n) => (
  <span class="nav-soon" title="Próximamente">
    <svg viewBox="0 0 24 24"><path d={n.icon} /></svg>{n.label}
  </span>
))}
```

Y añadir el estilo correspondiente junto a `.nav a.active{...}`:

```css
.nav-soon{display:flex;align-items:center;gap:11px;padding:11px 12px;border-radius:10px;color:rgba(255,255,255,.28);font-size:14px;font-weight:500;cursor:not-allowed;}
.nav-soon svg{width:18px;height:18px;fill:currentColor;flex-shrink:0;}
```

- [ ] **Step 3: Verificación visual** — junto con Task 8 (primera página que usa el layout ampliado).

---

### Task 8: Página `/preview-dashboard-dueno`

**Files:**
- Create: `src/pages/preview-dashboard-dueno.astro`
- Delete: `src/pages/preview-dashboard.astro` (contenido superseded por esta página — mismo mock de hoy, ahora con StatTile/delta y el resto del layout ampliado)

- [ ] **Step 1: Borrar la página de preview de hoy**

```bash
rm "src/pages/preview-dashboard.astro"
```

- [ ] **Step 2: Crear la página nueva**

```astro
---
export const prerender = false;
import Dashboard from '@/layouts/Dashboard.astro';
import StatTile from '@/components/dashboard/StatTile.astro';
import OrdinalFunnel from '@/components/dashboard/OrdinalFunnel.astro';
import TrendChart from '@/components/dashboard/TrendChart.astro';
import RankingBars from '@/components/dashboard/RankingBars.astro';

const kpis = [
  { label: 'Leads confirmados', value: '156', delta: { text: '18% vs periodo anterior', good: true } },
  { label: 'Trabajos realizados', value: '68', delta: { text: '15% vs periodo anterior', good: true } },
  { label: 'Facturación', value: '18.560 €', delta: { text: '22% vs periodo anterior', good: true } },
  { label: 'Ticket medio', value: '273 €', delta: { text: '8% vs periodo anterior', good: true } },
];

const funnelStages = [
  { label: 'Visitas', value: '1.248' },
  { label: 'Intenciones de contacto', value: '312', sublabel: 'Clics en teléfono, WhatsApp, formulario' },
  { label: 'Leads confirmados', value: '156', sublabel: 'Contactos efectivos' },
  { label: 'Presupuestos enviados', value: '92' },
  { label: 'Trabajos realizados', value: '68' },
  { label: 'Facturación', value: '18.560 €' },
];

const DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const revenueValues = [980, 1120, 890, 1340, 1580, 1210, 1890, 1640, 1420, 1710, 2050, 1880, 2210, 1990];
const today = new Date();
const revenueData = revenueValues.map((value, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() - (revenueValues.length - 1 - i));
  return { label: DOW[d.getDay()], value };
});

const jobsByService = [
  { label: 'Desatascos urgentes', value: 42 },
  { label: 'Limpieza de tuberías', value: 25 },
  { label: 'Vaciado de fosas', value: 18 },
  { label: 'Inspección con cámara', value: 10 },
  { label: 'Otros', value: 5 },
];
---
<Dashboard title="Resumen del negocio">
  <div class="grid">
    <div class="card welcome">
      <h2>Vista general del negocio</h2>
      <p>Resumen ejecutivo con los datos clave — cifras de ejemplo, se conectan a datos reales en la fase de integración.</p>
    </div>
    <div class="kpis">
      {kpis.map((k) => <StatTile label={k.label} value={k.value} delta={k.delta} />)}
    </div>
    <OrdinalFunnel title="Embudo comercial" stages={funnelStages} />
    <div class="cols-2">
      <TrendChart title="Evolución de la facturación · últimos 14 días" data={revenueData} unit="€" />
      <RankingBars title="Trabajos por servicio" rows={jobsByService} unit="%" />
    </div>
  </div>
  <style>
    .grid{display:flex;flex-direction:column;gap:20px;}
    .card{background:#fff;border:1px solid var(--border,#e2e8f0);border-radius:14px;padding:24px;}
    .welcome h2{font-size:18px;margin-bottom:8px;}
    .welcome p{color:#64748b;font-size:14px;line-height:1.6;}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
    .cols-2{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
    @media(max-width:760px){.kpis{grid-template-columns:repeat(2,1fr);}.cols-2{grid-template-columns:1fr;}}
  </style>
</Dashboard>
```

- [ ] **Step 3: Verificar en el navegador**

1. `preview_start` con `{ name: "pillaleads" }` (reusa si ya está corriendo).
2. `navigate` a `http://localhost:4321/preview-dashboard-dueno`.
3. `get_page_text` y confirmar que aparecen: los 4 KPI con delta (▲18%, etc.), las 6 etapas del embudo con valores, el gráfico de facturación con etiqueta en €, el ranking de servicios.
4. `read_console_messages` con `onlyErrors: true` — debe devolver "No console logs."
5. Si el screenshot vuelve a colgarse (pasó hoy en este entorno), usar `read_page` con `filter: "all"` como respaldo — ya confirmó estructura correcta antes.

---

### Task 9: Página `/preview-dashboard-seo`

**Files:**
- Create: `src/pages/preview-dashboard-seo.astro`

- [ ] **Step 1: Crear la página**

```astro
---
export const prerender = false;
import Dashboard from '@/layouts/Dashboard.astro';
import StatTile from '@/components/dashboard/StatTile.astro';
import TrendChart from '@/components/dashboard/TrendChart.astro';
import RankingBars from '@/components/dashboard/RankingBars.astro';
import ClicksBreakdown from '@/components/dashboard/ClicksBreakdown.astro';

const kpis = [
  { label: 'Visitas totales', value: '1.248', delta: { text: '16% vs periodo anterior', good: true } },
  { label: 'CTR orgánico', value: '6,8%', delta: { text: '0,9 p.p. vs periodo anterior', good: true } },
  { label: 'Posición media', value: '18,7', delta: { text: '1,3 vs periodo anterior', good: false } },
  { label: 'Leads confirmados', value: '156', delta: { text: '18% vs periodo anterior', good: true } },
];

const DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
function buildSeries(values: number[]) {
  const today = new Date();
  return values.map((value, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (values.length - 1 - i));
    return { label: DOW[d.getDay()], value };
  });
}
const organicVisits = buildSeries([420, 460, 390, 510, 580, 500, 640, 600, 560, 590, 690, 650, 720, 690]);
const confirmedLeads = buildSeries([8, 10, 7, 11, 13, 9, 15, 14, 12, 13, 16, 15, 17, 16]);

const trafficSources = [
  { label: 'Orgánico', value: 62 },
  { label: 'Directo', value: 18 },
  { label: 'Referral', value: 9 },
  { label: 'Social', value: 7 },
  { label: 'Paid', value: 4 },
];

const ctaConversions = [
  { label: 'WhatsApp', value: 128, color: 'var(--accent,#22b14c)' },
  { label: 'Teléfono', value: 112, color: 'var(--brand,#1e6fc8)' },
  { label: 'Formulario', value: 48, color: '#eb6834' },
];

const landingPages = [
  { page: '/desatascos-urgentes', leads: 46, conv: '6,3%' },
  { page: '/desatascos-urgentes-madrid', leads: 38, conv: '5,7%' },
  { page: '/limpieza-de-tuberias', leads: 28, conv: '5,1%' },
  { page: '/vaciado-de-fosas', leads: 22, conv: '4,8%' },
  { page: '/inspeccion-con-camara', leads: 18, conv: '4,2%' },
];
---
<Dashboard title="SEO — Rendimiento y adquisición">
  <div class="grid">
    <div class="card welcome">
      <h2>Rendimiento web y calidad de los leads</h2>
      <p>Cifras de ejemplo — se conectan a Search Console / GA4 en la fase de integración.</p>
    </div>
    <div class="kpis">
      {kpis.map((k) => <StatTile label={k.label} value={k.value} delta={k.delta} />)}
    </div>
    <div class="cols-2">
      <TrendChart title="Visitas orgánicas · últimos 14 días" data={organicVisits} />
      <TrendChart title="Leads confirmados · últimos 14 días" data={confirmedLeads} unit="leads" />
    </div>
    <div class="cols-3">
      <RankingBars title="Fuentes de tráfico" rows={trafficSources} unit="%" />
      <ClicksBreakdown title="Conversiones por CTA (intenciones)" rows={ctaConversions} />
      <div class="chart-card">
        <div class="chart-head"><h3>Leads por página de destino</h3><span class="chart-caption">datos de ejemplo</span></div>
        <table class="pages-table">
          <thead><tr><th>Página</th><th>Leads</th><th>% Conv.</th></tr></thead>
          <tbody>
            {landingPages.map((p) => (
              <tr><td>{p.page}</td><td>{p.leads}</td><td>{p.conv}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <style>
    .grid{display:flex;flex-direction:column;gap:20px;}
    .card{background:#fff;border:1px solid var(--border,#e2e8f0);border-radius:14px;padding:24px;}
    .welcome h2{font-size:18px;margin-bottom:8px;}
    .welcome p{color:#64748b;font-size:14px;line-height:1.6;}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
    .cols-2{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
    .cols-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;}
    .chart-card{background:#fff;border:1px solid var(--border,#e2e8f0);border-radius:14px;padding:22px;}
    .chart-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px;}
    .chart-head h3{font-size:14px;font-weight:700;color:var(--ink,#0f172a);}
    .chart-caption{font-size:11px;color:var(--ink-muted,#64748b);}
    .pages-table{width:100%;border-collapse:collapse;font-size:12.5px;}
    .pages-table th{text-align:left;font-size:10.5px;text-transform:uppercase;color:var(--ink-muted,#64748b);padding:0 6px 8px;border-bottom:1px solid var(--border,#e2e8f0);}
    .pages-table td{padding:8px 6px;border-bottom:1px solid #f1f5f9;color:var(--ink,#0f172a);}
    @media(max-width:900px){.kpis{grid-template-columns:repeat(2,1fr);}.cols-2,.cols-3{grid-template-columns:1fr;}}
  </style>
</Dashboard>
```

- [ ] **Step 2: Verificar en el navegador**

1. `navigate` a `http://localhost:4321/preview-dashboard-seo`.
2. `get_page_text` — confirmar 4 KPIs, 2 TrendChart (uno etiquetado "leads" en vez de "visitas" en el tooltip — pasar el mouse para comprobar o inspeccionar el `data-unit` con `read_page`), ranking de fuentes, breakdown de CTA, tabla de páginas con 5 filas.
3. `read_console_messages` con `onlyErrors: true`.

---

### Task 10: Página `/preview-dashboard-comercial`

**Files:**
- Create: `src/pages/preview-dashboard-comercial.astro`

- [ ] **Step 1: Crear la página**

```astro
---
export const prerender = false;
import Dashboard from '@/layouts/Dashboard.astro';
import StatTile from '@/components/dashboard/StatTile.astro';
import PipelineKanban from '@/components/dashboard/PipelineKanban.astro';
import LeadsTable from '@/components/dashboard/LeadsTable.astro';
import LeadDetailPanel from '@/components/dashboard/LeadDetailPanel.astro';

const kpis = [
  { label: 'Leads nuevos', value: '24' },
  { label: 'En atención', value: '18' },
  { label: 'Presupuesto enviado', value: '16' },
  { label: 'Trabajo realizado', value: '12' },
  { label: 'Facturado', value: '9' },
];

const columns = [
  { label: 'Nuevo', count: 24 },
  { label: 'En atención', count: 18 },
  { label: 'Presupuesto enviado', count: 16 },
  { label: 'Presupuesto aceptado', count: 14 },
  { label: 'Trabajo realizado', count: 12 },
  { label: 'Facturado', count: 9 },
];

const leads = [
  { name: 'Laura Martín', phone: '612 345 678', source: '/desatascos-urgentes-madrid', cta: 'WhatsApp', status: 'En atención', statusTone: 'warning' as const, value: '180 €', date: '20/05 10:23' },
  { name: 'Carlos Gómez', phone: '722 123 456', source: '/limpieza-de-tuberias', cta: 'Teléfono', status: 'Presupuesto enviado', statusTone: 'info' as const, value: '350 €', date: '20/05 09:15' },
  { name: 'Ana López', phone: 'Formulario web', source: '/desatascos-urgentes', cta: 'Formulario', status: 'Trabajo realizado', statusTone: 'good' as const, value: '275 €', date: '19/05 16:40' },
  { name: 'Miguel Pérez', phone: '608 987 654', source: '/vaciado-de-fosas', cta: 'WhatsApp', status: 'Facturado', statusTone: 'good' as const, value: '450 €', date: '19/05 14:22' },
  { name: 'Sofía Ruiz', phone: 'Formulario web', source: '/inspeccion-con-camara', cta: 'Chatbot', status: 'Nuevo', statusTone: 'neutral' as const, value: '—', date: '19/05 11:05' },
];

const leadDetail = {
  name: 'Laura Martín',
  status: 'En atención',
  fields: [
    { label: 'Teléfono', value: '612 345 678' },
    { label: 'Email', value: 'laura.martin@email.com' },
    { label: 'Servicio', value: 'Desatascos urgentes' },
    { label: 'Localidad', value: 'Madrid' },
    { label: 'Fuente', value: 'Google orgánico' },
    { label: 'Página', value: '/desatascos-urgentes-madrid' },
    { label: 'CTA', value: 'WhatsApp' },
    { label: 'Creado', value: '20/05/2024 10:23' },
  ],
  activity: [
    { text: 'Lead creado', date: '20/05/2024 10:23' },
    { text: 'WhatsApp clicado', date: '20/05/2024 10:23' },
    { text: 'Conversación iniciada', date: '20/05/2024 10:25' },
    { text: 'En atención', date: '20/05/2024 11:02' },
  ],
};
---
<Dashboard title="Seguimiento comercial">
  <div class="grid">
    <div class="card welcome">
      <h2>De lead a facturación</h2>
      <p>Sigue cada lead en su proceso comercial hasta la facturación — datos de ejemplo.</p>
    </div>
    <div class="kpis">
      {kpis.map((k) => <StatTile label={k.label} value={k.value} />)}
    </div>
    <PipelineKanban columns={columns} />
    <div class="cols-detail">
      <LeadsTable title="Leads" rows={leads} />
      <LeadDetailPanel name={leadDetail.name} status={leadDetail.status} fields={leadDetail.fields} activity={leadDetail.activity} />
    </div>
  </div>
  <style>
    .grid{display:flex;flex-direction:column;gap:20px;}
    .card{background:#fff;border:1px solid var(--border,#e2e8f0);border-radius:14px;padding:24px;}
    .welcome h2{font-size:18px;margin-bottom:8px;}
    .welcome p{color:#64748b;font-size:14px;line-height:1.6;}
    .kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;}
    .cols-detail{display:grid;grid-template-columns:1fr 340px;gap:20px;align-items:start;}
    @media(max-width:900px){.kpis{grid-template-columns:repeat(2,1fr);}.cols-detail{grid-template-columns:1fr;}}
  </style>
</Dashboard>
```

- [ ] **Step 2: Verificar en el navegador**

1. `navigate` a `http://localhost:4321/preview-dashboard-comercial`.
2. `get_page_text` — confirmar 5 KPIs, 6 columnas del kanban con sus contadores, tabla con 5 leads y pills de estado, panel de detalle de Laura Martín con 8 campos y 4 eventos de actividad.
3. `read_console_messages` con `onlyErrors: true`.

---

### Task 11: Verificación final cruzada y limpieza

**Files:** (ninguno nuevo — solo revisión)

- [ ] **Step 1: Confirmar que las 3 páginas comparten sidebar ampliado**

En cada una de las 3 páginas, `read_page` debe mostrar los links "Resumen", "Leads", "SEO" en la barra lateral, más "Facturación" y "Configuración" como `nav-soon` (no clicables).

- [ ] **Step 2: Confirmar consistencia de cifras entre pantallas**

"Leads confirmados: 156" debe coincidir en dueño y en los KPIs de seguimiento comercial (suma de columnas del kanban salvo "Nuevo": 18+16+14+12+9 no tiene que cuadrar exactamente a 156 — son leads acumulados de periodos distintos, está bien que no cuadre céntimo a céntimo, es data de ejemplo).

- [ ] **Step 3: `git status` para ver el diff completo**

```bash
git status --short
```

Debe listar: 6 componentes nuevos en `src/components/dashboard/`, 3 páginas nuevas en `src/pages/`, `TrendChart.astro` y `Dashboard.astro` modificados, `preview-dashboard.astro` borrado, el spec y este plan en `docs/superpowers/`.

- [ ] **Step 4 (opcional, solo si el usuario lo pide en este punto): commit**

```bash
git add src/components/dashboard src/pages/preview-dashboard-dueno.astro src/pages/preview-dashboard-seo.astro src/pages/preview-dashboard-comercial.astro src/layouts/Dashboard.astro docs/superpowers
git commit -m "Mockup de 3 dashboards (dueño/SEO/comercial) con datos de ejemplo"
```
