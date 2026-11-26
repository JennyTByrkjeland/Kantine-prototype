import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },

  // Slått av etter avtale med Jenny: kurset bruker vanlig caching uten Cache Components
  // cacheComponents: true,
  // partialPrefetching: true,

  // Slått av: regelen gjorde at .module.css-filene ble lest som vanlig CSS, så all styling forsvant.
  // Prosjektet bruker CSS Modules, ikke Tailwind.
  // turbopack: {
  //   rules: {
  //     "*.css": {
  //       loaders: ["@tailwindcss/turbopack"],
  //       as: "*.css",
  //     },
  //   },
  // },
};

export default nextConfig;


