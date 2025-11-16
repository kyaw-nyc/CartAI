import Link from "next/link";
import { BasicAuthForm } from "@/components/auth/basic-auth-form";
import SpinningCube from "@/components/visuals/spinning-cube";

export default function SignupPage() {
  return (
    <main className="grid min-h-screen w-full grid-cols-1 bg-black text-white md:grid-cols-2">
      <div className="flex flex-col items-center justify-center gap-8 px-8 py-12 md:px-14 md:py-16">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">Create your CartAI account</h1>
            <p className="text-sm text-white/70">
              Sign up with email and password to start a negotiation.
            </p>
          </div>
          <BasicAuthForm defaultMode="signup" />
          <Link href="/" className="text-sm text-white/60 underline decoration-white/30 hover:decoration-white">
            ← Back to landing
          </Link>
        </div>
      </div>

      <div className="relative hidden items-center justify-center bg-black/80 px-6 md:flex">
        <SpinningCube />
      </div>
    </main>
  );
}
