"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard, TrendingUp, Megaphone, Upload, MessageSquareText,
  SlidersHorizontal, PieChart, FileText,
} from "lucide-react";
import { cn } from "@/utils/cn";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/dashboard/predict", label: "Predict", icon: TrendingUp },
  { href: "/dashboard/simulator", label: "Simulator", icon: SlidersHorizontal },
  { href: "/dashboard/optimizer", label: "Budget Optimizer", icon: PieChart },
  { href: "/dashboard/upload", label: "Upload Data", icon: Upload },
  { href: "/dashboard/copilot", label: "AI Copilot", icon: MessageSquareText },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-64 flex-col justify-between glass m-3 p-4">
      <div>
        <div className="mb-8 px-2">
          <span className="text-lg font-bold gradient-text">MarketPulse AI</span>
        </div>
        <nav className="space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white",
                pathname === href && "bg-white/10 text-white"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3 px-2">
        <UserButton afterSignOutUrl="/" />
        <span className="text-xs text-white/60">Account</span>
      </div>
    </aside>
  );
}
