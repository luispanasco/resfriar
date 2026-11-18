// Cliente Supabase de solo lectura (anon key + RLS: anon ve solo is_active = true).
// Se usa únicamente del lado del servidor; las páginas se regeneran con ISR.
// Si faltan las env vars, getSupabase() devuelve null y los loaders devuelven
// listas vacías: el sitio compila y muestra estados vacíos en vez de romper.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const IMAGES_BUCKET = "web-images";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!URL || !ANON) return null;
  if (!client) {
    client = createClient(URL, ANON, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

/** Path del bucket público → URL pública. Deja pasar URLs absolutas. */
export function storageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (!URL) return "";
  return `${URL.replace(/\/$/, "")}/storage/v1/object/public/${IMAGES_BUCKET}/${path.replace(/^\//, "")}`;
}
