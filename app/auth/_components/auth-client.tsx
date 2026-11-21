"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = {};

export function AuthClient() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [signInState, signInAction, signInPending] = useActionState(
    signIn,
    initialState,
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUp,
    initialState,
  );

  const isRegister = mode === "register";
  const activeState = isRegister ? signUpState : signInState;
  const activeAction = isRegister ? signUpAction : signInAction;
  const pending = isRegister ? signUpPending : signInPending;

  return (
    <div className="w-full max-w-md border-2 border-neon-cyan bg-[#0a0a0a] p-6 shadow-[0_0_20px_rgba(0,243,255,0.12)]">
      <div className="mb-6 border-b border-neon-cyan/30 pb-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#8a8a8a]">
          Secure Terminal // Auth Gate
        </p>
        <h1 className="mt-2 text-2xl font-bold uppercase tracking-tight text-[#00f3ff]">
          INITIATE UPLINK
          <span
            aria-hidden="true"
            className="cursor-blink ml-1 inline-block h-[1em] w-[0.6ch] translate-y-[2px] bg-[#00f3ff] align-baseline"
          />
        </h1>
        <p className="mt-2 text-xs text-[#a0a0a0]">
          Authenticate operator credentials to access the grid.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 border border-neon-cyan/30">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`px-3 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
            !isRegister
              ? "bg-[#00f3ff]/10 text-[#00f3ff]"
              : "bg-transparent text-[#8a8a8a] hover:text-[#e0e0e0]"
          }`}
          aria-pressed={!isRegister}
        >
          [ Sign In ]
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`border-l border-neon-cyan/30 px-3 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
            isRegister
              ? "bg-[#00f3ff]/10 text-[#00f3ff]"
              : "bg-transparent text-[#8a8a8a] hover:text-[#e0e0e0]"
          }`}
          aria-pressed={isRegister}
        >
          [ Register ]
        </button>
      </div>

      <form action={activeAction} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-[#39ff14]">
            &gt; Email_Address
          </span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="operator@uplink.net"
            className="w-full border border-neon-cyan/40 bg-[#050505] px-3 py-2 text-sm text-[#e0e0e0] outline-none placeholder:text-[#444] focus:border-[#00f3ff] focus:shadow-[0_0_8px_rgba(0,243,255,0.35)]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-[#39ff14]">
            &gt; Passphrase
          </span>
          <input
            type="password"
            name="password"
            required
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder="••••••••"
            className="w-full border border-neon-cyan/40 bg-[#050505] px-3 py-2 text-sm text-[#e0e0e0] outline-none placeholder:text-[#444] focus:border-[#00f3ff] focus:shadow-[0_0_8px_rgba(0,243,255,0.35)]"
          />
        </label>

        {activeState?.error ? (
          <div
            role="alert"
            className="border border-[#ff00ff]/50 bg-[#ff00ff]/5 px-3 py-2 text-xs text-[#ff4dff]"
          >
            {activeState.error}
          </div>
        ) : null}

        {activeState?.message ? (
          <div className="border border-[#39ff14]/50 bg-[#39ff14]/5 px-3 py-2 text-xs text-[#39ff14]">
            {activeState.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full border-2 border-[#00f3ff] bg-[#00f3ff]/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-[#00f3ff] transition-colors hover:bg-[#00f3ff]/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Processing..."
            : isRegister
              ? "Register Operator"
              : "Authenticate"}
        </button>
      </form>

      <p className="mt-5 border-t border-[#1f1f1f] pt-3 text-[10px] uppercase tracking-[0.15em] text-[#555]">
        Uplink Security Layer v1.0 // Unauthorized access prohibited
      </p>
    </div>
  );
}
