import { Scale, ShieldCheck, ServerOff } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md ink-panel">
            <Scale className="size-4.5" strokeWidth={1.6} />
          </span>
          <div className="leading-tight">
            <p className="font-display text-xl">ContractLens</p>
            <p className="rule-label">Read the fine print</p>
          </div>
        </div>
        <div className="hidden items-center gap-5 sm:flex">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-risk-safe" /> In-browser extraction
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ServerOff className="size-3.5 text-risk-safe" /> Stateless analysis
          </span>
        </div>
      </div>
    </header>
  );
}