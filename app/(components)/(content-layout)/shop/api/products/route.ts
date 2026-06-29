// app/(components)/(content-layout)/shop/api/products/route.ts
// Shop - çoklu ürün listeleme (arama destekli) ve admin ürün oluşturma.
import db from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireShopAdmin } from "../../lib/auth";
import slugify from "slugify";

// GET /shop/api/products?q=arama&all=1
// q: isim/açıklama araması. all=1 (admin) pasif ürünleri de getirir.
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim();
    const all = req.nextUrl.searchParams.get("all") === "1";

    const where: any = {};
    if (!all) where.active = true;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const products = await db.shopProduct.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (err: any) {
    console.error("[shop/products GET]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /shop/api/products  (admin) -> yeni ürün ekler
export async function POST(req: Request) {
  try {
    const guard = await requireShopAdmin();
    if (guard.error)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    const body = await req.json();
    const { name, description, price, oldPrice, currency, images, features, stock } =
      body;

    if (!name || price == null) {
      return NextResponse.json(
        { error: "name ve price zorunludur" },
        { status: 400 }
      );
    }

    // slug verilmemişse isimden üret, çakışırsa sonuna kısa ek koy
    let slug =
      (body.slug && String(body.slug).trim()) ||
      slugify(String(name), { lower: true, strict: true });
    const exists = await db.shopProduct.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const product = await db.shopProduct.create({
      data: {
        name: String(name),
        slug,
        description: String(description ?? ""),
        price: Number(price),
        oldPrice: oldPrice != null && oldPrice !== "" ? Number(oldPrice) : null,
        currency: currency ? String(currency) : "TRY",
        images: Array.isArray(images) ? images.map(String).filter(Boolean) : [],
        features: Array.isArray(features)
          ? features.map(String).filter(Boolean)
          : [],
        stock: stock != null ? Number(stock) : 0,
        active: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err: any) {
    console.error("[shop/products POST]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
