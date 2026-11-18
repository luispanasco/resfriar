# Resfriar Uruguay — sitio web

Catálogo público de productos Resfriar (climatizadores evaporativos, aires acondicionados de techo 12/24 V y heladeras). Nami es el **distribuidor oficial y exclusivo de Resfriar en Uruguay**. Sin precios: la compra se hace en la tienda de Nami.

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, `@supabase/supabase-js`.

Alcance de la v1: equipos completos de Resfriar (sin repuestos ni generadores).

## Cómo correrlo

```bash
cp .env.example .env.local   # completar las variables
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # producción
npm run lint
```

Si `npm run dev` no levanta, revisá que no haya otro `next dev` corriendo sobre esta carpeta: Next 16 no deja abrir dos a la vez.

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (el mismo que usa newLaunchWeb). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key. **Nunca** la service_role. RLS deja leer solo filas `is_active = true`. |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (metadataBase, sitemap, robots). Opcional; por defecto `http://localhost:3000`. Pendiente: dominio. |

Si faltan las de Supabase, el sitio compila igual y muestra estados vacíos.

## Datos (solo lectura)

El sitio solo lee. El que escribe es el hub (`newHub/hub-nami`).

- `rf_category` — slug, title, short_description, order, seo.
- `rf_family` — **la ficha que se publica** (ej. "Climatizador Serie 8 Inspire · moldura universal"): category_slug, title, series, factory_ref, descripciones, `highlights`/`specs` (jsonb `[{label, value}]`), `compatibility` (text[]), `images` (paths del bucket `web-images`), `documents` (jsonb `[{title, path}]`), `is_featured`, order, seo.
- `rf_variant` — **los códigos que se venden** (de `na_cl`): product_code, family_slug, label, voltage, order. Ej. `XR800R8UN12` y `XR800R8UN24` dentro de la misma ficha.

Todo se ordena por `order` y después título/label. Las URLs públicas de imágenes y PDFs son
`${SUPABASE_URL}/storage/v1/object/public/web-images/${path}` (`lib/supabase.ts`).
La normalización de nulls y jsonb está en `lib/data.ts`. Las páginas usan ISR con `revalidate = 60`: los cambios en Supabase aparecen en menos de un minuto.

### De dónde sale cada dato

| Dato | Fuente |
| --- | --- |
| Código y nombre | `na_cl` (base del ERP, mismo servidor que `na_he`) |
| Descripción | `na_cl` (en español); si no tiene, resfriar.com.br |
| Cifras, ficha técnica | resfriar.com.br (la referencia de fábrica, ej. `800R8`, coincide con nuestro código `XR800R8…`) |
| Fotos y PDF | Carpeta local `C:\Users\Luisito\Documents\Resfriar-Uruguay\{código}\` (fotos de resfriar.com.br, revisadas a mano). Las de S3 no se usan. |
| Link de compra | Se deriva del código (ver abajo) |

### Cómo se editan

**Desde el hub:** Admin → Web → **Web Resfriar** (`/resfriar-web`). La base es la fuente de verdad y los cambios aparecen en el sitio en menos de un minuto (ISR de 60 s), sin volver a publicar.

- Lista por categoría: publicar/ocultar, destacar (hero), reordenar, "Ver en la web", buscar por título o código, crear ficha nueva (nace oculta).
- Ficha: textos, cifras, ficha técnica, compatibilidad, fotos (la primera es la portada), PDFs y códigos (validados contra `na_cl`; no se repiten entre fichas).

**Carga inicial / restaurar** (desde `newHub/hub-nami`):

```bash
npx tsx scripts/resfriar/load-resfriar-web.mts --dry-run                 # qué crearía, pisaría o saltearía
npx tsx scripts/resfriar/load-resfriar-web.mts                           # solo crea lo que falta
npx tsx scripts/resfriar/load-resfriar-web.mts --overwrite --only=slug   # restaura esa ficha desde families.json (pisa lo editado en el hub)
```

- `families.json` + la carpeta local de fotos fueron la carga inicial; hoy solo sirven para crear fichas faltantes o restaurar con `--overwrite`.
- Esquema SQL: `hub-nami/prisma/web/alter_resfriar.sql` (con su RLS). Detalle en la bitácora y el CLAUDE.md del hub.

## Marca

- Colores (de resfriar.com.br): azul `#0094E6` (logo), azul profundo `#1E73BE` (botones/links), pizarra `#3C505A` (texto), noche `#000D1F` (fondos oscuros), menta `#5EFFC5` (acento), niebla `#F2F2F2`. Definidos como tokens en `app/globals.css`.
- Tipografías: Saira (títulos) y Montserrat (texto), en lugar de Magistral y Gotham, que son pagas.
- Logo oficial de Resfriar en `components/ResfriarLogo.tsx` (SVG con texto claro, va sobre fondo oscuro), usado en header y footer con "Uruguay" al lado (`components/Wordmark.tsx`).
- Favicon (`app/icon.svg`): solo el símbolo azul sobre fondo noche (el logo completo no se lee a 16 px).

