import type { AiClinicalSuggestion, AiSuggestionStatus } from "../types/soap.types";

export function updateSuggestionStatus(
  suggestions: AiClinicalSuggestion[],
  suggestionId: string,
  status: AiSuggestionStatus,
): AiClinicalSuggestion[] {
  return suggestions.map((suggestion) => (suggestion.id === suggestionId ? { ...suggestion, status } : suggestion));
}
