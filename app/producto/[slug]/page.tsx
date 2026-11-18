import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/BuyBox";
import { FamilyCard } from "@/components/FamilyCard";
import { Gallery } from "@/components/Gallery";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { WhatsAppPicker } from "@/components/WhatsAppPicker";
import { toCard } from "@/lib/cards";
import { productMessage } from "@/lib/contacts";
import { getCategory, getFamilies, getFamily, getVariants, getVariantsOf } from "@/lib/data";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

// Specs que se muestran como lista con tildes en lugar de como tarjeta.
const LIST_SPECS = ["Funciones", "Más información"];

export async function generateStaticParams() {
  return (await getFamilies()).map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await getFamily((await params).slug);
  if (!f) return {};
  const title = f.seoTitle || [f.title, f.series].filter(Boolean).join(" · ");
  const description =
    f.seoDescription || f.shortDescription || f.description.split("\n")[0].slice(0, 160) || undefined;
  const images = f.images[0] ? [{ url: f.images[0], alt: f.title }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/producto/${f.slug}` },
    openGraph: { title, description, images, type: "website" },
    twitter: { card: images ? "summary_large_image" : "summary", title, description },
  };
}

export default async function ProductPage({ params }: Props) {
  const family = await getFamily((await params).slug);
  if (!family) notFound();

  const [category, variants, families, allVariants] = await Promise.all([
    getCategory(family.categorySlug),
    getVariantsOf(family.slug),
    getFamilies(),
    getVariants(),
  ]);

  const waMessage = productMessage(family.title);
  const lists = LIST_SPECS.map((l) => family.specs.find((s) => s.label === l)).filter((s) => !!s);
  const cards = family.specs.filter((s) => !LIST_SPECS.includes(s.label));
  const paragraphs = family.description.split("\n").filter(Boolean);

  // Otros de la misma categoría: primero los de la misma serie.
  const related = families
    .filter((f) => f.categorySlug === family.categorySlug && f.slug !== family.slug)
    .sort((a, b) => Number(b.series === family.series) - Number(a.series === family.series))
    .slice(0, 3);

  const sections = [
    paragraphs.length > 0 && { id: "descripcion", label: "Descripción" },
    cards.length > 0 && { id: "ficha", label: "Ficha técnica" },
    family.documents.length > 0 && { id: "documentos", label: "Documentos" },
  ].filter((s) => !!s);

  return (
    <article className="pb-20 lg:pb-0">
      {/* Encabezado del producto */}
      <section className="on-dark relative overflow-hidden bg-night text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(0,148,230,0.25),transparent_55%),radial-gradient(ellipse_at_90%_100%,rgba(94,255,197,0.10),transparent_50%)]"
        />
        <div className="container-rf relative pb-10 pt-4 lg:pb-14">
          <nav aria-label="Ruta de navegación" className="text-xs text-white/60">
            <Link href="/" className="hover:text-white">
              Inicio
            </Link>
            {category && (
              <>
                <span aria-hidden="true"> / </span>
                <Link href={`/${category.slug}`} className="hover:text-white">
                  {category.title}
                </Link>
              </>
            )}
            <span aria-hidden="true"> / </span>
            <span aria-current="page" className="text-white/80">
              {family.title}
            </span>
          </nav>

          {/* Celular: título → fotos → datos y compra. Escritorio: fotos a la izquierda, el resto a la derecha. */}
          <div className="mt-4 grid grid-cols-1 gap-5 lg:mt-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-5">
            <div className="min-w-0 lg:col-start-2 lg:row-start-1">
              <div className="flex flex-wrap items-center gap-2">
                {family.series && <span className="heading rounded-full bg-mint px-3 py-1 text-xs text-night">{family.series}</span>}
                {family.factoryRef && <span className="text-xs text-white/50">Ref. de fábrica {family.factoryRef}</span>}
              </div>
              <h1 className="heading mt-3 text-2xl text-balance sm:text-4xl">{family.title}</h1>
              {family.shortDescription && <p className="mt-3 text-white/80">{family.shortDescription}</p>}
            </div>

            <div className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
              <Gallery images={family.images} title={family.title} />
            </div>

            <div className="flex min-w-0 flex-col gap-5 lg:col-start-2 lg:row-start-2">
              {family.highlights.length > 0 && (
                <dl className="grid grid-cols-2 gap-2">
                  {family.highlights.map((h) => (
                    <div key={h.label} className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-3">
                      <dt className="text-[0.7rem] uppercase tracking-wide text-white/55">{h.label}</dt>
                      <dd className="heading mt-1 whitespace-pre-line break-words text-lg">{h.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {family.compatibility.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-white/55">Para:</span>
                  {family.compatibility.map((c) => (
                    <span key={c} className="rounded-full border border-white/20 px-3 py-0.5">
                      {c}
                    </span>
                  ))}
                </div>
              )}

              <div className="order-first lg:order-none">
                <BuyBox title={family.title} variants={variants} message={waMessage} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Atajos a las secciones */}
      {sections.length > 1 && (
        <nav aria-label="Secciones de la ficha" className="border-b border-black/10 bg-white">
          <ul className="container-rf flex gap-6 overflow-x-auto py-3 text-sm font-semibold">
            {sections.map((s) => (
              <li key={s.id} className="shrink-0">
                <a href={`#${s.id}`} className="text-deep hover:text-night">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="container-rf mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-14">
        <div className="min-w-0 space-y-12">
          {paragraphs.length > 0 && (
            <section id="descripcion" aria-labelledby="desc-h" className="scroll-mt-32">
              <h2 id="desc-h" className="heading text-2xl text-night">
                Descripción
              </h2>
              <div className="mt-4 space-y-3 text-base leading-relaxed">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}

          {cards.length > 0 && (
            <section id="ficha" aria-labelledby="specs-h" className="scroll-mt-32">
              <h2 id="specs-h" className="heading text-2xl text-night">
                Ficha técnica
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                {cards.map((s, i) => (
                  <div key={`${s.label}-${i}`} className="min-w-0 rounded-xl bg-mist p-3 sm:p-4">
                    <dt className="text-[0.68rem] font-semibold uppercase tracking-wide text-slate/70 sm:text-xs">{s.label}</dt>
                    <dd className="mt-1 whitespace-pre-line break-words text-sm font-semibold text-night sm:text-base">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        <aside className="min-w-0 space-y-8">
          {lists.map((s) => (
            <section key={s.label} aria-label={s.label} className="rounded-2xl border border-black/10 p-5">
              <h2 className="heading text-lg text-night">{s.label}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {s.value.split("\n").map((line) => (
                  <li key={line} className="flex gap-2">
                    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-blue" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <path d="m3 8.5 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {family.documents.length > 0 && (
            <section id="documentos" aria-labelledby="docs-h" className="scroll-mt-32 rounded-2xl border border-black/10 p-5">
              <h2 id="docs-h" className="heading text-lg text-night">
                Documentos
              </h2>
              <ul className="mt-3 space-y-2">
                {family.documents.map((d) => (
                  <li key={d.url}>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center gap-3 rounded-lg bg-mist p-3 text-sm font-semibold text-night hover:bg-blue/10"
                    >
                      <span className="rounded bg-deep px-1.5 py-0.5 text-[0.65rem] font-bold text-white">PDF</span>
                      {d.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="ayuda-h" className="rounded-2xl bg-night p-5 text-white">
            <h2 id="ayuda-h" className="heading text-lg">
              ¿Tenés dudas?
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Te ayudamos a elegir la versión para tu vehículo y con cualquier consulta técnica.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <WhatsAppPicker
                message={waMessage}
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-night hover:brightness-95"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Escribile a un vendedor
              </WhatsAppPicker>
              <Link href="/contacto" className="inline-flex items-center px-2 py-2 text-sm font-semibold text-mint hover:underline">
                Ver contactos
              </Link>
            </div>
          </section>
        </aside>
      </div>

      {related.length > 0 && category && (
        <section aria-labelledby="rel-h" className="container-rf mt-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="rel-h" className="heading text-2xl text-night">
              También te puede interesar
            </h2>
            <Link href={`/${category.slug}`} className="text-sm font-semibold text-deep hover:underline">
              Ver todos los {category.title.toLowerCase()} →
            </Link>
          </div>
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((f, i) => (
              <li key={f.slug}>
                <FamilyCard f={toCard(f, allVariants)} index={i} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
