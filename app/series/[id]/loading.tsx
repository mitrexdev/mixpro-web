export default function Loading() {
  return (
    <main
      className="container title-detail-loading"
      role="status"
      aria-label="Loading series"
    >
      <span className="sr-only">Loading series and episodes</span>
      <div className="skeleton skeleton-crumb" />
      <div className="title-introduction">
        <div className="title-poster-column">
          <div className="skeleton title-loading-poster" />
        </div>
        <div className="title-copy">
          <div className="skeleton skeleton-subtitle" />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton title-loading-button" />
        </div>
      </div>
      <div className="skeleton skeleton-title" />
      {[0, 1, 2].map((i) => (
        <div className="title-episode" key={i}>
          <div className="skeleton title-loading-thumbnail" />
          <div>
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
          </div>
        </div>
      ))}
    </main>
  );
}
