// app/(components)/(content-layout)/shop/api/me/orders/route.ts
// Shop - giriş yapmış alıcının kendi siparişlerini (durum + kargo takip) listeler.
import db from "@/app/lib/db";
import { validateRequest } from "@/app/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { user } = await validateRequest();
    if (!user)
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

    const orders = await db.shopOrder.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true, slug: true, images: true } } },
    });

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("[shop/me/orders GET]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
