import { insuranceIntelligenceSource } from "./insurance-intelligence-content";

function loadExternalScript(src: string) {
  const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);

  if (existingScript) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.head.appendChild(script);
  });
}

export async function initializeOriginalInsuranceDashboard(inlineScript: string) {
  await loadExternalScript(insuranceIntelligenceSource.externalScriptSrc);

  const script = document.createElement("script");
  script.textContent = inlineScript;
  document.body.appendChild(script);
  document.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true }));
  script.remove();
}
