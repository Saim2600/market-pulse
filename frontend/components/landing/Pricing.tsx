"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const TIERS = [
  { name: "Starter", price: "TBD", desc: "For small teams getting started with predictive marketing." },
  { name: "Growth", price: "TBD", desc: "For teams managing multiple campaigns across channels." },
  { name: "Enterprise", price: "Contact us", desc: "Custom models, SSO, and dedicated support." },
];

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-20 border-t border-white/5">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-3xl font-bold">Pricing</h2>
        <p className="mt-2 text-white/60">Coming soon — join the waitlist to get early access pricing.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <div key={t.name} className="glass p-8 flex flex-col">
              <h3 className="font-semibold">{t.name}</h3>
              <p className="mt-4 text-3xl font-bold gradient-text">{t.price}</p>
              <p className="mt-3 text-sm text-white/60 flex-1">{t.desc}</p>
              <Link href="/sign-up" className="mt-6">
                <Button variant="outline" className="w-full">Join Waitlist</Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
