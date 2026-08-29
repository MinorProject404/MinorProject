import { useState } from "react";
import { Check, Copy, Handshake } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { RedFlag } from "@/lib/schema";

function buildEmail(flag: RedFlag, docName: string) {
  return (
    flag.counterProposalEmail ??
    `Hi,

Thanks for sending over the ${docName}. Overall it looks workable — I have one change I'd need before signing.

Section: ${flag.clauseTitle}
Current terms: ${flag.snippet}

Why it doesn't work for me: ${flag.plainExplanation}

Proposed revision: ${flag.negotiationRecommendation}

Happy to sign as soon as that's updated. Thanks!`
  );
}

function buildSlack(flag: RedFlag) {
  return `Quick one on the contract — the "${flag.clauseTitle}" clause needs adjusting before I can sign. ${flag.plainExplanation} Proposal: ${flag.negotiationRecommendation}`;
}

export function NegotiationDrawer({
  flag,
  docName,
  onOpenChange,
}: {
  flag: RedFlag | null;
  docName: string;
  onOpenChange: (open: boolean) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  };

  return (
    <Sheet open={!!flag} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {flag ? (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-display text-2xl">
                <Handshake className="size-5 text-accent" />
                Counter-proposal
              </SheetTitle>
              <SheetDescription>{flag.clauseTitle}</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-4 pb-10">
              <div>
                <p className="rule-label">Recommended redline</p>
                <p className="mt-2 rounded-md border border-border bg-secondary/60 p-3 text-sm leading-relaxed">
                  {flag.negotiationRecommendation}
                </p>
              </div>

              <Separator />

              <Block
                title="Email script"
                text={buildEmail(flag, docName)}
                copied={copied === "email"}
                onCopy={() => copy("email", buildEmail(flag, docName))}
              />

              <Block
                title="Slack / DM version"
                text={buildSlack(flag)}
                copied={copied === "slack"}
                onCopy={() => copy("slack", buildSlack(flag))}
              />
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Block({
  title,
  text,
  copied,
  onCopy,
}: {
  title: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="rule-label">{title}</p>
        <Button size="sm" variant="outline" onClick={onCopy} className="gap-1.5">
          {copied ? <Check className="size-3.5 text-risk-safe" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="mt-2 whitespace-pre-wrap rounded-md border border-border bg-card p-3 font-sans text-sm leading-relaxed shadow-paper">
        {text}
      </pre>
    </div>
  );
}