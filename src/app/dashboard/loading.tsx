export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-40 bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="max-w-[1080px] mx-auto px-6 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
            <div className="w-20 h-4 rounded bg-[var(--bg-elevated)] animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 h-4 rounded bg-[var(--bg-elevated)] animate-pulse" />
            <div className="w-16 h-4 rounded bg-[var(--bg-elevated)] animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-[1080px] mx-auto px-6 py-10">
        <div className="flex justify-between gap-4 mb-10">
          <div>
            <div className="w-52 h-7 rounded-lg bg-[var(--bg-elevated)] animate-pulse mb-2" />
            <div className="w-80 h-4 rounded bg-[var(--bg-elevated)] animate-pulse" />
          </div>
          <div className="w-40 h-10 rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
              <div className="flex justify-between mb-4">
                <div className="w-24 h-5 rounded bg-[var(--accent-subtle)] animate-pulse" />
                <div className="flex -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-elevated)] animate-pulse" />
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-elevated)] animate-pulse" />
                </div>
              </div>
              <div className="w-3/4 h-5 rounded bg-[var(--bg-elevated)] animate-pulse mb-3" />
              <div className="w-40 h-4 rounded bg-[var(--bg-elevated)] animate-pulse mb-4" />
              <div className="flex justify-between pt-4 border-t border-[var(--border)]">
                <div className="w-20 h-3.5 rounded bg-[var(--bg-elevated)] animate-pulse" />
                <div className="w-24 h-3.5 rounded bg-[var(--bg-elevated)] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
