import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-white/80">
        Log in with Auth0. If you need an account, choose sign up on the login screen.
      </p>
      <Link
        href="/auth/login?screen_hint=signup&returnTo=/negotiation"
        className="inline-flex w-full items-center justify-center rounded-md bg-white px-4 py-3 text-sm font-semibold text-[#080705] transition hover:bg-white/90"
      >
        Sign up
      </Link>
      <Link
        href="/auth/login?returnTo=/negotiation"
        className="inline-flex w-full items-center justify-center rounded-md border border-white/25 px-4 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-[#080705]"
      >
        Log in
      </Link>
      <div className="text-sm text-white/60">
        <Link href="/" className="underline decoration-white/30 hover:decoration-white">
          ← Back to landing
        </Link>
      </div>
    </div>
  );
}
