"use client";

import { SignIn } from "@clerk/nextjs";

import { clerkAppearance } from "@/components/auth/clerkAppearance";

export function SignInWidget() {
  return <SignIn appearance={clerkAppearance} />;
}
