export default function Loading() {
  return (
    <main
      className="container premium-explore explore-loading"
      role="status"
      aria-label="Loading collection"
    >
      <span className="sr-only">Loading collection</span>
      <div className="skeleton skeleton-crumb" />
      <div className="explore-masthead">
        <div>
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-subtitle" />
        </div>
        <div className="explore-loading-posters" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" />
          ))}
        </div>
      </div>
      <div className="skeleton explore-loading-tabs" />
      <div className="skeleton skeleton-toolbar" />
      <div className="explore-grid">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i}>
            <div className="skeleton skeleton-poster" />
            <div className="skeleton skeleton-line" />
          </div>
        ))}
      </div>
    </main>
  );
}
