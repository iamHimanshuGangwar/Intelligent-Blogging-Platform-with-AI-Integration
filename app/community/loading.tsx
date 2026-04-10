export default function CommunityLoading() {
  return (
    <div className="min-h-screen bg-background pt-24 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-12 w-64 rounded-xl bg-surface-container" />
        <div className="h-10 w-full rounded-xl bg-surface-container" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-56 rounded-2xl bg-surface-container" />
            <div className="h-56 rounded-2xl bg-surface-container" />
          </div>
          <div className="h-72 rounded-2xl bg-surface-container" />
        </div>
      </div>
    </div>
  );
}
