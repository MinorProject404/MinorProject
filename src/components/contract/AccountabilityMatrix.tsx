import { useState } from "react";
import {
  CalendarPlus,
  CircleDollarSign,
  Clock,
  Receipt,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportDeadlinesToICS } from "@/lib/ics-generator";
import { cn } from "@/lib/utils";
import type { ContractAnalysis } from "@/lib/schema";

export function AccountabilityMatrix({
  analysis,
}: {
  analysis: ContractAnalysis;
}) {
  const { deadlines, userObligations, counterpartyObligations, financialTerms } =
    analysis.accountabilityTracker;
  const [done, setDone] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setDone((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6">
      <section className="paper-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h3 className="flex items-center gap-2 text-xl">
            <Clock className="size-4.5 text-accent" /> Deadlines &amp; notice windows
          </h3>
          <Button
            size="sm"
            onClick={() => exportDeadlinesToICS(deadlines, analysis.documentName)}
            disabled={!deadlines.length}
            className="gap-1.5"
          >
            <CalendarPlus className="size-4" /> Export to calendar (.ics)
          </Button>
        </div>
        {deadlines.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Obligation</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>If missed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deadlines.map((d, i) => (
                <TableRow key={`${d.title}-${i}`}>
                  <TableCell className="font-medium">{d.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {d.timelineOrDate}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={d.responsibleParty === "User" ? "default" : "secondary"}
                      className="font-normal"
                    >
                      {d.responsibleParty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {d.penaltyOrConsequence || "Not stated"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="px-5 py-6 text-sm text-muted-foreground">
            No explicit deadlines were found in this document.
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ObligationList
          title="Your obligations"
          items={userObligations}
          accent="var(--risk-danger)"
          done={done}
          onToggle={toggle}
          prefix="you"
        />
        <ObligationList
          title="Counterparty obligations"
          items={counterpartyObligations}
          accent="var(--risk-safe)"
          done={done}
          onToggle={toggle}
          prefix="them"
        />
      </div>

      <section className="paper-card px-5 py-5">
        <h3 className="flex items-center gap-2 text-xl">
          <CircleDollarSign className="size-4.5 text-accent" /> Financial terms
        </h3>
        <Separator className="my-4" />
        <dl className="grid gap-4 sm:grid-cols-3">
          <Money
            icon={<Wallet className="size-4" />}
            label="Compensation / rent"
            value={financialTerms.compensationOrRent}
          />
          <Money
            icon={<Clock className="size-4" />}
            label="Payment structure"
            value={financialTerms.paymentStructure}
          />
          <Money
            icon={<Receipt className="size-4" />}
            label="Hidden costs & deductions"
            value={financialTerms.hiddenCostsOrDeductions}
          />
        </dl>
      </section>
    </div>
  );
}

function ObligationList({
  title,
  items,
  accent,
  done,
  onToggle,
  prefix,
}: {
  title: string;
  items: string[];
  accent: string;
  done: Record<string, boolean>;
  onToggle: (key: string) => void;
  prefix: string;
}) {
  const completed = items.filter((_, i) => done[`${prefix}-${i}`]).length;

  return (
    <section className="paper-card px-5 py-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="flex items-center gap-2 text-xl">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: accent }}
          />
          {title}
        </h3>
        <span className="rule-label">
          {completed}/{items.length} done
        </span>
      </div>
      <ul className="mt-4 space-y-2.5">
        {items.length ? (
          items.map((item, i) => {
            const key = `${prefix}-${i}`;
            return (
              <li key={key} className="flex items-start gap-3">
                <Checkbox
                  id={key}
                  checked={!!done[key]}
                  onCheckedChange={() => onToggle(key)}
                  className="mt-0.5"
                />
                <label
                  htmlFor={key}
                  className={cn(
                    "cursor-pointer text-sm leading-relaxed transition-colors",
                    done[key] && "text-muted-foreground line-through",
                  )}
                >
                  {item}
                </label>
              </li>
            );
          })
        ) : (
          <li className="text-sm text-muted-foreground">None identified.</li>
        )}
      </ul>
    </section>
  );
}

function Money({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-secondary/50 px-4 py-3">
      <dt className="rule-label flex items-center gap-1.5">
        {icon}
        {label}
      </dt>
      <dd className="mt-1.5 text-sm leading-relaxed">{value}</dd>
    </div>
  );
}