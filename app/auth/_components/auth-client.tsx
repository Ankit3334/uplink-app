"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { signIn, signUp, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = {};

function AuthSubmitButton({ isRegister }: { isRegister: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 flex w-full items-center justify-center gap-2 border border-zinc-700 bg-[#111111] px-4 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-cyan-400 transition-colors hover:border-zinc-600 hover:bg-[#161616] focus-visible:border-cyan-400 focus-visible:outline-none active:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span className="text-zinc-200">Processing...</span>
        </>
      ) : isRegister ? (
        "Register Operator"
      ) : (
        "Authenticate"
      )}
    </button>
  );
}

export function AuthClient() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [signInState, signInAction] = useActionState(signIn, initialState);
  const [signUpState, signUpAction] = useActionState(signUp, initialState);

  const isRegister = mode === "register";
  const activeState = isRegister ? signUpState : signInState;
  const activeAction = isRegister ? signUpAction : signInAction;

  return (
    <div className="w-full max-w-md border border-zinc-800 bg-[#0a0a0a] p-6">
      <div className="mb-6 border-b border-zinc-800 pb-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          Secure Terminal // Auth Gate
        </p>
        <h1 className="mt-3 text-2xl font-bold uppercase tracking-tight text-zinc-100">
          INITIATE UPLINK
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Authenticate operator credentials to access the grid.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 border border-zinc-800 bg-[#111111]">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`px-3 py-2.5 font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
            !isRegister
              ? "bg-[#161616] text-zinc-100"
              : "bg-transparent text-zinc-500 hover:text-zinc-300"
          }`}
          aria-pressed={!isRegister}
        >
          [ Sign In ]
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`border-l border-zinc-800 px-3 py-2.5 font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
            isRegister
              ? "bg-[#161616] text-zinc-100"
              : "bg-transparent text-zinc-500 hover:text-zinc-300"
          }`}
          aria-pressed={isRegister}
        >
          [ Register ]
        </button>
      </div>

      <form action={activeAction} className="space-y-5">
        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            &gt; Email_Address
          </span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="operator@uplink.net"
            className="w-full border border-zinc-800 bg-[#111111] px-3 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-cyan-400"
          />
        </label>

        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            &gt; Passphrase
          </span>
          <input
            type="password"
            name="password"
            required
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder="••••••••"
            className="w-full border border-zinc-800 bg-[#111111] px-3 py-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-cyan-400"
          />
        </label>

        {activeState?.error ? (
          <div
            role="alert"
            className="border border-zinc-700 bg-[#111111] px-3 py-3 font-mono text-xs uppercase tracking-[0.08em] text-zinc-300"
          >
            {activeState.error}
          </div>
        ) : null}

        {activeState?.message ? (
          <div className="border border-zinc-700 bg-[#111111] px-3 py-3 font-mono text-xs uppercase tracking-[0.08em] text-zinc-300">
            {activeState.message}
          </div>
        ) : null}

        <AuthSubmitButton isRegister={isRegister} />
      </form>

      <p className="mt-6 border-t border-zinc-800 pt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">
        Uplink Security Layer v1.0 // Unauthorized access prohibited
      </p>
    </div>
  );
}
