import Link from "next/link";
import type { Category } from "@/lib/data";
import { EMAIL, LOCATIONS, SOCIAL } from "@/lib/contacts";
import { STORE_URL } from "@/lib/links";
import { Wordmark } from "./Wordmark";

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="on-dark mt-16 bg-night text-white/80">
      <div className="container-rf grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Wordmark className="text-white" />
          <p className="mt-3 text-sm">Distribuidor oficial y exclusivo en Uruguay: Nami.</p>
          <p className="mt-3 text-sm">
            Compras en{" "}
            <a href={STORE_URL} target="_blank" rel="noopener" className="font-semibold text-mint hover:underline">
              clima.nami.com.uy
            </a>
          </p>
        </div>
        {categories.length > 0 && (
          <nav aria-label="Categorías (pie de página)">
            <h2 className="heading text-sm text-white">Productos</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${c.slug}`} className="hover:text-white">
                    {c.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/buscador" className="hover:text-white">
                  Encontrá tu equipo
                </Link>
              </li>
            </ul>
          </nav>
        )}
        <div className="text-sm">
          <h2 className="heading text-sm text-white">Locales</h2>
          <ul className="mt-3 space-y-3">
            {LOCATIONS.map((l) => (
              <li key={l.slug}>
                <p className="font-semibold text-white">{l.name}</p>
                <a href={l.mapsUrl} target="_blank" rel="noopener" className="hover:text-white">
                  {l.address}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm">
          <h2 className="heading text-sm text-white">Contacto</h2>
          <ul className="mt-3 space-y-1">
            <li>
              <Link href="/contacto" className="font-semibold text-mint hover:underline">
                Hablá con un vendedor
              </Link>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`} className="hover:text-white">
                {EMAIL}
              </a>
            </li>
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a href={s.url} target="_blank" rel="noopener" className="hover:text-white">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-rf py-4 text-xs text-white/50">
          Resfriar es una marca registrada de su respectivo titular.
        </p>
      </div>
    </footer>
  );
}
