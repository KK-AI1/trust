import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";
import { CastForm } from "@/components/cast-form";

export default async function EditCastPage({
  params,
}: {
  params: Promise<{ castId: string }>;
}) {
  const { castId } = await params;
  const storeId = await requireStoreId();

  const cast = await prisma.cast.findFirst({
    where: { id: castId, storeId },
  });

  if (!cast) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-neutral-100">
        {cast.name} の編集
      </h1>
      <CastForm castId={cast.id} initial={cast} />
    </div>
  );
}
