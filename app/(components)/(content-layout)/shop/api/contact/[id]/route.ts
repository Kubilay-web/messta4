// app/(components)/(content-layout)/shop/api/contact/[id]/route.ts
// Shop - admin: tek bir "Bize Ulaşın" mesajının durumunu günceller veya siler.
import db from "@/app/lib/db";
import { NextResponse } from "next/server";
import { requireShopAdmin } from "../../../lib/auth";

const STATUSES = ["NEW", "READ", "REPLIED"];

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

    const message = await db.shopContactMessage.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ ok: true, message });
  } catch (err: any) {
    console.error("[shop/contact PATCH]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireShopAdmin();
    if (guard.error)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { id } = await params;
    await db.shopContactMessage.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[shop/contact DELETE]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
