import * as repository from "./mock-repository";

export const prescriptionService = {
  getPrescriptionByVisit: repository.getPrescriptionByVisit,
  searchMedications: repository.searchMedications,
  getMedicationInventory: repository.getMedicationInventory,
  saveDraft: repository.saveDraft,
  submitPrescription: repository.submitPrescription,
  getAuditEvents: repository.getAuditEvents,
};
