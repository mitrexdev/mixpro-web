import "@fontsource-variable/inter";
import "./globals.css";
import "./streaming.css";
import "./pages.css";
import "./explore.css";
import "./search.css";
import "./community.css";
import "./theme.css";
import "./footer.css";
import "./series-detail.css";
import "./watch.css";
import "./requests.css";
import "./motion.css";
import { settings } from "@/lib/catalog";
import { ads } from "@/lib/ads";
import MonetagAds from "@/components/monetag-ads";
import SiteMotion from "@/components/site-motion";
import Header from "@/components/header";
import Footer from "@/components/footer";
export const metadata = {
  title: {
    default: "Mixpro — Stories worth staying for",
    template: "%s · Mixpro",
  },
  description:
    "Explore series, find your next story and watch your favorite episodes.",
};
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [site, advertising] = await Promise.all([
    settings().catch(() => null),
    ads(),
  ]);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("mixpro.theme");document.documentElement.dataset.theme=t==="dark"||t==="light"?t:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch(e){document.documentElement.dataset.theme=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}`,
          }}
        />
      </head>
      <body id="site-top">
        <SiteMotion />
        <MonetagAds config={site && !site.maintenance ? advertising : null} />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Header name={site?.site_name || "Mixpro"} />
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <Footer
          name={site?.site_name || "Mixpro"}
          supportEmail={site?.support_email}
        />
      </body>
    </html>
  );
}
