import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aptrade Funding — Área do Investidor",
    short_name: "Aptrade",
    description: "Aptrade Funding - A plataforma inteligente de gestão de investimentos.",
    start_url: "/investidor",
    display: "standalone",
    background_color: "#060813",
    theme_color: "#F5C400",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512x512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
