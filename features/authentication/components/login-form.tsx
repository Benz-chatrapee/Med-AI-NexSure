"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  Eye,
  EyeOff,
  Hospital,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  loginDefaultValues,
  loginSchema,
  type LoginFormValues,
} from "../schemas/login-schema";
import styles from "./login.module.css";

export interface LoginFormProps {
  onSubmit?: (values: LoginFormValues) => Promise<void>;
  initialError?: string;
}

export function LoginForm({
  onSubmit = async () => undefined,
  initialError,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(initialError ?? "");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaultValues,
  });

  async function submit(values: LoginFormValues) {
    setServerError("");
    try {
      await onSubmit(values);
    } catch {
      setServerError("ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบอีเมลและรหัสผ่าน");
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
      {serverError ? (
        <div className={styles.formAlert} role="alert">
          {serverError}
        </div>
      ) : null}

      <Field
        id="organization"
        label="Organization"
        helper={errors.organization?.message}
        icon={<Building2 aria-hidden="true" size={20} />}
      >
        <input
          id="organization"
          autoComplete="organization"
          placeholder="e.g. NexSure Medical Group"
          {...register("organization")}
        />
      </Field>

      <Field
        id="clinic"
        label="Clinic / Department"
        helper={errors.clinic?.message}
        icon={<Hospital aria-hidden="true" size={20} />}
      >
        <input
          id="clinic"
          autoComplete="organization-title"
          placeholder="Central Clinic Office"
          {...register("clinic")}
        />
      </Field>

      <Field
        id="email"
        label="Professional Email"
        helper={errors.email?.message}
        icon={<Mail aria-hidden="true" size={20} />}
      >
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="name@organization.com"
          {...register("email")}
        />
      </Field>

      <Field
        id="password"
        label="Password"
        helper={errors.password?.message}
        icon={<LockKeyhole aria-hidden="true" size={20} />}
        trailing={
          <button
            className={styles.passwordToggle}
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" size={20} />
            ) : (
              <Eye aria-hidden="true" size={20} />
            )}
          </button>
        }
      >
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••"
          {...register("password")}
        />
      </Field>

      <div className={styles.formOptions}>
        <label className={styles.remember}>
          <input type="checkbox" {...register("rememberMe")} />
          <span>Remember Device</span>
        </label>

        <Link href="/forgot-password">Forgot Password?</Link>
      </div>

      <button
        className={styles.primaryButton}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <LoaderCircle
              className={styles.spinner}
              aria-hidden="true"
              size={20}
            />
            Signing in...
          </>
        ) : (
          "Enter Workspace"
        )}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  helper,
  icon,
  trailing,
  children,
}: {
  id: string;
  label: string;
  helper?: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.inputShell}>
        <span className={styles.inputIcon}>{icon}</span>
        {children}
        {trailing}
      </div>
      {helper ? <p className={styles.fieldError}>{helper}</p> : null}
    </div>
  );
}
