import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const store = await prisma.store.upsert({
    where: { id: "seed-store" },
    update: {},
    create: {
      id: "seed-store",
      name: "club TRUST",
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

  for (const category of categories) {
    await prisma.menuCategory.upsert({
      where: { storeId_name: { storeId: store.id, name: category.name } },
      update: {},
      create: { ...category, storeId: store.id },
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
