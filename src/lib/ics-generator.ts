import { createEvents, type EventAttributes } from "ics";
import type { Deadline } from "./schema";

function resolveDate(raw: string, index: number): [number, number, number, number, number] {
  const explicit = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (explicit) {
    return [Number(explicit[1]), Number(explicit[2]), Number(explicit[3]), 10, 0];
  }

  const relative = raw.match(/(\d{1,3})\s*(day|week|month)/i);
  let offsetDays = 7 * (index + 1);
  if (relative && relative[1] && relative[2]) {
    const n = Number(relative[1]);
    const unit = relative[2].toLowerCase();
    offsetDays = unit === "day" ? n : unit === "week" ? n * 7 : n * 30;
  }

  const target = new Date();
  target.setDate(target.getDate() + offsetDays);
  return [
    target.getFullYear(),
    target.getMonth() + 1,
    target.getDate(),
    10,
    0,
  ];
}

export function exportDeadlinesToICS(deadlines: Deadline[], docName: string) {
  if (!deadlines.length) return;

  const events: EventAttributes[] = deadlines.map((d, i) => ({
    title: `[ContractLens] ${d.title}`,
    description: [
      `Contract: ${docName}`,
      `Requirement: ${d.timelineOrDate}`,
      `Owner: ${d.responsibleParty}`,
      `Consequence: ${d.penaltyOrConsequence || "None stated"}`,
    ].join("\n"),
    start: resolveDate(d.timelineOrDate, i),
    duration: { hours: 1 },
    status: "CONFIRMED",
    busyStatus: "BUSY",
    alarms: [{ action: "display", trigger: { days: 2, before: true } }],
  }));

  createEvents(events, (error, value) => {
    if (error || !value) {
      console.error(error);
      return;
    }
    const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${docName.replace(/\.[^/.]+$/, "") || "contract"}-deadlines.ics`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}