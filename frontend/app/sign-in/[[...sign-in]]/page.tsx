import { SignInWidget } from "@/components/auth/SignInWidget";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,_rgba(99,102,241,0.18),_transparent_35%),radial-gradient(circle_at_90%_20%,_rgba(34,211,238,0.12),_transparent_35%),#05060a] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:grid-cols-[1.2fr_1fr] lg:p-12">
        <div className="flex flex-col justify-center gap-6 text-white">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cyan-100/90">
            <span className="h-2 w-2 rounded-full bg-cyan-400" /> Secure sign in
          </div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Welcome back to <span className="gradient-text">MarketPulse AI</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm text-white/70 sm:text-base">
              Sign in to access campaign intelligence, predictions, and automated report generation.
              If you don’t have an account yet, create one in seconds and start uploading your marketing dataset.
            </p>
          </div>
          <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/40 p-6 text-sm text-white/70 shadow-[0_15px_40px_rgba(0,0,0,0.25)]">
            <div className="space-y-2">
              <p className="font-medium text-white">Need help signing in?</p>
              <p className="leading-6">Use your Clerk account credentials or continue with your preferred OAuth provider.</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 text-xs uppercase tracking-[0.18em] text-cyan-200/80">
              Tip: for the fastest experience, sign up once and re-use your account across sessions.
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.3)]">
          <SignInWidget />
        </div>
      </div>
    </div>
  );
}
