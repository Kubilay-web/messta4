// app/(components)/(content-layout)/shop/api/products/[id]/route.ts
// Shop - tek ürün okuma, güncelleme (stok dahil) ve silme. Yazma işlemleri admin.
import db from "@/app/lib/db";
import { NextResponse } from "next/server";
import { requireShopAdmin } from "../../../lib/auth";

// GET -> tek ürün (detay sayfası / admin düzenleme için)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.shopProduct.findUnique({ where: { id } });
    if (!product)
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PATCH (admin) -> ürünü günceller (stok, fiyat, görsel, aktiflik vs.)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireShopAdmin();
    if (guard.error)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { id } = await params;
    const body = await req.json();

    const data: any = {};
    if (body.name != null) data.name = String(body.name);
    if (body.description != null) data.description = String(body.description);
    if (body.price != null && body.price !== "") data.price = Number(body.price);
    if ("oldPrice" in body)
      data.oldPrice =
        body.oldPrice != null && body.oldPrice !== ""
          ? Number(body.oldPrice)
          : null;
    if (body.currency != null) data.currency = String(body.currency);
    if (Array.isArray(body.images))
      data.images = body.images.map(String).filter(Boolean);
    if (Array.isArray(body.features))
      data.features = body.features.map(String).filter(Boolean);
    if (body.stock != null && body.stock !== "") data.stock = Number(body.stock);
    if (typeof body.active === "boolean") data.active = body.active;

    const product = await db.shopProduct.update({ where: { id }, data });
    return NextResponse.json({ product });
  } catch (err: any) {
    console.error("[shop/products PATCH]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE (admin) -> ürünü siler. Siparişi varsa silmek yerine pasifleştirir.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireShopAdmin();
    if (guard.error)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { id } = await params;
    const orderCount = await db.shopOrder.count({ where: { productId: id } });

    if (orderCount > 0) {
      await db.shopProduct.update({ where: { id }, data: { active: false } });
      return NextResponse.json({
        ok: true,
        softDeleted: true,
        message: "Ürünün siparişleri olduğu için pasife alındı",
      });
    }

    await db.shopProduct.delete({ where: { id } });
    return NextResponse.json({ ok: true, softDeleted: false });
  } catch (err: any) {
    console.error("[shop/products DELETE]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
