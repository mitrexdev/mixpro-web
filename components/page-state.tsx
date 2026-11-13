import Link from "next/link";
import { ArrowLeft, Film } from "lucide-react";
import type { ReactNode } from "react";
export default function PageState({
  title,
  description,
  label = "A short intermission",
  children,
}: {
  title: string;
  description: string;
  label?: string;
  children?: ReactNode;
}) {
  return (
    <main className="container state-page">
      <div className="state-frame" aria-hidden="true">
        <Film size={68} strokeWidth={0.8} />
        <span />
      </div>
      <span className="state-label">{label}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="state-actions">
        {children || (
          <Link className="button" href="/browse">
            <ArrowLeft size={16} />
            Explore series
          </Link>
        )}
      </div>
    </main>
  );
}
