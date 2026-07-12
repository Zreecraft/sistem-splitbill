export default function TripDetailLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-[1080px] mx-auto px-6 h-[56px] flex items-center justify-between">
          <div className="w-40 h-4 rounded bg-[var(--bg-elevated)] animate-pulse" />
          <div className="w-28 h-8 rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
        </div>
      </header>

      <main className="max-w-[1080px] mx-auto px-6 py-8">
        {/* Trip Header Skeleton */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-elevated)] animate-pulse shrink-0" />
            <div>
              <div className="w-24 h-4 rounded bg-[var(--accent-subtle)] animate-pulse mb-2" />
              <div className="w-48 h-6 rounded bg-[var(--bg-elevated)] animate-pulse mb-2" />
              <div className="w-32 h-3.5 rounded bg-[var(--bg-elevated)] animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-6">
            <div>
              <div className="w-28 h-3 rounded bg-[var(--bg-elevated)] animate-pulse mb-2" />
              <div className="w-36 h-6 rounded bg-[var(--bg-elevated)] animate-pulse" />
            </div>
            <div className="flex -space-x-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--bg-card)] animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Tab Skeleton */}
        <div className="flex border-b border-[var(--border)] mb-8 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-32 h-4 rounded bg-[var(--bg-elevated)] animate-pulse mb-3 mx-2" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid lg:grid-cols-[200px_1fr] gap-8">
          {/* Days sidebar */}
          <div className="space-y-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-full h-10 rounded-lg animate-pulse ${i === 0 ? "bg-[var(--accent-subtle)]" : "bg-[var(--bg-card)] border border-[var(--border)]"}`} />
            ))}
          </div>

          {/* Itinerary items */}
          <div className="space-y-2.5">
            <div className="flex justify-between mb-4">
              <div className="w-40 h-5 rounded bg-[var(--bg-elevated)] animate-pulse" />
              <div className="w-32 h-8 rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
            </div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
                <div className="w-9 h-9 rounded-lg bg-[var(--bg-elevated)] animate-pulse shrink-0" />
                <div className="flex-1">
                  <div className="w-3/4 h-4 rounded bg-[var(--bg-elevated)] animate-pulse mb-1.5" />
                  <div className="w-1/2 h-3 rounded bg-[var(--bg-elevated)] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
