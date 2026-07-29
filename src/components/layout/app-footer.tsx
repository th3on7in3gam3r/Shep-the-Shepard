import Link from "next/link";
import { APP_NAME, FEEDBACK_EMAIL } from "@/lib/constants";

const links = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/journal", label: "Journal" },
  { href: "/saved", label: "Saved" },
  { href: "/settings", label: "Settings" },
] as const;

export function AppFooter() {
  return (
    <footer className="border-t border-border/60 py-6 text-center">
      <nav
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
        aria-label="Footer"
      >
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="hover:text-shepherd-sage hover:underline"
          >
            {label}
          </Link>
        ))}
      </nav>
      <p className="mt-3 text-[11px] text-muted-foreground/80">
        {APP_NAME} · Questions?{" "}
        <a
          href={`mailto:${FEEDBACK_EMAIL}`}
          className="text-shepherd-sage hover:underline"
        >
          {FEEDBACK_EMAIL}
        </a>
      </p>
    </footer>
  );
}
