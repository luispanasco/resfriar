import Link from "next/link";
import { FamilyCard } from "@/components/FamilyCard";
import { HeroCarousel, type HeroSlide } from "@/components/HeroCarousel";
import { toCard } from "@/lib/cards";
import { getCategories, getFamilies, getVariants, type Category, type Family } from "@/lib/data";
import { STORE_URL } from "@/lib/links";

export const revalidate = 60;

const STEPS = [
  { n: "1", title: "Elegí tu equipo", text: "Recorré el catálogo y compará modelos, voltajes y compatibilidad con tu camión." },
  { n: "2", title: "Tocá «Comprar»", text: "Cada código te lleva a su página en la tienda de Nami, clima.nami.com.uy." },
  { n: "3", title: "Comprá en Nami", text: "Precio, stock, pago y envío se gestionan en la tienda del distribuidor oficial." },
];

// Orden del hero: primero aire, después climatizadores, después heladeras
// (las categorías que no estén acá van al final, en su orden).
const HERO_CATEGORY_ORDER = ["aire-acondicionado", "climatizadores", "heladeras"];

/**
 * Destacados intercalados por categoría: 1º aire, 1º clima, 1º heladera, 2º aire…
 * Una categoría sin destacados aporta su primera familia con foto.
 */
function heroSlides(categories: Category[], families: Family[]): HeroSlide[] {
  const rank = (slug: string) => {
    const i = HERO_CATEGORY_ORDER.indexOf(slug);
    return i === -1 ? HERO_CATEGORY_ORDER.length : i;
  };
  const cats = [...categories].sort((a, b) => rank(a.slug) - rank(b.slug));
  const queues = cats.map((c) => {
    const inCat = families.filter((f) => f.categorySlug === c.slug);
    const picked = inCat.filter((f) => f.isFeatured);
    const list = picked.length ? picked : inCat.filter((f) => f.images.length).slice(0, 1);
    return list.map((f) => ({
      slug: f.slug,
      categoryTitle: c.title,
      title: f.title,
      series: f.series,
      shortDescription: f.shortDescription,
      highlights: f.highlights.slice(0, 3),
      image: f.images[0] ?? null,
    }));
  });
  const out: HeroSlide[] = [];
  for (let round = 0; queues.some((q) => q.length > round); round++) {
    for (const q of queues) if (q[round]) out.push(q[round]);
  }
  return out;
}

export default async function Home() {
  const [categories, families, variants] = await Promise.all([getCategories(), getFamilies(), getVariants()]);

  const featured = families.filter((f) => f.isFeatured);
  const showcase = (featured.length ? featured : families).slice(0, 3);
  const slides = heroSlides(categories, families);

  return (
    <>
      {/* Hero */}
      <section className="on-dark relative overflow-hidden bg-night text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(0,148,230,0.45),transparent_60%),radial-gradient(ellipse_at_10%_100%,rgba(94,255,197,0.15),transparent_50%)]"
        />
        <div className="container-rf relative pb-12 pt-5 md:pb-16 md:pt-6">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-white/10 pb-4">
            <h1 className="heading text-sm text-white/80">Climatizadores, aire acondicionado y heladeras para camiones</h1>
            <p className="heading text-sm text-mint">Distribuidor oficial y exclusivo en Uruguay: Nami</p>
          </div>
          {slides.length > 0 ? (
            <HeroCarousel slides={slides} />
          ) : (
            <p className="max-w-prose text-white/80">
              Climatizadores evaporativos, aires acondicionados de techo 12/24 V y heladeras Resfriar para camiones y
              uso portátil.{" "}
              <a href={STORE_URL} target="_blank" rel="noopener" className="font-semibold text-mint hover:underline">
                Ir a la tienda
              </a>
            </p>
          )}
        </div>
      </section>

      {/* Buscador guiado */}
      <section className="bg-blue text-white">
        <div className="container-rf flex flex-col items-start gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="heading text-xl sm:text-2xl">¿No sabés cuál te sirve?</h2>
            <p className="mt-1 text-white/90">Contanos qué buscás, para qué vehículo y de qué voltaje, y te mostramos el equipo.</p>
          </div>
          <Link
            href="/buscador"
            className="shrink-0 rounded-lg bg-night px-5 py-2.5 text-sm font-semibold text-white hover:bg-white hover:text-night"
          >
            Encontrá tu equipo →
          </Link>
        </div>
      </section>

      {/* Destacados */}
      {showcase.length > 0 && (
        <section className="container-rf pb-14" aria-labelledby="dest-h">
          <h2 id="dest-h" className="heading text-2xl text-night sm:text-3xl">
            Destacados
          </h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((f, i) => (
              <li key={f.slug}>
                <FamilyCard f={toCard(f, variants)} index={i} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Cómo comprar */}
      <section className="bg-mist py-14" aria-labelledby="comprar-h">
        <div className="container-rf">
          <h2 id="comprar-h" className="heading text-2xl text-night sm:text-3xl">
            Cómo comprar
          </h2>
          <ol className="mt-6 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-xl bg-white p-6">
                <span className="heading text-3xl text-blue" aria-hidden="true">
                  {s.n}
                </span>
                <h3 className="heading mt-2 text-lg text-night">{s.title}</h3>
                <p className="mt-1 text-sm">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
