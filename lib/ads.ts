import "server-only";
import { cache } from "react";
import { db } from "./db";
import { validateAds, type AdConfig } from "./ad-config";
export const ads = cache(async (): Promise<AdConfig | null> => {
  try {
    const result = await db()
      .from("site_ads")
      .select("enabled,domain,script_url,attributes,pages")
      .eq("id", true)
      .single();
    if (result.error) throw result.error;
    return validateAds(result.data);
  } catch {
    console.error("Advertising configuration unavailable; ads are disabled.");
    return null;
  }
});
