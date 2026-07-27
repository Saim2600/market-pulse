"use client";

export function Footer() {
  return (
    <footer className="px-6 py-10 border-t border-white/5">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-sm font-semibold gradient-text">MarketPulse AI</span>
        <p className="text-xs text-white/40">© {new Date().getFullYear()} MarketPulse AI. All rights reserved.</p>
        <div className="flex gap-6 text-xs text-white/50">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Contact</a>
        </div>
      </div>
    </footer>
  );
}
