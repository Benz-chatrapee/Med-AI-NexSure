export type InsuranceIntelligenceSource = {
  htmlPath: string;
  title: string;
  externalScriptSrc: string;
};

export type InsuranceIntelligenceDocument = {
  styles: string;
  sidebar: Element | null;
  main: Element | null;
  appClassName: string;
  inlineScript: string;
};
