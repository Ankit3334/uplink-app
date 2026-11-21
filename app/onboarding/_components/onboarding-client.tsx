"use client";

import { useActionState } from "react";
import {
  completeOnboarding,
  type OnboardingState,
} from "@/app/actions/profile";

const initialState: OnboardingState = {};

export function OnboardingClient() {
  const [state, formAction, pending] = useActionState(
    completeOnboarding,
    initialState,
  );

  return (
    <div className="w-full max-w-md border-2 border-neon-green bg-[#0a0a0a] p-6 shadow-[0_0_20px_rgba(57,255,20,0.08)]">
      <div className="mb-6 border-b border-neon-green/30 pb-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#8a8a8a]">
          System Configuration // Profile Init
        </p>
        <h1 className="mt-2 text-2xl font-bold uppercase tracking-tight text-[#39ff14]">
          Claim Operator Handle
          <span
            aria-hidden="true"
            className="cursor-blink ml-1 inline-block h-[1em] w-[0.6ch] translate-y-[2px] bg-[#39ff14] align-baseline"
          />
        </h1>
        <p className="mt-2 text-xs text-[#a0a0a0]">
          Configure your identity before accessing the uplink feed.
        </p>
      </div>

      <div className="mb-5 border border-[#1f1f1f] bg-[#050505] p-3 text-[10px] uppercase tracking-[0.15em] text-[#6a6a6a]">
        <p>&gt; STATUS: AUTHENTICATED</p>
        <p>&gt; PROFILE: UNINITIALIZED</p>
        <p>&gt; ACTION: REQUIRED</p>
      </div>

      <form action={formAction} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-[#00f3ff]">
            &gt; Username [a-z0-9, unique]
          </span>
          <input
            type="text"
            name="username"
            required
            minLength={3}
            maxLength={32}
            pattern="[a-zA-Z0-9]+"
            autoComplete="off"
            placeholder="operator01"
            className="w-full border border-neon-green/40 bg-[#050505] px-3 py-2 text-sm text-[#e0e0e0] outline-none placeholder:text-[#444] focus:border-[#39ff14] focus:shadow-[0_0_8px_rgba(57,255,20,0.3)]"
          />
          <span className="mt-1 block text-[10px] text-[#666]">
            Alphanumeric only. Will be stored in lowercase.
          </span>
        </label>

        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-[#00f3ff]">
            &gt; Display_Name
          </span>
          <input
            type="text"
            name="display_name"
            required
            maxLength={64}
            autoComplete="nickname"
            placeholder="Operator Zero"
            className="w-full border border-neon-green/40 bg-[#050505] px-3 py-2 text-sm text-[#e0e0e0] outline-none placeholder:text-[#444] focus:border-[#39ff14] focus:shadow-[0_0_8px_rgba(57,255,20,0.3)]"
          />
        </label>

        {state?.error ? (
          <div
            role="alert"
            className="border border-[#ff00ff]/50 bg-[#ff00ff]/5 px-3 py-2 text-xs text-[#ff4dff]"
          >
            {state.error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full border-2 border-[#39ff14] bg-[#39ff14]/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-[#39ff14] transition-colors hover:bg-[#39ff14]/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Writing Config..." : "Commit Configuration"}
        </button>
      </form>

      <p className="mt-5 border-t border-[#1f1f1f] pt-3 text-[10px] uppercase tracking-[0.15em] text-[#555]">
        Uplink Config Shell v1.0 // Identity binding required
      </p>
    </div>
  );
}
