"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}

export function KpiCard({ label, value, delta, positive }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-5"
    >
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold gradient-text">{value}</p>
      {delta && (
        <p className={cn("mt-1 text-xs", positive ? "text-emerald-400" : "text-rose-400")}>
          {delta}
        </p>
      )}
    </motion.div>
  );
}
