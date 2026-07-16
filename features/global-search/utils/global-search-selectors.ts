import type { GlobalSearchCategory, GlobalSearchResult } from "../types";

export function filterGlobalSearchResults(results: GlobalSearchResult[], query: string, category: GlobalSearchCategory) {
  const normalizedQuery = query.trim().toLowerCase();

  return results.filter((result) => {
    const matchesCategory = category === "all" || (category === "other" ? result.entity === "evidence" || result.entity === "audit" : result.entity === category);
    const matchesQuery = !normalizedQuery || result.searchText.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });
}