## Rutas

- `/` — inicio:
  - **Hero rotativo** (`components/HeroCarousel.tsx`) con las familias destacadas (`is_featured`), intercaladas por categoría: 1º aire, 1º climatizador, 1º heladera, 2º aire… Cada diapositiva muestra categoría, título, serie, descripción corta, hasta 3 cifras, foto y botón **Ver más** a la ficha. Avanza sola cada 7 s; se pausa con el mouse encima, con el foco adentro, con el botón Pausar o si el usuario pidió reducir el movimiento. Flechas, puntos y teclado (← →). Una categoría sin destacados aporta su primera familia con foto. Orden de categorías en `HERO_CATEGORY_ORDER` (`app/page.tsx`).
  - Franja "¿No sabés cuál te sirve?" que lleva al buscador.
  - Categorías con cantidad de modelos, destacados y "Cómo comprar".
- Tarjetas de familia (`components/FamilyCard.tsx`, en categorías y destacados del inicio): las primeras 4 fotos van pasando solas cada 3,5 s (cada tarjeta desfasada, se frena con el mouse encima o con movimiento reducido), con puntitos de posición. Muestran serie, título, descripción corta (2 líneas), 2 cifras, voltajes y compatibilidad.
- `/[categoria]` — grilla de familias con filtros por compatibilidad y voltaje (solo si hay más de un valor). **Universal** es un filtro más (va primero) y además las familias universales aparecen en el filtro de cualquier vehículo, **debajo** de las específicas de ese vehículo (ej. MAN: primero las de MAN, después las universales).
- `/buscador` — **buscador guiado** (`components/ProductFinder.tsx`). Arma una frase con las respuestas ("Busco **un climatizador** para **Scania NTG** de **24 V**"); tocar una palabra vuelve a ese paso.
  1. ¿Qué buscás? — categoría.
  2. ¿Para qué vehículo? — sale de las compatibilidades de esa categoría, más "Otro / no está en la lista" (muestra universales y portátiles).
  3. ¿De qué voltaje? — 24 V primero y recomendado ("la mayoría de los camiones"), 12 V, o "No sé" (todos). Se saltea si los equipos posibles tienen un solo voltaje (ej. heladeras).
  4. Resultado — primero "Para {vehículo}", después "También te sirven" (universales/portátiles). Cada equipo muestra solo los códigos del voltaje elegido, con su botón **Comprar**, y link a la ficha.

  Las respuestas viajan en la URL (`?que=climatizadores&vehiculo=Scania%20NTG&voltaje=24%20V`), así que el resultado se puede compartir. Mejora posible: una pregunta extra (año o techo alto/bajo) cuando un vehículo tiene varias opciones.
- `/producto/[slug]` — ficha: galería, destacados, versiones con botón Comprar, descripción, especificaciones, compatibilidad, documentos.
- `/go/[code]` — redirección 307 a la ficha de la familia de ese código (para QR). 404 si no existe. Sin distinguir mayúsculas.

- `/contacto` — los 2 locales (Centro y Bulevar) con dirección, "Cómo llegar" y sus vendedores, cada uno con su WhatsApp; email y WhatsApp general.

## Header y contactos

- Header: logo, **WhatsApp** y **Encontrá tu equipo**; abajo, la **barra de categorías** (Climatizadores, Aire acondicionado, Heladeras) con la sección actual marcada, y **Contacto**. Las categorías ya no están como sección en el inicio.
- Contactos en `lib/contacts.ts` (datos propios del sitio, no se leen de otra web): email `ventas@nami.com.uy`, WhatsApp general (Carlos Romero, `099 617 694`), locales con vendedores y redes de Nami (Instagram `@namiuruguay`, Facebook, YouTube). **No hay soporte técnico aparte**: las consultas técnicas van a los vendedores.
- Cada ficha tiene "¿Tenés dudas o una consulta técnica? Escribile a un vendedor", con WhatsApp y el nombre del producto ya escrito en el mensaje.
- El footer muestra productos, los 2 locales y contacto.

## Link de compra

Cada `rf_variant.product_code` enlaza a (ver `lib/links.ts`):

```
https://www.clima.nami.com.uy/productos/{encodeURIComponent(product_code)}
```

## Pendiente

- Dominio propio: conectarlo en Vercel (Settings → Domains) y actualizar `NEXT_PUBLIC_SITE_URL`. Hoy: https://resfriar-five.vercel.app (repo github.com/luispanasco/resfriar, se publica solo al subir a main).
