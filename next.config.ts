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
