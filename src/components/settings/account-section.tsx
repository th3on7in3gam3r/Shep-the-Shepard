"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Cloud, Loader2, LogOut, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabaseAuth } from "@/components/providers/supabase-provider";

export function AccountSection() {
  const { configured, user, loading, signInWithEmail, signOut } = useSupabaseAuth();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("auth") === "error") {
      setError("Sign-in link expired or was invalid. Please try again.");
    }
  }, [searchParams]);

  if (!configured) {
    return (
      <p className="text-xs text-muted-foreground">
        Cloud backup is not configured on this deployment. Data stays on this device.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Checking account…
      </div>
    );
  }

  if (user) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 rounded-xl bg-shepherd-meadow/20 px-3 py-2.5">
          <Cloud className="mt-0.5 size-4 shrink-0 text-shepherd-sage" />
          <div className="min-w-0">
            <p className="text-sm font-medium">Signed in</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Your account is connected. Full cloud sync for chat, journal, and favorites is
          coming next — local data still works offline on this device.
        </p>
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await signOut();
            setBusy(false);
            setMessage(null);
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Sign in with a magic link to save your journey across devices. Your data stays on
        this phone until cloud sync rolls out.
      </p>
      <form
        className="space-y-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          setMessage(null);
          const result = await signInWithEmail(email);
          setBusy(false);
          if (result.error) {
            setError(result.error);
          } else {
            setMessage("Check your email for a sign-in link.");
          }
        }}
      >
        <div className="flex gap-2">
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-sm"
          />
          <Button
            type="submit"
            disabled={busy || !email.trim()}
            className="shrink-0 bg-shepherd-sage hover:bg-shepherd-sage/90"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
            Send link
          </Button>
        </div>
      </form>
      {message && <p className="text-xs text-shepherd-sage">{message}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
