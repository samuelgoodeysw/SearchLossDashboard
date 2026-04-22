import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  variant?: "default" | "warning" | "danger" | "accent";
}

const KPICard = ({ title, value, change, changeLabel, variant = "default" }: KPICardProps) => {
  const accentBorder =
    variant === "danger" ? "border-l-danger" :
    variant === "warning" ? "border-l-warning" :
    variant === "accent" ? "border-l-primary" :
    "border-l-transparent";

  return (
    <div className={`rounded-lg border border-border bg-card p-4 border-l-[3px] ${accentBorder}`}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-1 text-xl font-semibold text-card-foreground tracking-tight">{value}</p>
      {change !== undefined && (
        <div className="mt-1.5 flex items-center gap-1 text-[11px]">
          {change > 0 ? (
            <TrendingUp className="h-3 w-3 text-success" />
          ) : (
            <TrendingDown className="h-3 w-3 text-danger" />
          )}
          <span className={change > 0 ? "text-success" : "text-danger"}>
            {change > 0 ? "+" : ""}{change}%
          </span>
          {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
};

export default KPICard;
