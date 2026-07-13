"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { baseForm } from "../mock/payer-rule-mock-data";
import { payerRuleSchema } from "../schemas/payer-rule-schema";
import { getAffectedCases, getAiRecommendation, getAuditEvents, getImpactPreview, getPayers, getRuleSet, getRuleSets, getVersionHistory, runSimulation, updateRuleSet } from "../services/payer-rule-service";
import { getPayerRulePermissions } from "../services/permissions";
import type { PayerRuleFormValues, SimulationResult, UserRole } from "../types/payer-rule-types";

const emptySimulation: SimulationResult = {
  status: "idle",
  passedRules: [],
  failedRules: [],
  readinessScore: 0,
  coverage: "need_review",
  risk: "low",
  missingEvidence: [],
  costImpact: "Not simulated",
  humanReviewRequired: false,
};

export function usePayerRuleWorkspace() {
  const [selectedPayerId, setSelectedPayerId] = useState("payer-aia");
  const [selectedRuleSetId, setSelectedRuleSetId] = useState("rule-aia-opd");
  const [caseFilter, setCaseFilter] = useState("all");
  const [caseSearch, setCaseSearch] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [lastCalculatedAt, setLastCalculatedAt] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult>(emptySimulation);

  const role: UserRole = "product_owner";
  const permissions = useMemo(() => getPayerRulePermissions(role), [role]);

  const payersQuery = useQuery({ queryKey: ["payer-rules", "payers"], queryFn: getPayers });
  const ruleSetsQuery = useQuery({ queryKey: ["payer-rules", "rule-sets", selectedPayerId], queryFn: () => getRuleSets(selectedPayerId) });
  const ruleSetQuery = useQuery({ queryKey: ["payer-rules", "rule-set", selectedRuleSetId], queryFn: () => getRuleSet(selectedRuleSetId) });
  const recommendationQuery = useQuery({ queryKey: ["payer-rules", "ai-recommendation"], queryFn: getAiRecommendation });
  const casesQuery = useQuery({ queryKey: ["payer-rules", "cases", caseFilter], queryFn: () => getAffectedCases(caseFilter) });
  const versionQuery = useQuery({ queryKey: ["payer-rules", "versions"], queryFn: getVersionHistory });
  const auditQuery = useQuery({ queryKey: ["payer-rules", "audit"], queryFn: getAuditEvents });

  const form = useForm<PayerRuleFormValues>({
    defaultValues: baseForm,
    values: ruleSetQuery.data?.form,
    mode: "onChange",
  });

  const watchedValues = useWatch({ control: form.control });

  const impactQuery = useQuery({
    queryKey: ["payer-rules", "impact", selectedRuleSetId],
    queryFn: async () => {
      const result = await getImpactPreview(form.getValues());
      setLastCalculatedAt(new Date().toISOString());
      return result;
    },
    enabled: Boolean(ruleSetQuery.data),
  });

  const saveMutation = useMutation({
    mutationFn: updateRuleSet,
    onSuccess: (result) => {
      setLastSavedAt(result.savedAt);
      setFormMessage("Draft saved. Approval and activation still require authorized human workflow.");
      form.reset(result.values);
    },
  });

  const simulationMutation = useMutation({
    mutationFn: ({ caseId, visitId }: { caseId: string; visitId: string }) => runSimulation(caseId, visitId),
    onMutate: () => setSimulation({ ...emptySimulation, status: "running" }),
    onSuccess: (result) => setSimulation(result),
    onError: () => setSimulation({ ...emptySimulation, status: "failed" }),
  });

  const filteredCases = useMemo(() => {
    const cases = casesQuery.data ?? [];
    const search = caseSearch.trim().toLowerCase();
    if (!search) return cases;
    return cases.filter((item) => [item.hn, item.visitId, item.payer, item.ruleSet].some((value) => value.toLowerCase().includes(search)));
  }, [caseSearch, casesQuery.data]);

  function selectPayer(payerId: string, ruleSetId: string) {
    if (form.formState.isDirty && !window.confirm("Unsaved changes exist. Switch payer or rule set and discard local draft changes?")) return;
    setSelectedPayerId(payerId);
    setSelectedRuleSetId(ruleSetId);
    setFormMessage(null);
  }

  async function saveDraft() {
    const values = form.getValues();
    const validation = payerRuleSchema.safeParse(values);
    if (!validation.success) {
      setFormMessage(validation.error.issues[0]?.message ?? "Validation failed.");
      setActiveTab("profile");
      return;
    }
    const highImpact = values.icdRules.missingIcdAction === "block" || values.coverageRules.defaultStatus === "not_covered" || values.costRules.blockThreshold !== ruleSetQuery.data?.form.costRules.blockThreshold;
    if (highImpact && !window.confirm("High-impact governance changes require review. Continue saving draft only?")) return;
    await saveMutation.mutateAsync(validation.data);
  }

  function applyRecommendationToDraft() {
    if (!window.confirm("Apply AI recommendation to the local draft only? This will not save, activate, or approve rules.")) return;
    form.setValue("costRules.alertThreshold", 3000, { shouldDirty: true, shouldValidate: true });
    form.setValue("costRules.blockThreshold", 8000, { shouldDirty: true, shouldValidate: true });
    form.setValue("coverageRules.requiredEvidence", ["Medical Certificate", "Attachment", "Cost Justification"], { shouldDirty: true, shouldValidate: true });
    setFormMessage("AI recommendation applied to local draft only. Human review is required.");
  }

  return {
    activeTab,
    applyRecommendationToDraft,
    auditQuery,
    caseFilter,
    caseSearch,
    casesQuery,
    filteredCases,
    form,
    formMessage,
    impactQuery,
    lastCalculatedAt,
    lastSavedAt,
    payersQuery,
    permissions,
    recommendationQuery,
    ruleSetQuery,
    ruleSetsQuery,
    saveDraft,
    saveMutation,
    selectPayer,
    selectedPayerId,
    selectedRuleSetId,
    setActiveTab,
    setCaseFilter,
    setCaseSearch,
    setFormMessage,
    setSelectedRuleSetId,
    setSimulationOpen,
    simulation,
    simulationMutation,
    simulationOpen,
    versionQuery,
    watchedValues,
  };
}
