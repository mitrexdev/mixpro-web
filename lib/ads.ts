import type { AdConfig } from "./ad-config";

// Production Monetag Vignette tag supplied by the site owner.
// Ad delivery is configured in this repository, never through the admin database.
export const advertising: AdConfig = {
  enabled: true,
  domain: "slidra.in",
  script_url: "https://n6wxm.com/vignette.min.js",
  attributes: { "data-zone": "12250721" },
  pages: ["home", "explore", "series"],
  additional_scripts: [
    {
      id: "mixpro-quge5-309549",
      src: "https://quge5.com/88/tag.min.js",
      attributes: { "data-zone": "309549", "data-cfasync": "false" },
    },
    {
      id: "mixpro-monetag-onclick",
      src: "https://al5sm.com/tag.min.js",
      attributes: { "data-zone": "12091078" },
    },
    {
      id: "mixpro-monetag-push",
      src: "https://nap5k.com/tag.min.js",
      attributes: { "data-zone": "12250716" },
    },
  ],
};
