"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { SavePrescriptionPayload, SubmitPrescriptionPayload } from "../domain/types";
import { prescriptionService } from "../server/service";

export const prescriptionKeys = {
  all: ["prescriptions"] as const,
  byVisit: (visitId: string) => [...prescriptionKeys.all, "visit", visitId] as const,
};

export const medicationKeys = {
  all: ["medications"] as const,
  search: (query: string) => [...medicationKeys.all, "search", query] as const,
  inventory: (medicationId: string) => [...medicationKeys.all, "inventory", medicationId] as const,
};

export function usePrescription(visitId: string) {
  return useQuery({
    queryKey: prescriptionKeys.byVisit(visitId),
    queryFn: ({ signal }) => prescriptionService.getPrescriptionByVisit(visitId, signal),
  });
}

export function useMedicationSearch(query: string) {
  return useQuery({
    queryKey: medicationKeys.search(query),
    queryFn: ({ signal }) => prescriptionService.searchMedications(query, signal),
    staleTime: 60_000,
  });
}

export function usePrescriptionMutations(visitId: string) {
  const queryClient = useQueryClient();

  const saveDraft = useMutation({
    mutationFn: (payload: SavePrescriptionPayload) => prescriptionService.saveDraft(payload),
    onSuccess: (detail) => {
      queryClient.setQueryData(prescriptionKeys.byVisit(visitId), detail);
    },
  });

  const submit = useMutation({
    mutationFn: (payload: SubmitPrescriptionPayload) => prescriptionService.submitPrescription(payload),
    onSuccess: (detail) => {
      queryClient.setQueryData(prescriptionKeys.byVisit(visitId), detail);
    },
  });

  return { saveDraft, submit };
}
