"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

/** Barra de categorías del header; marca la sección actual. */
export function CategoryNav({ categories, extra }: { categories: Item[]; extra: Item[] }) {
  const path = usePathname();
  const isActive = (href: string) => path === href || path.startsWith(`${href}/`);

  const link = (it: Item, muted = false) => (
    <Link
      href={it.href}
      aria-current={isActive(it.href) ? "page" : undefined}
      className={`heading relative flex h-full items-center whitespace-nowrap px-1 text-sm tracking-wide transition sm:text-base ${
        isActive(it.href) ? "text-white" : muted ? "text-white/60 hover:text-white" : "text-white/85 hover:text-white"
      } after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-full after:transition ${
        isActive(it.href) ? "after:bg-mint" : "after:bg-transparent hover:after:bg-blue"
      }`}
    >
      {it.label}
    </Link>
  );

  return (
    <nav aria-label="Categorías" className="border-t border-white/10 bg-[#04182f]">
      <ul className="container-rf flex h-12 items-stretch gap-6 overflow-x-auto sm:gap-8">
        {categories.map((c) => (
          <li key={c.href} className="shrink-0">
            {link(c)}
          </li>
        ))}
        <li aria-hidden="true" className="my-3 w-px shrink-0 bg-white/15" />
        {extra.map((c) => (
          <li key={c.href} className="shrink-0">
            {link(c, true)}
          </li>
        ))}
      </ul>
    </nav>
  );
}
