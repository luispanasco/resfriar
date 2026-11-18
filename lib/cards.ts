import type { FamilyCardData } from "@/components/FamilyCard";
import { voltagesOf, type Family, type Variant } from "./data";

/** Fotos que rotan en la tarjeta (las primeras de la galería). */
const CARD_IMAGES = 4;

/** Datos serializables de una tarjeta (se pasan a componentes cliente). */
export function toCard(f: Family, variants: Variant[]): FamilyCardData {
  return {
    slug: f.slug,
    title: f.title,
    series: f.series,
    images: f.images.slice(0, CARD_IMAGES),
    summary: f.shortDescription || f.description.split("\n")[0] || "",
    highlights: f.highlights.slice(0, 2),
    voltages: voltagesOf(variants.filter((v) => v.familySlug === f.slug)),
    compatibility: f.compatibility,
  };
}
