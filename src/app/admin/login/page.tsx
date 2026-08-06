"use client";

import { useActionState } from "react";
import {
  ADMIN_BUTTON_CLASS,
  ADMIN_INPUT_CLASS,
  ADMIN_LABEL_CLASS,
} from "@/lib/admin/ui";
import { login, type LoginState } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    undefined
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm rounded-lg border border-black/10 p-8">
        <h1 className="text-xl font-semibold text-black">Admin Login</h1>
        <p className="mt-1 text-sm text-black/60">Ladies Taylor CMS</p>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className={ADMIN_LABEL_CLASS}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={ADMIN_INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="password" className={ADMIN_LABEL_CLASS}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={ADMIN_INPUT_CLASS}
            />
          </div>

          {state?.error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className={`${ADMIN_BUTTON_CLASS} mt-2 disabled:opacity-60`}
          >
            {pending ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}
