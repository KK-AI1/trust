"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";

const EXTENSION_UNIT_MINUTES = 30;

export async function createVisit(tableId: string, guestCount: number) {
  const storeId = await requireStoreId();

  const table = await prisma.tableSeat.findFirstOrThrow({
    where: { id: tableId, storeId },
  });

  if (table.status === "OCCUPIED") {
    throw new Error("この卓は既に利用中です");
  }

  const visit = await prisma.$transaction(async (tx) => {
    const created = await tx.visit.create({
      data: {
        storeId,
        tableId,
        guestCount: Math.max(1, guestCount),
      },
    });
    await tx.tableSeat.update({
      where: { id: tableId },
      data: { status: "OCCUPIED" },
    });
    return created;
  });

  revalidatePath("/");
  redirect(`/visits/${visit.id}`);
}

export async function closeVisit(visitId: string) {
  const storeId = await requireStoreId();

  const visit = await prisma.visit.findFirstOrThrow({
    where: { id: visitId, storeId },
    include: { orderItems: true, extensionLogs: true },
  });

  const itemsTotal = visit.orderItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const extensionTotal = visit.extensionLogs.reduce(
    (sum, log) => sum + log.amount,
    0,
  );

  await prisma.$transaction(async (tx) => {
    await tx.visit.update({
      where: { id: visitId },
      data: {
        status: "CLOSED",
        checkOutAt: new Date(),
        totalAmount: itemsTotal + extensionTotal,
      },
    });
    await tx.tableSeat.update({
      where: { id: visit.tableId },
      data: { status: "VACANT" },
    });
  });

  revalidatePath("/");
  redirect("/");
}

export async function addExtension(visitId: string, amount: number) {
  const storeId = await requireStoreId();

  const visit = await prisma.visit.findFirstOrThrow({
    where: { id: visitId, storeId },
  });

  await prisma.extensionLog.create({
    data: {
      visitId: visit.id,
      minutes: EXTENSION_UNIT_MINUTES,
      amount,
    },
  });

  revalidatePath(`/visits/${visitId}`);
}
