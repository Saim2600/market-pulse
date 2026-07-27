"use client";

const TESTIMONIALS = [
  { name: "Marketing Director, SaaS startup", quote: "We stopped guessing which channel to fund and started using the success probability score for every launch decision." },
  { name: "Growth Lead, Retail brand", quote: "The budget optimizer alone paid for itself in the first month by reallocating spend away from an underperforming channel." },
  { name: "Analyst, Healthcare marketing team", quote: "Explainable AI made it easy to get buy-in from leadership — the numbers come with a reason, not just a black box." },
];

export function Testimonials() {
  return (
    <section className="px-6 py-20 border-t border-white/5">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center">Trusted by data-driven marketing teams</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="glass p-6">
              <p className="text-sm text-white/80 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 text-xs text-white/50">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
