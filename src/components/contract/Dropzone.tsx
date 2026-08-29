import { useRef, useState } from "react";
import { FileText, Upload, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SAMPLE_CONTRACTS } from "@/lib/samples";
import { cn } from "@/lib/utils";

type Props = {
  onFile: (file: File) => void;
  onSample: (id: string) => void;
  error?: string | null;
};

export function Dropzone({ onFile, onSample, error }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="mx-auto w-full max-w-4xl px-5 pb-20 pt-14 sm:pt-20">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-paper">
          <ShieldCheck className="size-3.5 text-risk-safe" />
          Private &amp; stateless — nothing is stored on our servers
        </span>
        <h1 className="mt-6 text-balance text-5xl leading-[1.05] sm:text-6xl">
          Know exactly what you are signing.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Drop any contract, NDA, lease or offer letter. ContractLens returns a
          calibrated risk scorecard, clause-level red flags with counter-proposals,
          and an accountability matrix you can sync to your calendar.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={cn(
          "group mt-12 cursor-pointer rounded-xl border-2 border-dashed border-border bg-card/70 px-6 py-14 text-center transition-all duration-300",
          dragging
            ? "-translate-y-0.5 border-accent bg-accent/10 shadow-lift"
            : "hover:border-accent/70 hover:shadow-lift",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
        <span
          className={cn(
            "mx-auto flex size-14 items-center justify-center rounded-full ink-panel transition-transform duration-300",
            dragging ? "scale-110" : "group-hover:-translate-y-1",
          )}
        >
          <Upload className="size-6" strokeWidth={1.6} />
        </span>
        <p className="mt-5 font-display text-2xl">
          {dragging ? "Release to analyze" : "Drag & drop your contract"}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          PDF or TXT · parsed in your browser · no sign-up required
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-12">
        <p className="rule-label flex items-center gap-2">
          <Sparkles className="size-3.5 text-accent" /> Or try a sample
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SAMPLE_CONTRACTS.map((sample) => (
            <Button
              key={sample.id}
              variant="outline"
              onClick={() => onSample(sample.id)}
              className="h-auto flex-col items-start gap-1 whitespace-normal bg-card px-4 py-4 text-left shadow-paper hover:border-accent hover:bg-accent/10"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <FileText className="size-4 text-accent" />
                {sample.label}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {sample.blurb}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}