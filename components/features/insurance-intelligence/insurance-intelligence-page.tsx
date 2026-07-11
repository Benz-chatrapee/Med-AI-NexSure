"use client";

import { useEffect, useState } from "react";

import { insuranceIntelligenceSource } from "./insurance-intelligence-content";
import { InsuranceIntelligenceLayout } from "./insurance-intelligence-layout";
import { initializeOriginalInsuranceDashboard } from "./insurance-intelligence-scripts";
import type { InsuranceIntelligenceDocument } from "./insurance-intelligence-types";

function parseInsuranceDocument(html: string): InsuranceIntelligenceDocument {
  const parser = new DOMParser();
  const documentSource = parser.parseFromString(html, "text/html");
  const styles = Array.from(documentSource.querySelectorAll("style"))
    .map((style) => style.textContent ?? "")
    .join("\n");
  const inlineScript = Array.from(documentSource.querySelectorAll("script:not([src])"))
    .map((script) => script.textContent ?? "")
    .join("\n");

  documentSource.querySelectorAll("script").forEach((script) => script.remove());
  const app = documentSource.querySelector(".app");

  return {
    styles,
    sidebar: documentSource.querySelector(".sidebar"),
    main: documentSource.querySelector(".main"),
    appClassName: app?.className || "app",
    inlineScript,
  };
}

export function InsuranceIntelligencePage() {
  const [documentContent, setDocumentContent] = useState<InsuranceIntelligenceDocument | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOriginalDashboard() {
      try {
        const response = await fetch(insuranceIntelligenceSource.htmlPath);

        if (!response.ok) {
          throw new Error(`Unable to load original dashboard: ${response.status}`);
        }

        const html = await response.text();
        const parsedDocument = parseInsuranceDocument(html);

        if (isMounted) {
          setDocumentContent(parsedDocument);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : "Unable to load original dashboard.");
        }
      }
    }

    loadOriginalDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!documentContent?.inlineScript) return;

    let isCancelled = false;

    initializeOriginalInsuranceDashboard(documentContent.inlineScript)
      .catch((error) => {
        if (!isCancelled) {
          setLoadError(error instanceof Error ? error.message : "Unable to initialize dashboard charts.");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [documentContent]);

  if (loadError) {
    return (
      <main style={{ padding: 24 }}>
        <h1>{insuranceIntelligenceSource.title}</h1>
        <p>{loadError}</p>
      </main>
    );
  }

  if (!documentContent) {
    return (
      <main style={{ padding: 24 }}>
        <h1>{insuranceIntelligenceSource.title}</h1>
        <p>Loading original dashboard...</p>
      </main>
    );
  }

  return (
    <>
      <style>{documentContent.styles}</style>
      <InsuranceIntelligenceLayout documentContent={documentContent} />
    </>
  );
}
