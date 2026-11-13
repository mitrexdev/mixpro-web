export type AdConfig = {
  enabled: boolean;
  domain: string;
  script_url: string;
  attributes: Record<string, string>;
  pages: string[];
};
