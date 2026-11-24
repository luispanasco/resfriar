import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

// Mientras el sitio vive en launchuruguay.com.uy/resfriar, NEXT_PUBLIC_BASE_PATH="/resfriar".
// Con dominio propio, se deja vacío y el sitio queda en la raíz.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  basePath,
  images: {
    // Cada foto optimizada queda 31 días en la caché de Vercel. Las fotos de
    // Supabase no traen Cache-Control, así que sin esto se usaban 60 s y el
    // optimizador volvía a bajar el original de Supabase a cada rato (eso agotó
    // la cuota de transferencia el 2026-11-23). Las fotos nunca se pisan: cada
    // subida lleva un nombre nuevo, así que no hay riesgo de mostrar una vieja.
    minimumCacheTTL: 2678400,
    // Fotos en el bucket público `web-images` de Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
