import { RotateCcw, FileSignature } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ContractAnalysis } from "@/lib/schema";
import { riskTone } from "@/lib/risk";

export function RiskScorecard({
  analysis,
  onReset,
}: {
  analysis: ContractAnalysis;
  onReset: () => void;
}) {
  const tone = riskTone(analysis.overallRiskScore);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - analysis.overallRiskScore / 100);

  const critical = analysis.redFlags.filter((f) => f.severity === "CRITICAL").length;
  const warning = analysis.redFlags.filter((f) => f.severity === "WARNING").length;
  const standard = analysis.redFlags.filter((f) => f.severity === "STANDARD").length;

  return (
    <section className="paper-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div className="min-w-0">
          <p className="rule-label flex items-center gap-1.5">
            <FileSignature className="size-3.5" /> Document
          </p>
          <h2 className="mt-1 truncate text-2xl">{analysis.documentName}</h2>
          <Badge variant="secondary" className="mt-2 font-normal">
            {analysis.contractType}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={onReset} className="gap-1.5">
          <RotateCcw className="size-3.5" /> Analyze another
        </Button>
      </div>

      <div className="grid gap-8 px-6 py-7 md:grid-cols-[auto_1fr] md:items-center">
        <div className="relative mx-auto size-[136px]">
          <svg viewBox="0 0 136 136" className="size-full -rotate-90">
            <circle
              cx="68"
              cy="68"
              r={radius}
              fill="none"
              stroke="var(--color-muted)"
              strokeWidth="12"
            />
            <circle
              cx="68"
              cy="68"
              r={radius}
              fill="none"
              stroke={tone.stroke}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1.1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl leading-none">
              {analysis.overallRiskScore}
            </span>
            <span className="rule-label mt-1">Risk / 100</span>
          </div>
        </div>

        <div>
          <p
            className="font-display text-3xl leading-tight"
            style={{ color: tone.stroke }}
          >
            {analysis.riskVerdict}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            {analysis.tldrSummary}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Stat label="Dealbreakers" value={critical} color="var(--risk-danger)" />
            <Stat label="Cautions" value={warning} color="var(--risk-caution)" />
            <Stat label="Standard" value={standard} color="var(--risk-safe)" />
            <Stat
              label="Tracked deadlines"
              value={analysis.accountabilityTracker.deadlines.length}
              color="var(--ink)"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-md border border-border bg-secondary/60 px-3 py-2">
      <p className="font-display text-xl leading-none" style={{ color }}>
        {value}
      </p>
      <p className="rule-label mt-1">{label}</p>
    </div>
  );
}