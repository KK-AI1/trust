import { CastForm } from "@/components/cast-form";

export default function NewCastPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-neutral-100">
        新規キャスト登録
      </h1>
      <CastForm />
    </div>
  );
}
