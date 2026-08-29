export function riskTone(score: number) {
  if (score >= 70) {
    return { stroke: "var(--risk-danger)", label: "Dangerous" as const };
  }
  if (score >= 40) {
    return { stroke: "var(--risk-caution)", label: "Caution" as const };
  }
  return { stroke: "var(--risk-safe)", label: "Fair" as const };
}

export function severityStyle(severity: "CRITICAL" | "WARNING" | "STANDARD") {
  switch (severity) {
    case "CRITICAL":
      return {
        color: "var(--risk-danger)",
        chip: "border-destructive/40 bg-destructive/10 text-destructive",
        title: "Dealbreaker",
      };
    case "WARNING":
      return {
        color: "var(--risk-caution)",
        chip: "border-accent/50 bg-accent/15 text-accent-foreground",
        title: "Caution",
      };
    default:
      return {
        color: "var(--risk-safe)",
        chip: "border-risk-safe/40 bg-risk-safe/10 text-risk-safe",
        title: "Standard",
      };
  }
}