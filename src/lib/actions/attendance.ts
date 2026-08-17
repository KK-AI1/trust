"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";

function combineDateTime(dateStr: string, timeStr: string) {
  return new Date(`${dateStr}T${timeStr}:00`);
}

// 深夜営業のため、退勤時刻が出勤時刻より前(時刻のみで見て)なら翌日とみなす
function resolveClockOut(clockInAt: Date, dateStr: string, clockOutTime: string) {
  let clockOutAt = combineDateTime(dateStr, clockOutTime);
  if (clockOutAt <= clockInAt) {
    clockOutAt = new Date(clockOutAt.getTime() + 24 * 60 * 60 * 1000);
  }
  return clockOutAt;
}

export type TimeCardInput = {
  castId: string;
  workDate: string; // YYYY-MM-DD
  clockIn: string; // HH:mm
  clockOut: string; // HH:mm, empty string if still working
};

export async function createTimeCard(input: TimeCardInput) {
  const storeId = await requireStoreId();
  const cast = await prisma.cast.findFirstOrThrow({
    where: { id: input.castId, storeId },
  });

  const clockInAt = combineDateTime(input.workDate, input.clockIn);
  const clockOutAt = input.clockOut
    ? resolveClockOut(clockInAt, input.workDate, input.clockOut)
    : null;

  await prisma.timeCard.create({
    data: {
      castId: cast.id,
      workDate: new Date(`${input.workDate}T00:00:00`),
      clockInAt,
      clockOutAt,
    },
  });

  revalidatePath("/attendance");
  revalidatePath("/casts");
  revalidatePath("/payroll");
}

export async function updateTimeCard(
  timeCardId: string,
  input: Omit<TimeCardInput, "castId">,
) {
  const storeId = await requireStoreId();
  await prisma.timeCard.findFirstOrThrow({
    where: { id: timeCardId, cast: { storeId } },
  });

  const clockInAt = combineDateTime(input.workDate, input.clockIn);
  const clockOutAt = input.clockOut
    ? resolveClockOut(clockInAt, input.workDate, input.clockOut)
    : null;

  await prisma.timeCard.update({
    where: { id: timeCardId },
    data: {
      workDate: new Date(`${input.workDate}T00:00:00`),
      clockInAt,
      clockOutAt,
    },
  });

  revalidatePath("/attendance");
  revalidatePath("/casts");
  revalidatePath("/payroll");
}

export async function deleteTimeCard(timeCardId: string) {
  const storeId = await requireStoreId();
  await prisma.timeCard.findFirstOrThrow({
    where: { id: timeCardId, cast: { storeId } },
  });

  await prisma.timeCard.delete({ where: { id: timeCardId } });

  revalidatePath("/attendance");
  revalidatePath("/casts");
  revalidatePath("/payroll");
}
