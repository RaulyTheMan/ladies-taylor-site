"use client";

import { useActionState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Heading, Text } from "@/components/ui/Text";
import { Field, TextInput } from "@/components/ui/Field";
import { login, type LoginState } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    undefined
  );

  return (
    <main className="admin-root flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="flex items-center gap-1.5">
          <Heading level={2}>Ladies Taylor</Heading>
          <span className="rounded-admin-sm bg-admin-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-admin-fg">
            Studio
          </span>
        </div>
        <Text muted className="mt-1">
          Sign in to manage the website.
        </Text>

        <form action={formAction} className="mt-5 flex flex-col gap-4">
          <Field label="Email">
            {(props) => (
              <TextInput
                {...props}
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            )}
          </Field>

          <Field label="Password">
            {(props) => (
              <TextInput
                {...props}
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            )}
          </Field>

          {state?.error && (
            <p role="alert" className="text-[13px] text-admin-danger">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="mt-1">
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
