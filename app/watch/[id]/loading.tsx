export default function Loading() {
  return (
    <main className="watch-page-refined">
      <div
        className="screening-page container viewing-loading"
        role="status"
        aria-label="Loading episode"
      >
        <span className="sr-only">Loading episode</span>
        <div className="skeleton skeleton-crumb" />
        <div className="watch-restored-layout">
          <div>
            <div className="skeleton viewing-player-skeleton" />
            <div className="skeleton viewing-navigation-skeleton" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-subtitle" />
            <div className="skeleton skeleton-line" />
          </div>
          <div className="skeleton viewing-queue-skeleton" />
        </div>
      </div>
    </main>
  );
}
