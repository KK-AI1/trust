"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";

export async function createMenuCategory(name: string) {
  const storeId = await requireStoreId();
  if (!name.trim()) throw new Error("カテゴリー名を入力してください");

  const count = await prisma.menuCategory.count({ where: { storeId } });

  await prisma.menuCategory.create({
    data: { storeId, name: name.trim(), sortOrder: count },
  });

  revalidatePath("/menu");
}

export async function createMenuItem(input: {
  categoryId: string;
  name: string;
  price: number;
  isBottle: boolean;
  backAmount: number;
}) {
  const storeId = await requireStoreId();
  if (!input.name.trim()) throw new Error("商品名を入力してください");

  const category = await prisma.menuCategory.findFirstOrThrow({
    where: { id: input.categoryId, storeId },
  });

  const count = await prisma.menuItem.count({
    where: { categoryId: category.id },
  });

  await prisma.menuItem.create({
    data: {
      storeId,
      categoryId: category.id,
      name: input.name.trim(),
      price: input.price,
      isBottle: input.isBottle,
      backAmount: input.backAmount,
      sortOrder: count,
    },
  });

  revalidatePath("/menu");
  revalidatePath("/visits", "layout");
}

export async function updateMenuItem(
  itemId: string,
  input: {
    name: string;
    price: number;
    isBottle: boolean;
    backAmount: number;
  },
) {
  const storeId = await requireStoreId();
  if (!input.name.trim()) throw new Error("商品名を入力してください");

  await prisma.menuItem.updateMany({
    where: { id: itemId, storeId },
    data: {
      name: input.name.trim(),
      price: input.price,
      isBottle: input.isBottle,
      backAmount: input.backAmount,
    },
  });

  revalidatePath("/menu");
  revalidatePath("/visits", "layout");
}

export async function setMenuItemAvailable(itemId: string, isAvailable: boolean) {
  const storeId = await requireStoreId();

  await prisma.menuItem.updateMany({
    where: { id: itemId, storeId },
    data: { isAvailable },
  });

  revalidatePath("/menu");
  revalidatePath("/visits", "layout");
}
