"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition hover:bg-neutral-800"
    >
      ログアウト
    </button>
  );
}
