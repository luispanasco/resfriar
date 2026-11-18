/** Página de compra en la tienda de Nami para un código vendible. */
export function buyUrl(code: string): string {
  return `https://www.clima.nami.com.uy/productos/${encodeURIComponent(code)}`;
}

export const STORE_URL = "https://www.clima.nami.com.uy";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** URL pública del sitio, incluida la ruta base (ej. https://launchuruguay.com.uy/resfriar). */
export const SITE_URL = ((process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000") + BASE_PATH).replace(/\/$/, "");
