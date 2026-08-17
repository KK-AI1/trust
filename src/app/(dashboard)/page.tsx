import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";
import { TableGrid } from "@/components/table-grid";

export default async function DashboardHomePage() {
  const storeId = await requireStoreId();

  const tables = await prisma.tableSeat.findMany({
    where: { storeId },
    orderBy: { sortOrder: "asc" },
    include: {
      visits: {
        where: { status: "OPEN" },
        include: { orderItems: true, extensionLogs: true },
      },
    },
  });

  const tableCards = tables.map((table) => {
    const visit = table.visits[0];
    const amount = visit
      ? visit.orderItems.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0,
        ) + visit.extensionLogs.reduce((sum, log) => sum + log.amount, 0)
      : 0;

    return {
      id: table.id,
      name: table.name,
      capacity: table.capacity,
      status: table.status,
      visitId: visit?.id ?? null,
      customerName: visit?.customerName ?? null,
      guestCount: visit?.guestCount ?? null,
      checkInAt: visit?.checkInAt.toISOString() ?? null,
      amount,
    };
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-neutral-100">
        ホール状況
      </h1>
      <TableGrid tables={tableCards} />
    </div>
  );
}
