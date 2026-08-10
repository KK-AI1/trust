import { auth } from "@/auth";

export default async function DashboardHomePage() {
  const session = await auth();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-neutral-100">
        ホール状況
      </h1>
      <p className="text-neutral-400">
        ようこそ、{session?.user?.name} さん。卓・オーダー管理画面はここに実装予定です。
      </p>
    </div>
  );
}
