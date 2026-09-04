export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-[calc(100vh-0px)] items-center justify-center bg-[#f5f7f4] px-6 py-12">
      {children}
    </main>
  );
}