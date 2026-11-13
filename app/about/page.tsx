import Link from "next/link";
import { ArrowUpRight, Film, Play, Mail } from "lucide-react";
import { settings } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export const metadata = { title: "About & credits" };
export default async function About() {
  const site = await settings();
  return (
    <main className="container about-page">
      <nav className="page-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>About</span>
      </nav>
      <section className="about-opening">
        <div>
          <span className="quiet-label">
            About {site.site_name || "Mixpro"}
          </span>
          <h1>
            A home for
            <br />
            good stories.
          </h1>
          <p>
            {site.description ||
              "Explore our series collection, discover a new favorite and settle into the next episode."}
          </p>
          <Link className="button" href="/browse">
            <Play size={15} fill="currentColor" />
            Explore the collection
          </Link>
        </div>
        <div className="about-art" aria-hidden="true">
          <div className="about-film-frame">
            <Film size={90} strokeWidth={0.7} />
          </div>
          <span>Make time for a story.</span>
        </div>
      </section>
      <div className="about-sections">
        <section>
          <span className="quiet-label">The experience</span>
          <h2>
            Choose a story.
            <br />
            Press play.
          </h2>
        </section>
        <div className="about-copy">
          <section>
            <h3>Watch at your own pace</h3>
            <p>
              Explore series, browse seasons and choose an episode. No account
              is required to watch published episodes.
            </p>
          </section>
          <section>
            <h3>Viewing activity</h3>
            <p>
              We use an anonymous browser identifier to record plays and watch
              time, so we can understand how the collection is watched.
              Reactions use a guest browser identifier. Comments and the display
              name you enter are public; you can delete your comments from the
              same browser.
            </p>
          </section>
        </div>
      </div>
      <div className="about-sections">
        <section>
          <span className="quiet-label">Behind the collection</span>
          <h2>Credits & sources</h2>
        </section>
        <div className="about-copy">
          <section>
            <h3>Series information</h3>
            <p>
              Some series and episode information comes from TVmaze. Individual
              series pages link to their source where available.
            </p>
            <a
              className="text-link"
              href="https://www.tvmaze.com"
              target="_blank"
              rel="noreferrer"
            >
              Visit TVmaze <ArrowUpRight size={15} />
            </a>
          </section>
          <section>
            <h3>Metadata license</h3>
            <p>
              TVmaze API data is licensed under Creative Commons
              Attribution-ShareAlike.
            </p>
            <a
              className="text-link"
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noreferrer"
            >
              Read the CC BY-SA license <ArrowUpRight size={15} />
            </a>
          </section>
        </div>
      </div>
      {site.support_email && (
        <section className="about-contact">
          <div>
            <Mail size={24} strokeWidth={1.2} />
            <h2>Get in touch</h2>
          </div>
          <a href={`mailto:${site.support_email}`}>
            {site.support_email}
            <ArrowUpRight size={18} />
          </a>
        </section>
      )}
    </main>
  );
}
