import { describe, expect, test } from "vitest";

import { globalSearchResults } from "../data/global-search.mock";
import { filterGlobalSearchResults } from "./global-search-selectors";

describe("global search selectors", () => {
  test("filters accessible results by query across titles and metadata", () => {
    const result = filterGlobalSearchResults(globalSearchResults, "CLM-2026-00549", "all");

    expect(result).toHaveLength(1);
    expect(result[0].entity).toBe("claim");
  });

  test("keeps Evidence and Audit records together for the prototype other category", () => {
    const result = filterGlobalSearchResults(globalSearchResults, "", "other");

    expect(result.map((item) => item.entity)).toEqual(["evidence", "audit"]);
  });
});
