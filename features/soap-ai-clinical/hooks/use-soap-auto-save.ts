"use client";

import { useEffect, useState } from "react";

export type AutoSaveState = "saved" | "unsaved" | "saving" | "failed";

export function useSoapAutoSave(watchValue: string) {
  const [state, setState] = useState<AutoSaveState>("saved");
  const [savedAt, setSavedAt] = useState("14:41");

  useEffect(() => {
    if (!watchValue) return;
    setState("unsaved");
    const saving = window.setTimeout(() => setState("saving"), 500);
    const saved = window.setTimeout(() => {
      setState("saved");
      setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    }, 1100);
    return () => {
      window.clearTimeout(saving);
      window.clearTimeout(saved);
    };
  }, [watchValue]);

  return { state, savedAt, setState };
}
