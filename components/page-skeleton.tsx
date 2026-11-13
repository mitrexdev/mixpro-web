export default function PageSkeleton({
  variant,
}: {
  variant: "browse" | "series" | "watch" | "about";
}) {
  return (
    <main
      className={`container route-skeleton route-skeleton-${variant}`}
      role="status"
      aria-label="Loading page"
    >
      <span className="sr-only">Loading page</span>
      <div className="skeleton skeleton-crumb" />
      {variant === "watch" ? (
        <div className="skeleton-watch-layout">
          <div>
            <div className="skeleton skeleton-player" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-subtitle" />
          </div>
          <div className="skeleton skeleton-queue" />
        </div>
      ) : variant === "series" ? (
        <>
          <div className="skeleton skeleton-feature" />
          <div className="skeleton-story">
            <div className="skeleton skeleton-story-poster" />
            <div>
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-subtitle" />
              <div className="skeleton skeleton-subtitle" />
            </div>
          </div>
          <div className="skeleton skeleton-title" />
          <div className="skeleton-chapters">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <div className="skeleton skeleton-thumbnail" />
                <div className="skeleton skeleton-line" />
              </div>
            ))}
          </div>
        </>
      ) : variant === "about" ? (
        <>
          <div className="skeleton-about">
            <div>
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-subtitle" />
            </div>
            <div className="skeleton skeleton-about-art" />
          </div>
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-subtitle" />
        </>
      ) : (
        <>
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-subtitle" />
          <div className="skeleton skeleton-toolbar" />
          <div className="series-grid">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i}>
                <div className="skeleton skeleton-poster" />
                <div className="skeleton skeleton-line" />
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
