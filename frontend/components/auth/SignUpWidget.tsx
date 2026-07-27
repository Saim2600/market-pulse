"use client";

import { SignUp } from "@clerk/nextjs";

import { clerkAppearance } from "@/components/auth/clerkAppearance";

export function SignUpWidget() {
  return <SignUp appearance={clerkAppearance} />;
}
