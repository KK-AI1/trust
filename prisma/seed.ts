import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const store = await prisma.store.upsert({
    where: { id: "seed-store" },
    update: { name: "ゆず" },
    create: {
      id: "seed-store",
      name: "ゆず",
    },
  });

  const passwordHash = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      storeId: store.id,
      name: "管理者",
      username: "admin",
      passwordHash,
      role: "OWNER",
    },
  });

  const categories = [
    { name: "ドリンク1000", sortOrder: 1 },
    { name: "ドリンク2000", sortOrder: 2 },
    { name: "シャンパン", sortOrder: 3 },
    { name: "フード", sortOrder: 4 },
    { name: "その他", sortOrder: 5 },
  ];

  const categoryRecords: Record<string, string> = {};
  for (const category of categories) {
    const record = await prisma.menuCategory.upsert({
      where: { storeId_name: { storeId: store.id, name: category.name } },
      update: {},
      create: { ...category, storeId: store.id },
    });
    categoryRecords[category.name] = record.id;
  }

  const menuItems = [
    { category: "ドリンク1000", name: "烏龍茶", price: 1000 },
    { category: "ドリンク1000", name: "コーラ", price: 1000 },
    { category: "ドリンク2000", name: "国産ウイスキー", price: 2000 },
    { category: "シャンパン", name: "ドンペリ", price: 55000, isBottle: true, backAmount: 5000 },
    { category: "フード", name: "おつまみ盛り合わせ", price: 3000 },
    { category: "その他", name: "指名料", price: 3000 },
  ];

  for (const [index, item] of menuItems.entries()) {
    await prisma.menuItem.upsert({
      where: {
        id: `seed-menu-${index}`,
      },
      update: {},
      create: {
        id: `seed-menu-${index}`,
        storeId: store.id,
        categoryId: categoryRecords[item.category],
        name: item.name,
        price: item.price,
        isBottle: item.isBottle ?? false,
        backAmount: item.backAmount ?? 0,
        sortOrder: index,
      },
    });
  }

  const tableNames = Array.from({ length: 8 }, (_, i) => `卓${i + 1}`);
  for (const [index, name] of tableNames.entries()) {
    await prisma.tableSeat.upsert({
      where: { storeId_name: { storeId: store.id, name } },
      update: {},
      create: { storeId: store.id, name, capacity: 4, sortOrder: index },
    });
  }

  console.log("Seed complete. Login with admin / admin1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
