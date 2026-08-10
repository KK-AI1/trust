"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";
import { auth } from "@/auth";

export async function upsertDailyReport(input: {
  reportDate: string; // YYYY-MM-DD
  cashTotal: number;
  cardTotal: number;
  notes: string;
}) {
  const storeId = await requireStoreId();
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const reportDate = new Date(`${input.reportDate}T00:00:00`);
  const salesTotal = input.cashTotal + input.cardTotal;

  await prisma.dailyReport.upsert({
    where: { storeId_reportDate: { storeId, reportDate } },
    update: {
      cashTotal: input.cashTotal,
      cardTotal: input.cardTotal,
      salesTotal,
      notes: input.notes || null,
      submittedById: session.user.id,
    },
    create: {
      storeId,
      reportDate,
      cashTotal: input.cashTotal,
      cardTotal: input.cardTotal,
      salesTotal,
      notes: input.notes || null,
      submittedById: session.user.id,
    },
  });

  revalidatePath("/reports/daily");
}

export async function addCashEntry(input: {
  entryDate: string; // YYYY-MM-DD
  type: "CASH_IN" | "CASH_OUT";
  amount: number;
  reason: string;
}) {
  const storeId = await requireStoreId();
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.cashRegisterLog.create({
    data: {
      storeId,
      entryDate: new Date(`${input.entryDate}T00:00:00`),
      type: input.type,
      amount: input.amount,
      reason: input.reason,
      recordedById: session.user.id,
    },
  });

  revalidatePath("/reports/cash");
}
