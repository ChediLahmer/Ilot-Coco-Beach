import { useConfig, configReady } from "@/composables/useConfig";

const ORIGIN = "https://ilotcocobeach.tn";
const SITE = "Ilot Coco Beach";

const config = useConfig();

const ROUTES = {
  home: {
    path: "/",
    title: `${SITE} — Restaurant & Cabanes à Ghar El Melh, Bizerte`,
    description:
      "Restaurant fruits de mer sur une île à Ghar El Melh. Cabanes sur l'eau et sur sable, paillotes sur mer, parasols, balades en mer et traversée en bateau. Réservez votre table.",
  },
  menu: {
    path: "/menu",
    title: `Carte & Menu — ${SITE}`,
    description:
      "Découvrez la carte de l'Ilot Coco Beach : fruits de mer frais, grillades, entrées, desserts et cocktails à Ghar El Melh, Bizerte.",
  },
  spaces: {
    path: "/spaces",
    title: `Cabanes, Paillotes & Espaces — ${SITE}`,
    description:
      "Cabanes sur l'eau et sur sable, paillotes sur mer et parasols privatifs à l'Ilot Coco Beach, Ghar El Melh. Réservez votre espace face à la mer.",
  },
  offers: {
    path: "/offers",
    title: `Offres, Ventes Flash & Bons cadeaux — ${SITE}`,
    description:
      "Profitez des offres et ventes flash de l'Ilot Coco Beach et offrez un bon cadeau pour une journée fruits de mer sur l'île à Ghar El Melh.",
  },
  gallery: {
    path: "/gallery",
    title: `Galerie photos — ${SITE}`,
    description:
      "En images : l'île, les cabanes sur l'eau, les paillotes, les fruits de mer et les balades en mer de l'Ilot Coco Beach à Ghar El Melh, Bizerte.",
  },
  reviews: {
    path: "/reviews",
    title: `Avis clients — ${SITE}`,
    description:
      "Les avis des clients de l'Ilot Coco Beach, restaurant fruits de mer et cabanes sur l'eau à Ghar El Melh, Bizerte.",
  },
  "not-found": {
    path: "",
    title: `Page introuvable — ${SITE}`,
    description:
      "Cette page n'existe pas. Revenez à l'accueil de l'Ilot Coco Beach, restaurant et cabanes à Ghar El Melh, Bizerte.",
  },
};

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function applyRouteSeo(routeName, fullPath = "/") {
  render(routeName, fullPath);
  // Config loads asynchronously; re-render once it is available so any
  // admin-set title / description / share image takes effect on first paint.
  if (!config.loaded) configReady.then(() => render(routeName, fullPath));
}

function render(routeName, fullPath = "/") {
  const meta = ROUTES[routeName] || ROUTES.home;
  const url = `${ORIGIN}${meta.path || fullPath || "/"}`;
  const isHome = routeName === "home";

  // Site-wide SEO fields (set in admin) override the home page defaults.
  const title = isHome && config.seoTitle ? config.seoTitle : meta.title;
  const description =
    isHome && config.seoDescription ? config.seoDescription : meta.description;

  document.title = title;
  upsertMeta("name", "description", description);
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:url", url);
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
  if (config.ogImage) {
    upsertMeta("property", "og:image", config.ogImage);
    upsertMeta("name", "twitter:image", config.ogImage);
  }
  setCanonical(url);
}
