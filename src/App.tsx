import { useState } from "react";
import { AlertTriangle, CalendarClock, FileText, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/contract/Navbar";
import { Dropzone } from "@/components/contract/Dropzone";
import { LoadingAnalysis } from "@/components/contract/LoadingAnalysis";
import { RiskScorecard } from "@/components/contract/RiskScorecard";
import { RedFlagsSection } from "@/components/contract/RedFlagsSection";
import { AccountabilityMatrix } from "@/components/contract/AccountabilityMatrix";
import { NegotiationDrawer } from "@/components/contract/NegotiationDrawer";
import { extractTextFromFile } from "@/lib/pdf-extractor";
import { SAMPLE_CONTRACTS } from "@/lib/samples";
import type { ContractAnalysis, RedFlag } from "@/lib/schema";

type Stage = "idle" | "loading" | "done";

function Index() {
  const [stage, setStage] = useState<Stage>("idle");
  const [filename, setFilename] = useState("");
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFlag, setActiveFlag] = useState<RedFlag | null>(null);

  const run = async (contractText: string, name: string) => {
    setError(null);
    setFilename(name);
    setStage("loading");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText, filename: name }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Analysis failed.");
      const result = payload as ContractAnalysis;
      setAnalysis(result);
      setStage("done");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while analyzing this document.",
      );
      setStage("idle");
    }
  };

  const handleFile = async (file: File) => {
    const isSupported =
      /\.(pdf|txt)$/i.test(file.name) ||
      file.type === "application/pdf" ||
      file.type === "text/plain";
    if (!isSupported) {
      setError("Unsupported file type. Please upload a PDF or TXT contract.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("That file is larger than 15 MB. Please upload a smaller document.");
      return;
    }

    setError(null);
    setFilename(file.name);
    setStage("loading");
    try {
      const text = await extractTextFromFile(file);
      if (text.trim().length < 50) {
        throw new Error(
          "This document doesn't contain enough readable text to analyze.",
        );
      }
      await run(text, file.name);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "We couldn't read that document.",
      );
      setStage("idle");
    }
  };

  const handleSample = (id: string) => {
    const sample = SAMPLE_CONTRACTS.find((s) => s.id === id);
    if (sample) void run(sample.text, sample.filename);
  };

  const reset = () => {
    setAnalysis(null);
    setStage("idle");
    setError(null);
    setFilename("");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {stage === "idle" ? (
          <Dropzone onFile={handleFile} onSample={handleSample} error={error} />
        ) : null}

        {stage === "loading" ? <LoadingAnalysis filename={filename} /> : null}

        {stage === "done" && analysis ? (
          <div className="mx-auto w-full max-w-5xl space-y-6 px-5 py-10">
            <RiskScorecard analysis={analysis} onReset={reset} />

            <Tabs defaultValue="risk">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="risk" className="gap-1.5">
                  <AlertTriangle className="size-4" /> Risk &amp; red flags
                </TabsTrigger>
                <TabsTrigger value="accountability" className="gap-1.5">
                  <CalendarClock className="size-4" /> Accountability
                </TabsTrigger>
                <TabsTrigger value="summary" className="gap-1.5">
                  <FileText className="size-4" /> Plain English
                </TabsTrigger>
              </TabsList>

              <TabsContent value="risk" className="mt-5">
                <RedFlagsSection
                  redFlags={analysis.redFlags}
                  onNegotiate={setActiveFlag}
                />
              </TabsContent>

              <TabsContent value="accountability" className="mt-5">
                <AccountabilityMatrix analysis={analysis} />
              </TabsContent>

              <TabsContent value="summary" className="mt-5">
                <section className="paper-card px-6 py-6">
                  <h3 className="text-2xl">What this agreement really says</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    {analysis.tldrSummary}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {analysis.keyPoints.map((point, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-xs">
                          {i + 1}
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </section>
              </TabsContent>
            </Tabs>

            <NegotiationDrawer
              flag={activeFlag}
              docName={analysis.documentName}
              onOpenChange={(open) => {
                if (!open) setActiveFlag(null);
              }}
            />
          </div>
        ) : null}
      </main>

      <footer className="border-t border-border/70 py-8">
        <p className="mx-auto flex max-w-5xl items-center justify-center gap-2 px-5 text-center text-xs text-muted-foreground">
          <Lock className="size-3.5" />
          ContractLens gives informational analysis, not legal advice. Documents are
          parsed in your browser and never stored.
        </p>
      </footer>
    </div>
  );
}

export default Index;
