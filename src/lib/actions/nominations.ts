"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";
import type { NominationType } from "@/generated/prisma/enums";

export async function addNomination(
  visitId: string,
  castId: string,
  type: NominationType,
) {
  const storeId = await requireStoreId();

  const [visit, cast] = await Promise.all([
    prisma.visit.findFirstOrThrow({ where: { id: visitId, storeId } }),
    prisma.cast.findFirstOrThrow({ where: { id: castId, storeId } }),
  ]);

  await prisma.nomination.create({
    data: { visitId: visit.id, castId: cast.id, type },
  });

  revalidatePath(`/visits/${visitId}`);
}

export async function removeNomination(nominationId: string) {
  const storeId = await requireStoreId();

  const nomination = await prisma.nomination.findFirstOrThrow({
    where: { id: nominationId, visit: { storeId } },
  });

  await prisma.nomination.delete({ where: { id: nominationId } });

  revalidatePath(`/visits/${nomination.visitId}`);
}
