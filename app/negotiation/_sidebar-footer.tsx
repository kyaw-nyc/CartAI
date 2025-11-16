import Link from "next/link";

export function SidebarFooter() {
  return (
    <div className="space-y-2 border-t border-white/10 p-4">
      <Link
        href="/"
        className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-white/60 transition hover:text-white"
      >
        <span>← Back to Home</span>
      </Link>
      <Link
        href="/logout"
        className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-white/60 transition hover:text-white"
      >
        <span>Sign out</span>
      </Link>
    </div>
  );
}
