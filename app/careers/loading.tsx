export default function CareersLoading() {
  return (
    <div className="min-h-screen bg-background pt-24 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-14 w-96 rounded-xl bg-surface-container" />
        <div className="h-28 rounded-2xl bg-surface-container" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-2xl bg-surface-container" />
          <div className="h-80 rounded-2xl bg-surface-container" />
          <div className="h-80 rounded-2xl bg-surface-container" />
        </div>
      </div>
    </div>
  );
}
