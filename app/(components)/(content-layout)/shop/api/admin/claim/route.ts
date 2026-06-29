// app/(components)/(content-layout)/shop/api/admin/claim/route.ts
// Shop - ilk admin kurulumu (bootstrap). Sistemde hiç admin/satıcı yoksa
// giriş yapmış kullanıcı kendini mağaza yöneticisi yapabilir. Admin varsa reddedilir.
import { NextResponse } from "next/server";
import { validateRequest } from "@/app/auth";
import db from "@/app/lib/db";

export async function POST() {
  try {
    const { user } = await validateRequest();
    if (!user)
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

    const adminCount = await db.user.count({
      where: { shopNewRole: { in: ["ADMIN", "SELLER"] } },
    });
    if (adminCount > 0)
      return NextResponse.json(
        { error: "Zaten bir mağaza yöneticisi mevcut" },
        { status: 403 }
      );

    await db.user.update({
      where: { id: user.id },
      data: { shopNewRole: "ADMIN" },
    });

    return NextResponse.json({ ok: true, message: "Mağaza yöneticisi oldunuz" });
  } catch (err: any) {
    console.error("[shop/admin claim]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
