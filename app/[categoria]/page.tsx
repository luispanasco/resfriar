import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FamilyBrowser } from "@/components/FamilyBrowser";
import { toCard } from "@/lib/cards";
import { getCategories, getCategory, getFamilies, getVariants } from "@/lib/data";

export const revalidate = 60;

type Props = { params: Promise<{ categoria: string }> };

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory((await params).categoria);
  if (!category) return {};
  return {
    title: category.seoTitle || category.title,
    description: category.seoDescription || category.shortDescription || undefined,
    alternates: { canonical: `/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const category = await getCategory((await params).categoria);
  if (!category) notFound();

  const [families, variants] = await Promise.all([getFamilies(), getVariants()]);
  const cards = families.filter((f) => f.categorySlug === category.slug).map((f) => toCard(f, variants));

  return (
    <div className="container-rf py-10">
      <nav aria-label="Ruta de navegación" className="text-sm">
        <Link href="/" className="text-deep hover:underline">
          Inicio
        </Link>{" "}
        / <span aria-current="page">{category.title}</span>
      </nav>
      <h1 className="heading mt-4 text-3xl text-night sm:text-4xl">{category.title}</h1>
      {category.shortDescription && <p className="mt-3 max-w-prose">{category.shortDescription}</p>}

      <div className="mt-8">
        {cards.length ? (
          <FamilyBrowser families={cards} seriesFilter={category.slug === "climatizadores"} />
        ) : (
          <p className="rounded-xl bg-mist p-8 text-center">Estamos cargando los modelos de esta categoría. Volvé pronto.</p>
        )}
      </div>
    </div>
  );
}
