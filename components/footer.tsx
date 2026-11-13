import Link from "next/link";
import { ArrowUp, ArrowUpRight, Film, Mail } from "lucide-react";
export default function Footer({
  name,
  supportEmail,
}: {
  name: string;
  supportEmail?: string;
}) {
  return (
    <footer className="watch-footer">
      <div className="container">
        <div className="watch-footer-main">
          <div className="watch-footer-brand">
            <Link
              className="watch-footer-wordmark"
              href="/"
              aria-label={`${name} home`}
            >
              <Film size={25} strokeWidth={1.5} />
              <span>{name.toLowerCase()}</span>
            </Link>
            <p>
              Good stories.
              <br />
              Your own pace.
            </p>
            <span>Find a series. Make an evening of it.</span>
          </div>
          <nav
            className="watch-footer-links"
            aria-label="Footer collection links"
          >
            <h2>The collection</h2>
            <Link href="/browse">
              Explore all series
              <ArrowUpRight size={13} />
            </Link>
            <Link href="/browse?sort=newest">
              Recently added
              <ArrowUpRight size={13} />
            </Link>
            <Link href="/browse?sort=rating">
              Top rated
              <ArrowUpRight size={13} />
            </Link>
          </nav>
          <div className="watch-footer-information">
            <nav
              className="watch-footer-links"
              aria-label="Footer information links"
            >
              <h2>About {name}</h2>
              <Link href="/about">
                About & credits
                <ArrowUpRight size={13} />
              </Link>
            </nav>
            {supportEmail && (
              <div className="watch-footer-contact">
                <span>Get in touch</span>
                <a href={`mailto:${supportEmail}`}>
                  <Mail size={14} />
                  <span>{supportEmail}</span>
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="watch-footer-bottom">
          <small>
            © {new Date().getFullYear()} {name}
          </small>
          <span>A place for your next favorite.</span>
          <a className="watch-footer-top" href="#site-top">
            Back to top
            <span>
              <ArrowUp size={15} />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
