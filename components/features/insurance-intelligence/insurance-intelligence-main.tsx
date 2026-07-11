import { OriginalElement } from "./insurance-intelligence-dom-renderer";

type InsuranceIntelligenceMainProps = {
  element: Element | null;
};

export function InsuranceIntelligenceMain({ element }: InsuranceIntelligenceMainProps) {
  return <OriginalElement element={element} />;
}
