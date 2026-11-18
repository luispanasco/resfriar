import type { Metadata, Viewport } from "next";
import { Montserrat, Saira } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCategories } from "@/lib/data";
import { SITE_URL } from "@/lib/links";

const saira = Saira({ variable: "--font-saira", subsets: ["latin"], weight: ["600", "700"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Resfriar Uruguay | Climatizadores, aire acondicionado y heladeras para camiones",
    template: "%s | Resfriar Uruguay",
  },
  description:
    "Climatizadores evaporativos, aires acondicionados de techo 12/24 V y heladeras Resfriar para camiones. Nami, distribuidor oficial y exclusivo de Resfriar en Uruguay.",
  openGraph: { siteName: "Resfriar Uruguay", locale: "es_UY", type: "website" },
};

export const viewport: Viewport = { themeColor: "#000d1f" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();
  return (
    <html lang="es-UY" className={`${saira.variable} ${montserrat.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
        >
          Saltar al contenido
        </a>
        <Header categories={categories} />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer categories={categories} />
      </body>
    </html>
  );
}
