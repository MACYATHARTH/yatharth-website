"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Shield, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";
import { adminLoginAction } from "@/app/admin/actions";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    startTransition(async () => {
      const res = await adminLoginAction({
        username: username.trim(),
        password,
      });

      if (res.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Invalid username or password.");
      }
    });
  };

  return (
    <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/90 backdrop-blur-md p-8 sm:p-10 rounded-xs shadow-2xl space-y-6">
      {/* Return to website link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Festival Website</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] text-[10px] font-mono uppercase tracking-widest text-[var(--theme-text-muted)] rounded-xs">
          <Shield className="w-3 h-3 text-[var(--theme-accent)]" />
          <span>Restricted Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight font-varsity text-[var(--theme-text-primary)]">
          CMS Authentication
        </h1>
        <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
          Authorized festival coordinators and faculty advisors may log in to manage events, announcements, and festival configurations.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 border border-rose-500/40 bg-rose-950/20 text-rose-300 rounded-xs text-xs flex items-center gap-2.5 font-mono animate-shake"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
        <div className="space-y-1.5">
          <label
            htmlFor="username"
            className="block uppercase tracking-wider text-[var(--theme-text-muted)] font-semibold text-[11px]"
          >
            Administrator ID / Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            autoFocus
            disabled={isPending}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. admin"
            className="w-full px-3.5 py-2.5 bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] text-sm text-[var(--theme-text-primary)] placeholder-[var(--theme-text-muted)] rounded-xs focus:border-[var(--theme-accent)] focus:outline-none transition-colors disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block uppercase tracking-wider text-[var(--theme-text-muted)] font-semibold text-[11px]"
          >
            Access Key / Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            disabled={isPending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-3.5 py-2.5 bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] text-sm text-[var(--theme-text-primary)] placeholder-[var(--theme-text-muted)] rounded-xs focus:border-[var(--theme-accent)] focus:outline-none transition-colors disabled:opacity-50"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-[#8F3025] hover:bg-[#5C211C] text-white font-bold text-xs uppercase tracking-widest rounded-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {isPending ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Verify &amp; Enter CMS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Security notice footer */}
      <div className="pt-4 border-t border-[var(--theme-border)] text-[10px] font-mono text-[var(--theme-text-muted)] text-center leading-relaxed">
        <p>YATHARTH • Department of Journalism, Maharaja Agrasen College</p>
        <p className="opacity-70 mt-0.5">All administrative access attempts are cryptographically verified.</p>
      </div>
    </div>
  );
}
