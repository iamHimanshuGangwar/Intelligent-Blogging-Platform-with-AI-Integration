"use client";

interface AIAssistantSidebarProps {
  onGenerateTitle?: () => void;
  onSummarize?: () => void;
  onCheckTone?: () => void;
}

export default function AIAssistantSidebar({
  onGenerateTitle,
  onSummarize,
  onCheckTone,
}: AIAssistantSidebarProps) {
  return (
    <aside className="w-96 bg-surface-container-low border-l border-white/5 flex flex-col p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h2 className="font-headline text-xl font-bold tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">
            bolt
          </span>
          AI Assistant
        </h2>
        <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-all">
          more_horiz
        </button>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 mb-10">
        <button
          onClick={onGenerateTitle}
          className="w-full p-5 bg-surface-container-high rounded-xl text-left border border-white/5 hover:border-primary/30 transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
              auto_fix_high
            </span>
            <span className="font-headline font-bold text-sm tracking-wide">
              Generate Title
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Optimize headline for engagement and SEO ranking.
          </p>
        </button>

        <button
          onClick={onSummarize}
          className="w-full p-5 bg-surface-container-high rounded-xl text-left border border-white/5 hover:border-secondary/30 transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">
              short_text
            </span>
            <span className="font-headline font-bold text-sm tracking-wide">
              Summarize
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Condense your post into a compelling 200-character snippet.
          </p>
        </button>

        <button
          onClick={onCheckTone}
          className="w-full p-5 bg-surface-container-high rounded-xl text-left border border-white/5 hover:border-tertiary/30 transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-tertiary group-hover:scale-110 transition-transform">
              psychology
            </span>
            <span className="font-headline font-bold text-sm tracking-wide">
              Check Tone
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Analyze the emotional impact and readability level.
          </p>
        </button>
      </div>

      {/* Live Insights */}
      <div className="bg-gradient-to-br from-surface-container-high to-surface-container-highest rounded-2xl p-6 relative overflow-hidden mb-10">
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 blur-3xl rounded-full"></div>
        <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-4">
          Live Insights
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase">
              <span>Engagement Score</span>
              <span className="text-primary">84%</span>
            </div>
            <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-[84%]"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase">
              <span>Readability</span>
              <span className="text-secondary">Pro</span>
            </div>
            <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full w-[92%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Input */}
      <div className="mt-auto">
        <div className="relative">
          <textarea
            className="w-full bg-surface-container-lowest border border-white/10 rounded-xl p-4 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-0 transition-all resize-none"
            placeholder="Ask AI to refine a paragraph..."
            rows={3}
          ></textarea>
          <button className="absolute bottom-4 right-4 text-primary hover:text-primary-fixed transition-colors">
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
