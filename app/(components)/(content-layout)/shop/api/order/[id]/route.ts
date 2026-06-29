// app/(components)/(content-layout)/shop/api/order/[id]/route.ts
// Shop - admin: sipariş durumunu güncelle (PAID/SHIPPED/DELIVERED/CANCELLED).
import db from "@/app/lib/db";
import { NextResponse } from "next/server";
import { requireShopAdmin } from "../../../lib/auth";

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireShopAdmin();
    if (guard.error)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { id } = await params;
    const { status } = await req.json();

    if (!STATUSES.includes(status))
      return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });

    const order = await db.shopOrder.update({
      where: { id },
      data: { status },
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
