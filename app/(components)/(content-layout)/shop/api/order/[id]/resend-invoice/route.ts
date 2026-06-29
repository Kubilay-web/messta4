// app/(components)/(content-layout)/shop/api/order/[id]/resend-invoice/route.ts
// Shop - admin: bir siparişin fatura e-postasını müşteriye tekrar gönderir.
import db from "@/app/lib/db";
import { NextResponse } from "next/server";
import { requireShopAdmin } from "../../../../lib/auth";
import { sendInvoiceEmail } from "../../../../lib/invoice";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireShopAdmin();
    if (guard.error)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { id } = await params;
    const order = await db.shopOrder.findUnique({
      where: { id },
      include: { product: { select: { name: true, currency: true } } },
    });

    if (!order)
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });

    await sendInvoiceEmail({
      id: order.id,
      createdAt: order.createdAt,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      city: order.city,
      quantity: order.quantity,
      unitPrice: order.unitPrice,
      totalPrice: order.totalPrice,
      status: order.status,
      productName: order.product?.name || "Ürün",
      currency: order.product?.currency || "TRY",
    });

    return NextResponse.json({ ok: true, message: "Fatura e-postası gönderildi" });
  } catch (err: any) {
    console.error("[shop/order resend-invoice]", err);
    return NextResponse.json(
      { error: err.message || "E-posta gönderilemedi" },
      { status: 500 }
    );
  }
}
