"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { soapFormSchema, type SoapSchemaValues } from "../schemas/soap.schema";
import type { SoapFormValues } from "../types/soap.types";

export function useSoapForm(defaultValues: SoapFormValues) {
  return useForm<SoapSchemaValues>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(soapFormSchema),
  });
}
