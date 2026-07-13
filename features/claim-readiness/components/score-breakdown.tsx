import type { ReadinessScore } from "../domain/types";
import { dimensionLabels } from "./format";

const dimensions = [
  "evidenceCompleteness",
  "soapCompleteness",
  "icdValidity",
  "medicalNecessity",
  "payerRejectionRisk",
] as const;

export function ScoreBreakdown({ score }: { score: ReadinessScore }) {
  return (
    <div className="space-y-4">
      {dimensions.map((dimension) => (
        <div key={dimension} className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-slate-700">
              {dimensionLabels[dimension]}
            </span>
            <span className="tabular-nums text-slate-600">{score[dimension]}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-sky-600"
              style={{ width: `${score[dimension]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
