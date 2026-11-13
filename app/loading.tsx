export default function Loading() {
  return (
    <main
      className="container page-loading"
      role="status"
      aria-label="Loading page"
    >
      <div className="skeleton skeleton-feature" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-subtitle" />
      <div className="series-grid">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="skeleton skeleton-poster" />
            <div className="skeleton skeleton-line" />
          </div>
        ))}
      </div>
    </main>
  );
}
