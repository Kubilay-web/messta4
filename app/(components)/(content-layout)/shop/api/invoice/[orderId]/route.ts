// app/(components)/(content-layout)/shop/api/invoice/[orderId]/route.ts
// Shop - sipariş için PDF fatura indirme. Siparişin sahibi ya da admin erişebilir.
import db from "@/app/lib/db";
import { NextResponse } from "next/server";
import { validateRequest } from "@/app/auth";
import { isShopAdminRole } from "../../../lib/auth";
import { buildInvoicePdf } from "../../../lib/invoice";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { user } = await validateRequest();
    if (!user)
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

    const { orderId } = await params;
    const order = await db.shopOrder.findUnique({
      where: { id: orderId },
      include: { product: { select: { name: true, currency: true } } },
    });

    if (!order)
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });

    // Yetki: admin ya da siparişin sahibi (userId veya aynı e-posta)
    const owner =
      order.userId === user.id ||
      order.email.toLowerCase() === (user.email || "").toLowerCase();
    if (!owner && !isShopAdminRole(user.shopNewRole))
      return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });

    const pdfBytes = await buildInvoicePdf({
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
      currency: order.currency || order.product?.currency || "TRY",
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="fatura-${order.id.slice(0, 8)}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[shop/invoice GET]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
