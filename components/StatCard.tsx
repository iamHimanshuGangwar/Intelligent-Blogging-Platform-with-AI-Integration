"use client";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  change?: string;
  changeColor?: "green" | "blue" | "default";
}

export default function StatCard({
  icon,
  label,
  value,
  change,
  changeColor = "green",
}: StatCardProps) {
  const changeColorMap = {
    green: "text-green-400",
    blue: "text-blue-400",
    default: "text-gray-400",
  };

  return (
    <div className="glass-card rounded-2xl p-8 transition-transform hover:scale-[1.02] duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-xl ${
          changeColor === "green" ? "bg-primary/10" :
          changeColor === "blue" ? "bg-secondary/10" :
          "bg-tertiary/10"
        }`}>
          <span className={`material-symbols-outlined ${
            changeColor === "green" ? "text-primary" :
            changeColor === "blue" ? "text-secondary" :
            "text-tertiary"
          }`}>
            {icon}
          </span>
        </div>
        <span className="text-xs font-label tracking-widest text-on-surface-variant uppercase">
          {label}
        </span>
      </div>
      <div className="flex items-end gap-3">
        <h3 className="text-4xl font-bold font-headline">{value}</h3>
        {change && (
          <span className={`text-sm font-bold mb-1 ${changeColorMap[changeColor]}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
