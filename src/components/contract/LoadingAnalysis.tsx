import { useEffect, useState } from "react";
import { Check, Loader2, Radar } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Extracting text from the document…",
  "Analyzing legal clauses and liability exposure…",
  "Scoring risk against fair-market terms…",
  "Synthesizing the accountability timeline…",
];

export function LoadingAnalysis({ filename }: { filename: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center px-5 py-24">
      <div className="relative flex size-32 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full border border-accent/40" />
        <span className="absolute inset-4 animate-pulse rounded-full border border-accent/60" />
        <span className="flex size-16 items-center justify-center rounded-full ink-panel">
          <Radar className="size-7 animate-spin [animation-duration:3.5s]" strokeWidth={1.5} />
        </span>
      </div>

      <h2 className="mt-8 text-3xl">Reading the fine print</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{filename}</p>

      <ul className="mt-10 w-full space-y-3">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-all duration-500",
              i < step && "border-border bg-card text-muted-foreground",
              i === step && "border-accent bg-accent/10 text-foreground shadow-paper",
              i > step && "border-transparent text-muted-foreground/50",
            )}
          >
            {i < step ? (
              <Check className="size-4 text-risk-safe" />
            ) : i === step ? (
              <Loader2 className="size-4 animate-spin text-accent" />
            ) : (
              <span className="size-4 rounded-full border border-current opacity-40" />
            )}
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}