// app/(components)/(content-layout)/shop/api/order/[id]/route.ts
// Shop - admin: sipariş durumunu güncelle (PAID/SHIPPED/DELIVERED/CANCELLED).
import db from "@/app/lib/db";
import { NextResponse } from "next/server";
import { requireShopAdmin } from "../../../lib/auth";

const STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireShopAdmin();
    if (guard.error)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { id } = await params;
    const { status, trackingNumber, cargoCompany } = await req.json();

    // Güncellenecek alanları topla (sadece gönderilenler)
    const data: Record<string, any> = {};
    if (status !== undefined) {
      if (!STATUSES.includes(status))
        return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
      data.status = status;
    }
    if (trackingNumber !== undefined)
      data.trackingNumber = trackingNumber ? String(trackingNumber).trim() : null;
    if (cargoCompany !== undefined)
      data.cargoCompany = cargoCompany ? String(cargoCompany).trim() : null;

    if (Object.keys(data).length === 0)
      return NextResponse.json(
        { error: "Güncellenecek alan yok" },
        { status: 400 }
      );

    const order = await db.shopOrder.update({
      where: { id },
      data,
    });

    return NextResponse.json({ ok: true, order });
  } catch (err: any) {
    console.error("[shop/order PATCH]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
