"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";

const loginSchema = z.object({
  username: z.string().min(1, "ユーザー名を入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    });

    if (result?.error) {
      setFormError("ユーザー名またはパスワードが正しくありません");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-900 p-8 shadow-xl">
        <h1 className="mb-1 text-xl font-semibold text-neutral-100">
          TRUST 店舗管理システム
        </h1>
        <p className="mb-6 text-sm text-neutral-400">ログインしてください</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-300">
              ユーザー名
            </label>
            <input
              type="text"
              autoComplete="username"
              {...register("username")}
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-amber-500"
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-400">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-neutral-300">
              パスワード
            </label>
            <input
              type="password"
              autoComplete="current-password"
              {...register("password")}
              className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-amber-500"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {formError && <p className="text-sm text-red-400">{formError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-amber-500 px-3 py-2 font-medium text-neutral-950 transition hover:bg-amber-400 disabled:opacity-60"
          >
            {isSubmitting ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
