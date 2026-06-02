# Cuestas Studio — Sitio web

Sitio estático (HTML/CSS/JS, sin build) de Cuestas Studio. Cada página es un `.html`
plano y editable a mano. Se sirve en Vercel con URLs limpias (`vercel.json` → `cleanUrls`).

## Estructura

- `index.html` — home (servicios, sectores, proceso, precios, FAQ)
- Landings por sector:
  - `diseno-web-restaurantes-uruguay.html`
  - `diseno-web-clinicas-uruguay.html`
  - `diseno-web-estudios-juridicos-uruguay.html`
  - `diseno-web-inmobiliarias-uruguay.html`
- `precios.html` — planes y precio de entrada (desde USD 289)
- `servicios.html` — hub: web (hoy) + consultoría, estrategia, internacionalización (horizonte)
- `consultoria-de-negocios.html`, `estrategia-comercial.html`, `internacionalizacion.html`
- `contacto.html` — datos de contacto (NAP) y CTAs
- `blog.html` + `blog/*.html` — artículos
- `css/` — `styles.css` (tokens y sistema) + `sections.css` (secciones y componentes)
- `js/app.js` — interacciones (Lenis, reveals, transiciones de bloque, menú mobile, contadores)
- `assets/` — logo CS, retrato, favicons y `og-cover.png` (imagen para compartir en redes)
- `robots.txt`, `sitemap.xml` — SEO técnico
- `vercel.json` — URLs limpias y cabeceras de caché

## SEO

Cada página incluye: `<title>` y meta description propios, canonical, Open Graph + Twitter Card,
y datos estructurados JSON-LD (Organization/LocalBusiness, Person, Service, BreadcrumbList,
FAQPage y BlogPosting según corresponda). El sitemap referencia todas las URLs indexables.

Pendiente del lado del dueño: Google Analytics 4 (descomentar el bloque en `index.html` con el
Measurement ID) y crear/verificar el Google Business Profile.

## Despliegue

Auto-deploy desde este repositorio en Vercel (push a `main` publica a producción).
URL de producción: https://cuestasstudio.com
