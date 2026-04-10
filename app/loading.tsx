export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div
          className="w-10 h-10 border-2 border-primary/50 rounded-sm shadow-[0_0_20px_rgba(133,173,255,0.15)]"
          style={{ animation: "cube-flip 1.8s ease-in-out infinite" }}
        />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">
          Loading...
        </p>
      </div>
    </div>
  );
}
