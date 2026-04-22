import { AlertTriangle, Info } from "lucide-react";

interface InsightNoteProps {
  text: string;
  variant?: "info" | "warning";
}

const InsightNote = ({ text, variant = "info" }: InsightNoteProps) => {
  const Icon = variant === "warning" ? AlertTriangle : Info;
  const borderColor = variant === "warning" ? "border-l-warning" : "border-l-primary/50";
  const iconColor = variant === "warning" ? "text-warning" : "text-primary";

  return (
    <div className={`rounded-md border border-border bg-secondary/50 p-3 border-l-[3px] ${borderColor}`}>
      <div className="flex gap-2">
        <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${iconColor}`} />
        <p className="text-[12px] leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </div>
  );
};

export default InsightNote;
