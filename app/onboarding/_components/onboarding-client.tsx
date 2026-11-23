"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import {
  completeOnboarding,
  type OnboardingState,
} from "@/app/actions/profile";

const initialState: OnboardingState = {};

function CommitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 flex w-full items-center justify-center gap-2 border border-zinc-700 bg-zinc-900 px-4 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-cyan-400 transition-colors hover:border-zinc-600 hover:bg-zinc-900 focus-visible:border-cyan-400 focus-visible:outline-none active:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span className="text-zinc-200">Writing Config...</span>
        </>
      ) : (
        "Commit Configuration"
      )}
    </button>
  );
}

export function OnboardingClient() {
  const [state, formAction] = useActionState(
    completeOnboarding,
    initialState,
  );

  return (
    <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 p-6">
      <div className="mb-6 border-b border-zinc-800 pb-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          System Configuration // Profile Init
        </p>
        <h1 className="mt-3 text-2xl font-bold uppercase tracking-tight text-zinc-100">
          Claim Operator Handle
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Configure your identity before accessing the uplink feed.
        </p>
      </div>

      <div className="mb-6 border border-zinc-800 bg-zinc-900 p-4 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
        <p>&gt; STATUS: AUTHENTICATED</p>
        <p className="mt-1">&gt; PROFILE: UNINITIALIZED</p>
        <p className="mt-1">&gt; ACTION: REQUIRED</p>
      </div>

      <form action={formAction} className="space-y-5">
        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
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
            className="w-full border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400"
          />
          <span className="mt-2 block font-mono text-[10px] text-zinc-500">
            Alphanumeric only. Will be stored in lowercase.
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            &gt; Display_Name
          </span>
          <input
            type="text"
            name="display_name"
            required
            maxLength={64}
            autoComplete="nickname"
            placeholder="Operator Zero"
            className="w-full border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400"
          />
        </label>

        {state?.error ? (
          <div
            role="alert"
            className="border border-zinc-700 bg-zinc-900 px-3 py-3 font-mono text-xs uppercase tracking-[0.08em] text-zinc-300"
          >
            {state.error}
          </div>
        ) : null}

        <CommitButton />
      </form>

      <p className="mt-6 border-t border-zinc-800 pt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
        Uplink Config Shell v1.0 // Identity binding required
      </p>
    </div>
  );
}
