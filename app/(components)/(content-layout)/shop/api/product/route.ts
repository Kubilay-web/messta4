// app/(components)/(content-layout)/shop/api/product/route.ts
// Shop - tek ürün getirme (?slug= ile slug'a göre, yoksa en yeni aktif ürün)
// ve admin için hızlı ürün ekleme/güncelleme (upsert, demo seed).
import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireShopAdmin } from "../../lib/auth";

// GET -> ?slug= verilirse o ürünü, verilmezse en yeni aktif ürünü döner.
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");

    const product = slug
      ? await db.shopProduct.findUnique({ where: { slug } })
      : await db.shopProduct.findFirst({
          where: { active: true },
          orderBy: { createdAt: "desc" },
        });

    if (!product) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (err: any) {
    console.error("[shop/product GET]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST (admin) -> ürünü slug üzerinden oluşturur ya da günceller (upsert / demo seed)
export async function POST(req: Request) {
  try {
    const guard = await requireShopAdmin();
    if (guard.error)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    const body = await req.json();
    const {
      name,
      slug,
      description,
      price,
      oldPrice,
      currency,
      images,
      features,
      stock,
    } = body;

    if (!name || !slug || price == null) {
      return NextResponse.json(
        { error: "name, slug ve price zorunludur" },
        { status: 400 }
      );
    }

    const data = {
      name: String(name),
      description: String(description ?? ""),
      price: Number(price),
      oldPrice: oldPrice != null ? Number(oldPrice) : null,
      currency: currency ? String(currency) : "TRY",
      images: Array.isArray(images) ? images.map(String) : [],
      features: Array.isArray(features) ? features.map(String) : [],
      stock: stock != null ? Number(stock) : 0,
      active: true,
    };

    const product = await db.shopProduct.upsert({
      where: { slug: String(slug) },
      update: data,
      create: { slug: String(slug), ...data },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err: any) {
    console.error("[shop/product POST]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
