import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";
import { OrderScreen } from "@/components/order-screen";

export default async function VisitPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = await params;
  const storeId = await requireStoreId();

  const visit = await prisma.visit.findFirst({
    where: { id: visitId, storeId },
    include: {
      table: true,
      orderItems: {
        include: { menuItem: true },
        orderBy: { createdAt: "asc" },
      },
      extensionLogs: { orderBy: { createdAt: "asc" } },
      nominations: {
        include: { cast: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!visit) {
    notFound();
  }

  const [categories, workingCasts] = await Promise.all([
    prisma.menuCategory.findMany({
      where: { storeId },
      orderBy: { sortOrder: "asc" },
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    prisma.cast.findMany({
      where: {
        storeId,
        isActive: true,
        timeCards: { some: { clockOutAt: null } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const itemsTotal = visit.orderItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const extensionTotal = visit.extensionLogs.reduce(
    (sum, log) => sum + log.amount,
    0,
  );

  return (
    <OrderScreen
      visit={{
        id: visit.id,
        tableName: visit.table.name,
        guestCount: visit.guestCount,
        checkInAt: visit.checkInAt.toISOString(),
        status: visit.status,
        extensionMinutes: visit.extensionLogs.reduce(
          (sum, log) => sum + log.minutes,
          0,
        ),
      }}
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        items: c.menuItems.map((m) => ({
          id: m.id,
          name: m.name,
          price: m.price,
        })),
      }))}
      orderItems={visit.orderItems.map((item) => ({
        id: item.id,
        name: item.menuItem.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      }))}
      nominations={visit.nominations.map((n) => ({
        id: n.id,
        castName: n.cast.name,
        type: n.type,
      }))}
      workingCasts={workingCasts.map((c) => ({ id: c.id, name: c.name }))}
      total={itemsTotal + extensionTotal}
    />
  );
}
