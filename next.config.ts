import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite imágenes de dominios externos (productos de dropshipping, logos de tiendas)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },   // Amplio para MVP — restringir en producción
    ],
  },

  // Reescribir llamadas /api/* al backend durante desarrollo (evita CORS en dev)
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: "/health",
        destination: `${apiUrl}/health/`,
      },
    ];
  },
};

export default nextConfig;
