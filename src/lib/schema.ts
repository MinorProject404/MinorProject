import { z } from "zod";

export const ContractAnalysisSchema = z.object({
  documentName: z.string(),
  contractType: z.enum([
    "Freelance / Client Agreement",
    "Employment / Internship Offer",
    "Rental / Lease Agreement",
    "Non-Disclosure Agreement (NDA)",
    "SaaS / Terms of Service",
    "Other Commercial Contract",
  ]),
  overallRiskScore: z.number().min(0).max(100),
  riskVerdict: z.enum(["FAIR", "MODERATE RISK", "HIGH HAZARD / UNBALANCED"]),
  tldrSummary: z.string(),
  keyPoints: z.array(z.string()).default([]),
  redFlags: z.array(
    z.object({
      id: z.string(),
      clauseTitle: z.string(),
      severity: z.enum(["CRITICAL", "WARNING", "STANDARD"]),
      snippet: z.string(),
      plainExplanation: z.string(),
      negotiationRecommendation: z.string(),
      counterProposalEmail: z.string().optional(),
    }),
  ),
  accountabilityTracker: z.object({
    deadlines: z.array(
      z.object({
        title: z.string(),
        timelineOrDate: z.string(),
        responsibleParty: z.enum(["User", "Client / Landlord", "Mutual"]),
        penaltyOrConsequence: z.string().optional(),
      }),
    ),
    userObligations: z.array(z.string()),
    counterpartyObligations: z.array(z.string()),
    financialTerms: z.object({
      compensationOrRent: z.string(),
      paymentStructure: z.string(),
      hiddenCostsOrDeductions: z.string(),
    }),
  }),
});

export type ContractAnalysis = z.infer<typeof ContractAnalysisSchema>;
export type RedFlag = ContractAnalysis["redFlags"][number];
export type Deadline =
  ContractAnalysis["accountabilityTracker"]["deadlines"][number];