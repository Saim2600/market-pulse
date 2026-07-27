"use client";

const PREVIEW_KPIS = [
  { label: "Predicted ROI", value: "184%" },
  { label: "Predicted CAC", value: "$42" },
  { label: "Success Probability", value: "87%" },
  { label: "Confidence", value: "91%" },
];

export function DashboardPreview() {
  return (
    <section id="dashboard-preview" className="px-6 py-20 border-t border-white/5">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-bold">See predictions before you spend a dollar</h2>
        <p className="mt-4 text-white/60">A live preview of the prediction dashboard.</p>

        <div className="mt-10 glass p-6 text-left">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-white/70">New Campaign Prediction</span>
            <span className="text-xs rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-1">Likely to succeed</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PREVIEW_KPIS.map((k) => (
              <div key={k.label} className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-white/50">{k.label}</p>
                <p className="mt-1 text-xl font-semibold gradient-text">{k.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-white/5 p-4">
            <p className="text-xs text-white/50 mb-1">AI Explanation</p>
            <p className="text-sm text-white/70">
                This campaign&apos;s high predicted ROI is driven primarily by platform choice and audience fit,
              consistent with top-performing campaigns of similar budget in this industry.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
