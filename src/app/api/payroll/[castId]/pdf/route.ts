import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireStoreId } from "@/lib/current-store";
import { getMonthRange, computeCastPayroll } from "@/lib/payroll";
import { PayrollSlipDocument } from "@/lib/payroll-slip-document";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ castId: string }> },
) {
  const { castId } = await params;
  const storeId = await requireStoreId();

  const month = request.nextUrl.searchParams.get("month") ?? undefined;
  const { start, end, label } = getMonthRange(month);

  const [payroll, store] = await Promise.all([
    computeCastPayroll(castId, storeId, start, end),
    prisma.store.findUniqueOrThrow({ where: { id: storeId } }),
  ]);

  if (!payroll) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = await renderToBuffer(
    PayrollSlipDocument({
      storeName: store.name,
      periodLabel: label,
      payroll,
    }),
  );

  const encodedFileName = encodeURIComponent(
    `給与明細-${payroll.castName}-${label}.pdf`,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="payslip.pdf"; filename*=UTF-8''${encodedFileName}`,
    },
  });
}
