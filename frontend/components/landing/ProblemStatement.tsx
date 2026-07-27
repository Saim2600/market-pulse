"use client";

const PAIN_POINTS = [
  { stat: "63%", label: "of marketers can't confidently predict campaign ROI before launch" },
  { stat: "$4.2T", label: "spent globally on marketing each year, much of it on guesswork" },
  { stat: "30%+", label: "average budget waste from underperforming, unmonitored campaigns" },
];

export function ProblemStatement() {
  return (
    <section className="px-6 py-20 border-t border-white/5">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-bold">Marketing budgets are still a guessing game</h2>
        <p className="mt-4 text-white/60 max-w-2xl mx-auto">
          Teams launch campaigns on intuition, wait weeks for results, and only find out
          what worked after the budget is already spent.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PAIN_POINTS.map((p) => (
            <div key={p.label} className="glass p-6">
              <p className="text-3xl font-bold gradient-text">{p.stat}</p>
              <p className="mt-2 text-sm text-white/60">{p.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
