import { NextResponse, type NextRequest } from "next/server";
import { getFamilySlugForCode } from "@/lib/data";
import { BASE_PATH } from "@/lib/links";

/**
 * /go/{código} → ficha de la familia de ese código (para QR impresos).
 * Route handler y no página: así devuelve un 307 real, sin renderizar HTML.
 * 307 y no permanente: un código puede cambiar de familia.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const slug = await getFamilySlugForCode(safeDecode(code));

  if (!slug) {
    const html = `<!doctype html><html lang="es-UY"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Código no encontrado | Resfriar Uruguay</title><body style="font-family:system-ui,sans-serif;color:#3c505a;max-width:32rem;margin:4rem auto;padding:0 1rem"><h1 style="color:#000d1f">Código no encontrado</h1><p>No encontramos un producto con el código <strong>${escapeHtml(code)}</strong>.</p><p><a href="${BASE_PATH}/" style="color:#1e73be">Ver el catálogo de Resfriar Uruguay</a></p></body></html>`;
    return new NextResponse(html, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" },
    });
  }

  const res = NextResponse.redirect(new URL(`${BASE_PATH}/producto/${slug}`, request.url), 307);
  res.headers.set("X-Robots-Tag", "noindex");
  return res;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
