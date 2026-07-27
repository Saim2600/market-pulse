"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { attachAuthInterceptor } from "@/lib/api";

/**
 * Mount once near the root of the dashboard layout so every subsequent
 * apiClient call automatically carries a valid Clerk session token.
 */
export function useApiAuth() {
  const { getToken } = useAuth();
  const attached = useRef(false);

  useEffect(() => {
    if (!attached.current) {
      attachAuthInterceptor(() => getToken());
      attached.current = true;
    }
  }, [getToken]);
}
