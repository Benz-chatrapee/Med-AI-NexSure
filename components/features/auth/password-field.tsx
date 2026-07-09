"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasswordFieldProps = {
  id: string;
};

export function PasswordField({ id }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <span className="input-icon" aria-hidden="true">
        Lock
      </span>
      <Input
        id={id}
        type={isVisible ? "text" : "password"}
        aria-label="Password"
        className="form-input pr-12"
        placeholder="Password"
      />
      <Button
        aria-label={isVisible ? "Hide password" : "Show password"}
        onClick={() => setIsVisible((current) => !current)}
        className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-500 transition hover:bg-[#EFF6FF] hover:text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
      >
        <span aria-hidden="true">{isVisible ? "Hide" : "View"}</span>
      </Button>
    </div>
  );
}
