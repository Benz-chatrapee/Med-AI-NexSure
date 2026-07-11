import { OriginalElement } from "./insurance-intelligence-dom-renderer";

type InsuranceIntelligenceSidebarProps = {
  element: Element | null;
};

export function InsuranceIntelligenceSidebar({ element }: InsuranceIntelligenceSidebarProps) {
  return <OriginalElement element={element} />;
}
