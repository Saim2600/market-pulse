"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <span className="text-lg font-bold gradient-text">MarketPulse AI</span>
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#how-it-works" className="hover:text-white">How it Works</a>
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <SignedOut>
            <Link href="/sign-in"><Button variant="ghost">Sign In</Button></Link>
            <Link href="/sign-up"><Button>Get Started</Button></Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard"><Button>Go to Dashboard</Button></Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
