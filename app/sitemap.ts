import type { MetadataRoute } from "next";
import { getCategories, getFamilies } from "@/lib/data";
import { SITE_URL } from "@/lib/links";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, families] = await Promise.all([getCategories(), getFamilies()]);
  return [
    { url: `${SITE_URL}/` },
    ...categories.map((c) => ({ url: `${SITE_URL}/${c.slug}` })),
    ...families.map((f) => ({ url: `${SITE_URL}/producto/${f.slug}` })),
  ];
}
