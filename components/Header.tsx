import Link from "next/link";
import type { Category } from "@/lib/data";
import { CategoryNav } from "./CategoryNav";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { WhatsAppPicker } from "./WhatsAppPicker";
import { Wordmark } from "./Wordmark";

export function Header({ categories }: { categories: Category[] }) {
  return (
    <header className="on-dark sticky top-0 z-40 bg-night text-white">
      <div className="container-rf flex h-16 items-center justify-between gap-3">
        <Link href="/" aria-label="Resfriar Uruguay, inicio" className="min-w-0">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-3">
          <WhatsAppPicker label="WhatsApp" className="inline-flex items-center gap-1.5 text-sm font-semibold text-mint hover:underline">
            <WhatsAppIcon className="h-5 w-5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </WhatsAppPicker>
          <Link
            href="/buscador"
            aria-label="Encontrá tu equipo"
            className="grid size-9 place-items-center rounded-lg bg-blue text-sm font-semibold hover:bg-deep sm:flex sm:size-auto sm:px-3 sm:py-1.5"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5 sm:hidden" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="m13 13 4.5 4.5" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">Encontrá tu equipo</span>
          </Link>
        </div>
      </div>
      <CategoryNav
        categories={categories.map((c) => ({ href: `/${c.slug}`, label: c.title }))}
        extra={[{ href: "/contacto", label: "Contacto" }]}
      />
    </header>
  );
}
