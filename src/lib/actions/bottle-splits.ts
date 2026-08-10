"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";

export async function setBottleSplit(orderItemId: string, castIds: string[]) {
  const storeId = await requireStoreId();

  const orderItem = await prisma.orderItem.findFirstOrThrow({
    where: { id: orderItemId, visit: { storeId } },
    include: { menuItem: true },
  });

  const uniqueCastIds = Array.from(new Set(castIds));

  await prisma.$transaction(async (tx) => {
    await tx.bottleSplit.deleteMany({ where: { orderItemId } });

    if (uniqueCastIds.length === 0) return;

    const totalBack = orderItem.menuItem.backAmount * orderItem.quantity;
    const base = Math.floor(totalBack / uniqueCastIds.length);
    const remainder = totalBack - base * uniqueCastIds.length;

    await tx.bottleSplit.createMany({
      data: uniqueCastIds.map((castId, index) => ({
        orderItemId,
        castId,
        backAmount: base + (index < remainder ? 1 : 0),
      })),
    });
  });

  revalidatePath(`/visits/${orderItem.visitId}`);
}
