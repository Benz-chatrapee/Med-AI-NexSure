import type { Metadata } from "next";

import { LoginPage } from "@/features/authentication/components/login-page";

export const metadata: Metadata = {
  title: "Sign in | Med AI NexSure",
  description:
    "Secure organizational access to Med AI NexSure healthcare and insurance intelligence.",
};

export default function Page() {
  return <LoginPage />;
}
