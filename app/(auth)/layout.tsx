import Link from "next/link";
import { Wordmark } from "@/components/ui/wordmark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f5f7f4] px-6 py-12 dark:bg-[#04100c]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0 opacity-60" />
        <div className="animate-pulse-glow absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.14)_0%,transparent_70%)]" />
      </div>
      <Link href="/" className="relative mb-8" aria-label="Coinly home">
        <Wordmark size="md" />
      </Link>
      <div className="relative w-full max-w-md">{children}</div>
    </main>
  );
}
