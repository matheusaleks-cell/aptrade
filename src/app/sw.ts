import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, NetworkOnly } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // 1. Páginas de navegação do Investidor: NetworkFirst (tenta rede, cai no cache se falhar)
    {
      matcher: ({ request, url }) => {
        return request.mode === "navigate" && url.pathname.startsWith("/investidor");
      },
      handler: new NetworkFirst({
        cacheName: "aptrade-investor-pages",
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              if (response && response.status === 200) return response;
              return null;
            },
          },
        ],
      }),
    },
    // 2. Ações financeiras, submissões e APIs: NetworkOnly (nunca exibe do cache por segurança de saldos)
    {
      matcher: ({ request, url }) => {
        return (
          request.method === "POST" ||
          url.pathname.startsWith("/api") ||
          url.pathname.includes("/_next/data") ||
          request.headers.get("x-nextjs-data") !== null
        );
      },
      handler: new NetworkOnly(),
    },
    // 3. Cache padrão de assets do Serwist
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        matcher: ({ request }) => request.mode === "navigate",
        url: "/~offline",
      },
    ],
  },
});

serwist.addEventListeners();
