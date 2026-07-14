import type { CreateUserFormValues } from "../types/user-management.types";

export function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function getLocalIsoDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function getInitials(firstName: string, lastName: string) {
  const initials = `${firstName.trim()[0] ?? ""}${lastName.trim()[0] ?? ""}`.toUpperCase();
  return initials || "NU";
}

export function calculateCompletion(values: CreateUserFormValues) {
  const needsLicense = values.primaryRole === "doctor" || values.primaryRole === "pharmacist";
  const checks = [
    values.firstName.trim().length >= 2,
    values.lastName.trim().length >= 2,
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email),
    Boolean(values.organizationId),
    Boolean(values.clinicId),
    Boolean(values.primaryRole),
    !needsLicense || Boolean(values.licenseNumber.trim()),
    Boolean(values.effectiveDate),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
