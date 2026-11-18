import type { Metadata } from "next";
import { ProductFinder, type FinderAnswers, type FinderFamily } from "@/components/ProductFinder";
import { getCategories, getFamilies, getVariants } from "@/lib/data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Encontrá tu equipo",
  description: "Respondé tres preguntas y te mostramos el climatizador, aire acondicionado o heladera Resfriar para tu vehículo.",
  alternates: { canonical: "/buscador" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function FinderPage({ searchParams }: Props) {
  const [sp, categories, families, variants] = await Promise.all([searchParams, getCategories(), getFamilies(), getVariants()]);
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
  const initial: FinderAnswers = { que: one(sp.que), vehiculo: one(sp.vehiculo), voltaje: one(sp.voltaje) };

  const data: FinderFamily[] = families.map((f) => ({
    slug: f.slug,
    categorySlug: f.categorySlug,
    title: f.title,
    series: f.series,
    image: f.images[0] ?? null,
    compatibility: f.compatibility,
    variants: variants
      .filter((v) => v.familySlug === f.slug)
      .map((v) => ({ code: v.code, label: v.label, voltage: v.voltage })),
  }));

  return (
    <div className="container-rf py-12 md:py-16">
      <p className="heading text-sm text-deep">Encontrá tu equipo</p>
      <div className="mt-4">
        <ProductFinder
          categories={categories.map((c) => ({ slug: c.slug, title: c.title }))}
          families={data}
          initial={initial}
        />
      </div>
    </div>
  );
}
