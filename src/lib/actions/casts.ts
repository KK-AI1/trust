"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";
import type { CastEmploymentType, WageType } from "@/generated/prisma/enums";

export type CastFormInput = {
  name: string;
  employmentType: CastEmploymentType;
  wageType: WageType;
  wageAmount: number;
  welfareRate: number;
  honshimeiBackAmount: number;
  jonaiBackAmount: number;
  dohanBackAmount: number;
};

export async function createCast(input: CastFormInput) {
  const storeId = await requireStoreId();

  await prisma.cast.create({
    data: {
      storeId,
      ...input,
    },
  });

  revalidatePath("/casts");
  redirect("/casts");
}

export async function updateCast(castId: string, input: CastFormInput) {
  const storeId = await requireStoreId();

  await prisma.cast.updateMany({
    where: { id: castId, storeId },
    data: input,
  });

  revalidatePath("/casts");
  redirect("/casts");
}

export async function setCastActive(castId: string, isActive: boolean) {
  const storeId = await requireStoreId();

  await prisma.cast.updateMany({
    where: { id: castId, storeId },
    data: { isActive },
  });

  revalidatePath("/casts");
}

export async function toggleAttendance(castId: string) {
  const storeId = await requireStoreId();

  const cast = await prisma.cast.findFirstOrThrow({
    where: { id: castId, storeId },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const openTimeCard = await prisma.timeCard.findFirst({
    where: { castId: cast.id, clockOutAt: null },
    orderBy: { clockInAt: "desc" },
  });

  if (openTimeCard) {
    await prisma.timeCard.update({
      where: { id: openTimeCard.id },
      data: { clockOutAt: new Date() },
    });
  } else {
    await prisma.timeCard.create({
      data: {
        castId: cast.id,
        workDate: today,
        clockInAt: new Date(),
      },
    });
  }

  revalidatePath("/casts");
  revalidatePath("/attendance");
}
