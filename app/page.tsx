import Link from "next/link";
import { ArrowRight, Bot, DollarSign, FileDown, PieChart, Sparkles, Target, TrendingUp } from "lucide-react";
import { Wordmark } from "@/components/ui/wordmark";

const features = [
  { icon: DollarSign, title: "Expense Tracking", desc: "Every rupee in and out, categorized as it lands." },
  { icon: TrendingUp, title: "Budget Planning", desc: "Give each category a number that feels intentional." },
  { icon: Target, title: "Goal Setting", desc: "Fund goals straight from any account, atomically." },
  { icon: PieChart, title: "Portfolio Management", desc: "Stocks, crypto, funds, and gold with live P&L." },
  { icon: Bot, title: "AI Advisor", desc: "Ask anything. Grounded in your real numbers." },
  { icon: FileDown, title: "PDF Statements", desc: "Branded financial reports, generated in a click." },
];

const stats = [
  { icon: Sparkles, label: "AI-Powered" },
  { label: "Bank-grade sessions" },
  { label: "Private by default" },
];

const previewTransactions = [
  { name: "Salary Deposit", amount: "+₹3,200", positive: true },
  { name: "Coffee Shop", amount: "-₹450", positive: false },
  { name: "Grocery Store", amount: "-₹6,730", positive: false },
];

export default function Home() {
  return (
    // This page commits to the dark brand look regardless of app theme, so it pins its own grid tint.
    <div
      className="relative min-h-screen overflow-hidden bg-[#04100c] text-white"
      style={{ "--grid-line": "rgba(34,197,94,0.10)" } as React.CSSProperties}
    >
      {/* Layered background: brand gradient, neon grid, ambient glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#04100c] via-[#071b14] to-[#04100c]" />
        <div className="bg-grid absolute inset-0 opacity-70" />
        <div className="animate-pulse-glow absolute -top-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.18)_0%,transparent_70%)]" />
        <div className="animate-pulse-glow absolute top-1/3 -left-32 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.10)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-8">
          <Link href="/" aria-label="Coinly home">
            <Wordmark size="sm" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex" aria-label="Marketing navigation">
            <a href="#features" className="transition-colors hover:text-brand-400">Features</a>
            <a href="#preview" className="transition-colors hover:text-brand-400">Dashboard</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-brand-400">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-gradient-to-r from-brand-400 to-brand-600 px-4 py-2 text-sm font-semibold text-[#04100c] transition-transform hover:scale-[1.03]"
            >
              Sign up
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-10 pb-20 md:px-8 lg:grid-cols-2 lg:gap-16 lg:pt-16">
          <div className="animate-rise space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-400">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered personal finance
            </span>

            <div className="space-y-5">
              <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Take Control of Your
                <span className="mt-1 block bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">
                  Finances with
                </span>
                <Wordmark size="lg" className="mt-3" />
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
                Transform your financial future with smart tracking, AI-powered insights, and personalized budgeting
                tools designed for the modern investor.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="group glow-brand inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-7 text-base font-bold text-[#04100c] transition-transform hover:scale-[1.03]"
              >
                Get Started
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-7 text-base font-semibold text-slate-200 transition-colors hover:border-brand-400/50 hover:text-brand-400"
              >
                I already have an account
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-400">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <span key={stat.label} className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-brand-400" />}
                    {stat.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Dashboard preview */}
          <div id="preview" className="animate-rise relative scroll-mt-24 [animation-delay:150ms]">
            <div className="animate-float rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-5 shadow-2xl backdrop-blur-sm sm:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wordmark size="sm" coinOnly />
                  <span className="text-sm font-semibold text-white">Dashboard</span>
                </div>
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-400/80" />
                </div>
              </div>

              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/5 bg-white/[0.04] p-4">
                  <p className="text-2xl font-bold text-brand-400">₹24,580</p>
                  <p className="mt-1 text-xs text-slate-400">Total Balance</p>
                  <div className="mt-4 flex h-16 items-end justify-between gap-1 rounded-lg bg-gradient-to-r from-brand-500/15 to-brand-600/5 p-2">
                    {[40, 65, 45, 70, 55, 80, 60].map((height, index) => (
                      <span key={index} className="w-2 rounded-sm bg-brand-400" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.04] p-4">
                  <p className="text-2xl font-bold text-white">₹3,240</p>
                  <p className="mt-1 text-xs text-slate-400">This Month</p>
                  <div className="mt-4 flex h-16 items-center justify-center">
                    <span
                      className="flex h-16 w-16 items-center justify-center rounded-full"
                      style={{ background: "conic-gradient(#22c55e 0deg 216deg, rgba(255,255,255,0.08) 216deg 360deg)" }}
                    >
                      <span className="h-9 w-9 rounded-full bg-[#0a1a14]" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {previewTransactions.map((transaction) => (
                  <div key={transaction.name} className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          transaction.positive ? "bg-brand-400/15 text-brand-400" : "bg-red-400/15 text-red-400"
                        }`}
                      >
                        <DollarSign className="h-4 w-4" />
                      </span>
                      <span className="truncate text-sm text-white">{transaction.name}</span>
                    </div>
                    <span className={`text-sm font-semibold ${transaction.positive ? "text-brand-400" : "text-red-400"}`}>
                      {transaction.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating pills */}
            <span className="animate-float absolute -top-3 -right-2 rounded-full bg-brand-400 px-3.5 py-1.5 text-xs font-bold text-[#04100c] shadow-lg sm:-right-4 sm:text-sm">
              +15.3% ↗
            </span>
            <span className="animate-float absolute -bottom-4 -left-2 rounded-full border border-brand-400/60 bg-[#04100c] px-3.5 py-1.5 text-xs font-semibold text-brand-400 shadow-lg [animation-delay:1s] sm:-left-5 sm:text-sm">
              AI Insights Ready
            </span>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-5 pb-20 md:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-brand-400">Everything in one calm place</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Built for the way money actually moves.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/50"
                >
                  <span className="inline-flex rounded-xl bg-brand-500/10 p-2.5 text-brand-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-brand-500/20 bg-gradient-to-br from-brand-500/12 to-transparent p-8 text-center sm:p-12">
            <div className="bg-grid absolute inset-0 opacity-40" aria-hidden="true" />
            <div className="relative">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Your money, clearer — starting today.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-300">
                Set up an account in under a minute. No card, no noise, no spreadsheets.
              </p>
              <Link
                href="/register"
                className="group mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-7 text-base font-bold text-[#04100c] transition-transform hover:scale-[1.03]"
              >
                Create your account
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/5">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-7 text-sm text-slate-500 sm:flex-row md:px-8">
            <Wordmark size="sm" />
            <p>Your money, clearer.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
