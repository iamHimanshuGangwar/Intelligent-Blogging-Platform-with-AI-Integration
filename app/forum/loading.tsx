export default function ForumLoading() {
  return (
    <div className="min-h-screen bg-background pt-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-14 w-80 rounded-xl bg-surface-container" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 rounded-xl bg-surface-container" />
          <div className="h-24 rounded-xl bg-surface-container" />
          <div className="h-24 rounded-xl bg-surface-container" />
          <div className="h-24 rounded-xl bg-surface-container" />
        </div>
        <div className="h-72 rounded-2xl bg-surface-container" />
      </div>
    </div>
  );
}
