export type AdConfig = {
  enabled: boolean;
  domain: string;
  script_url: string;
  attributes: Record<string, string>;
  pages: string[];
  additional_scripts?: { id: string; src: string; attributes: Record<string, string> }[];
};
