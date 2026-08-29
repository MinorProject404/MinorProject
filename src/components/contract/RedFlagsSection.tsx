import { AlertTriangle, MessageSquareQuote, Quote, ShieldCheck } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { severityStyle } from "@/lib/risk";
import type { RedFlag } from "@/lib/schema";

export function RedFlagsSection({
  redFlags,
  onNegotiate,
}: {
  redFlags: RedFlag[];
  onNegotiate: (flag: RedFlag) => void;
}) {
  if (!redFlags.length) {
    return (
      <div className="paper-card flex items-center gap-3 px-6 py-8">
        <ShieldCheck className="size-5 text-risk-safe" />
        <p className="text-sm text-muted-foreground">
          No notable red flags were detected in this document.
        </p>
      </div>
    );
  }

  const order = { CRITICAL: 0, WARNING: 1, STANDARD: 2 } as const;
  const sorted = [...redFlags].sort(
    (a, b) => order[a.severity] - order[b.severity],
  );

  return (
    <Accordion type="multiple" className="space-y-3">
      {sorted.map((flag, i) => {
        const style = severityStyle(flag.severity);
        return (
          <AccordionItem
            key={flag.id || `${flag.clauseTitle}-${i}`}
            value={flag.id || `${flag.clauseTitle}-${i}`}
            className="paper-card overflow-hidden border-b"
          >
            <AccordionTrigger className="items-center px-5 py-4 hover:no-underline">
              <span className="flex flex-1 items-center gap-3 text-left">
                <span
                  className="mt-0.5 h-9 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: style.color }}
                />
                <span className="min-w-0">
                  <span className="block font-display text-lg leading-snug">
                    {flag.clauseTitle}
                  </span>
                  <span
                    className={cn(
                      "mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest",
                      style.chip,
                    )}
                  >
                    <AlertTriangle className="size-3" />
                    {flag.severity}
                  </span>
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <div className="space-y-4">
                <div>
                  <p className="rule-label flex items-center gap-1.5">
                    <Quote className="size-3" /> Original snippet
                  </p>
                  <blockquote
                    className="mt-2 border-l-2 pl-3 text-sm italic leading-relaxed text-muted-foreground"
                    style={{ borderColor: style.color }}
                  >
                    {flag.snippet}
                  </blockquote>
                </div>
                <div>
                  <p className="rule-label">Why this matters</p>
                  <p className="mt-2 text-sm leading-relaxed">
                    {flag.plainExplanation}
                  </p>
                </div>
                <Button
                  onClick={() => onNegotiate(flag)}
                  className="gap-2"
                  variant="default"
                >
                  <MessageSquareQuote className="size-4" />
                  Generate counter-proposal
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}