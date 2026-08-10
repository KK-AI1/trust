"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";

export async function addOrderItem(visitId: string, menuItemId: string) {
  const storeId = await requireStoreId();

  const [visit, menuItem] = await Promise.all([
    prisma.visit.findFirstOrThrow({ where: { id: visitId, storeId } }),
    prisma.menuItem.findFirstOrThrow({ where: { id: menuItemId, storeId } }),
  ]);

  if (visit.status !== "OPEN") {
    throw new Error("この卓は会計済みです");
  }

  const existing = await prisma.orderItem.findFirst({
    where: { visitId, menuItemId, castId: null },
  });

  if (existing) {
    await prisma.orderItem.update({
      where: { id: existing.id },
      data: { quantity: { increment: 1 } },
    });
  } else {
    await prisma.orderItem.create({
      data: {
        visitId,
        menuItemId,
        quantity: 1,
        unitPrice: menuItem.price,
      },
    });
  }

  revalidatePath(`/visits/${visitId}`);
  revalidatePath("/");
}

export async function decrementOrderItem(orderItemId: string) {
  const storeId = await requireStoreId();

  const item = await prisma.orderItem.findFirstOrThrow({
    where: { id: orderItemId, visit: { storeId } },
  });

  if (item.quantity <= 1) {
    await prisma.orderItem.delete({ where: { id: orderItemId } });
  } else {
    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { quantity: { decrement: 1 } },
    });
  }

  revalidatePath(`/visits/${item.visitId}`);
  revalidatePath("/");
}
