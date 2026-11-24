// Loaders del catálogo (tablas rf_*). Todo se normaliza acá para que las
// páginas no tengan que defenderse de nulls ni de jsonb mal formado.

import { cache } from "react";
import { getSupabase, storageUrl } from "./supabase";

export type Pair = { label: string; value: string };
export type Doc = { title: string; url: string };

export type Category = {
  slug: string;
  title: string;
  shortDescription: string;
  seoTitle: string;
  seoDescription: string;
};

export type Variant = {
  code: string;
  familySlug: string;
  label: string;
  voltage: string | null;
};

export type Family = {
  slug: string;
  categorySlug: string;
  title: string;
  series: string | null;
  factoryRef: string | null;
  shortDescription: string;
  description: string;
  highlights: Pair[];
  specs: Pair[];
  compatibility: string[];
  images: string[]; // URLs públicas
  documents: Doc[];
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
};

// --- normalizadores ----------------------------------------------------------

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim());
const strOrNull = (v: unknown): string | null => str(v) || null;

function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.map(str).filter(Boolean) : [];
}

function pairs(v: unknown): Pair[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((p) => ({ label: str(p?.label), value: str(p?.value) }))
    .filter((p) => p.label && p.value);
}

function docs(v: unknown): Doc[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((d) => ({ title: str(d?.title) || "Documento", url: storageUrl(str(d?.path)) }))
    .filter((d) => d.url);
}

function seo(v: unknown): { title: string; description: string } {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return { title: str(o.title), description: str(o.description) };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapCategory(r: any): Category {
  const s = seo(r.seo);
  return {
    slug: r.slug,
    title: str(r.title) || r.slug,
    shortDescription: str(r.short_description),
    seoTitle: s.title,
    seoDescription: s.description,
  };
}

function mapFamily(r: any): Family {
  const s = seo(r.seo);
  return {
    slug: r.slug,
    categorySlug: r.category_slug,
    title: str(r.title) || r.slug,
    series: strOrNull(r.series),
    factoryRef: strOrNull(r.factory_ref),
    shortDescription: str(r.short_description),
    description: str(r.description),
    highlights: pairs(r.highlights),
    specs: pairs(r.specs),
    compatibility: strList(r.compatibility),
    images: strList(r.images).map(storageUrl).filter(Boolean),
    documents: docs(r.documents),
    isFeatured: r.is_featured === true,
    seoTitle: s.title,
    seoDescription: s.description,
  };
}

function mapVariant(r: any): Variant {
  return {
    code: str(r.product_code),
    familySlug: r.family_slug,
    label: str(r.label),
    voltage: strOrNull(r.voltage),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Si Supabase falla (caído, sin cuota…) se LANZA en vez de devolver vacío: con
 * ISR una página regenerada sin productos queda cacheada y el sitio se ve vacío.
 * Lanzando, Next sigue sirviendo la última versión buena (y un build con
 * Supabase caído falla, así Vercel mantiene el deploy anterior).
 */
function logError(where: string, error: { message: string } | null) {
  if (error) {
    console.error(`[supabase] ${where}: ${error.message}`);
    throw new Error(`Supabase falló al leer ${where}: ${error.message}`);
  }
}

// --- loaders (memoizados por request con cache()) ----------------------------

export const getCategories = cache(async (): Promise<Category[]> => {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("rf_category")
    .select("*")
    .order("order", { ascending: true, nullsFirst: false })
    .order("title", { ascending: true });
  logError("rf_category", error);
  return (data ?? []).map(mapCategory);
});

/** Familias activas cuya categoría también está activa. */
export const getFamilies = cache(async (): Promise<Family[]> => {
  const sb = getSupabase();
  if (!sb) return [];
  const [{ data, error }, categories] = await Promise.all([
    sb
      .from("rf_family")
      .select("*")
      .order("order", { ascending: true, nullsFirst: false })
      .order("title", { ascending: true }),
    getCategories(),
  ]);
  logError("rf_family", error);
  const active = new Set(categories.map((c) => c.slug));
  return (data ?? []).map(mapFamily).filter((f) => active.has(f.categorySlug));
});

export const getVariants = cache(async (): Promise<Variant[]> => {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("rf_variant")
    .select("product_code, family_slug, label, voltage, order")
    .order("order", { ascending: true, nullsFirst: false })
    .order("label", { ascending: true });
  logError("rf_variant", error);
  return (data ?? []).map(mapVariant).filter((v) => v.code);
});

export async function getCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

export async function getFamily(slug: string) {
  return (await getFamilies()).find((f) => f.slug === slug) ?? null;
}

export async function getVariantsOf(familySlug: string) {
  return (await getVariants()).filter((v) => v.familySlug === familySlug);
}

/** Familia de un código vendible (para /go/[code]). Insensible a mayúsculas. */
export async function getFamilySlugForCode(code: string): Promise<string | null> {
  const wanted = code.trim().toUpperCase();
  const variant = (await getVariants()).find((v) => v.code.toUpperCase() === wanted);
  if (!variant) return null;
  return (await getFamily(variant.familySlug)) ? variant.familySlug : null;
}

/** Voltajes distintos de una lista de variantes, ordenados ("12 V" antes que "24 V"). */
export function voltagesOf(variants: Variant[]): string[] {
  const set = new Set(variants.map((v) => v.voltage).filter((v): v is string => !!v));
  return [...set].sort((a, b) => parseFloat(a) - parseFloat(b) || a.localeCompare(b));
}
