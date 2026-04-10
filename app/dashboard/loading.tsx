export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background pt-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-12 w-72 rounded-xl bg-surface-container" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-40 rounded-2xl bg-surface-container" />
          <div className="h-40 rounded-2xl bg-surface-container" />
          <div className="h-40 rounded-2xl bg-surface-container" />
        </div>
        <div className="h-64 rounded-2xl bg-surface-container" />
      </div>
    </div>
  );
}
