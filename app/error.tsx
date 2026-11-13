"use client";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import PageState from "@/components/page-state";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <PageState
      label="Unable to load"
      title="Let’s try that again."
      description="We couldn’t load this page. Retry, or head back to the collection."
    >
      <button className="button" onClick={reset}>
        <RefreshCw size={16} />
        Try again
      </button>
      <Link className="button button-outline" href="/browse">
        Explore series
      </Link>
    </PageState>
  );
}
