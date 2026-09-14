import { AuthForm } from "../auth-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams;
  return <AuthForm mode="login" notice={expired ? "Your session expired. Please sign in again." : undefined} />;
}
