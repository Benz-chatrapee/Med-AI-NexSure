import type { InsuranceIntelligenceDocument } from "./insurance-intelligence-types";
import { InsuranceIntelligenceMain } from "./insurance-intelligence-main";
import { InsuranceIntelligenceSidebar } from "./insurance-intelligence-sidebar";

type InsuranceIntelligenceLayoutProps = {
  documentContent: InsuranceIntelligenceDocument;
};

export function InsuranceIntelligenceLayout({ documentContent }: InsuranceIntelligenceLayoutProps) {
  return (
    <div className={documentContent.appClassName}>
      <InsuranceIntelligenceSidebar element={documentContent.sidebar} />
      <InsuranceIntelligenceMain element={documentContent.main} />
    </div>
  );
}
