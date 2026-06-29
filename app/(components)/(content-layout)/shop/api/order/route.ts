// app/(components)/(content-layout)/shop/api/order/route.ts
// Shop - sipariş (checkout) endpoint'i. Doğrudan DB.
import db from "@/app/lib/db";
import { NextResponse } from "next/server";

// GET -> tüm siparişleri (en yeni önce) listeler
export async function GET() {
  try {
    const orders = await db.shopOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true, slug: true } } },
    });
    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("[shop/order GET]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST -> sipariş oluşturur, fiyatı sunucuda hesaplar, stoğu düşürür
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      productId,
      quantity,
      customerName,
      email,
      phone,
      address,
      city,
      note,
    } = body;

    // Zorunlu alan kontrolü
    const missing = ["customerName", "email", "phone", "address", "city"].filter(
      (f) => !body[f] || String(body[f]).trim() === ""
    );
    if (missing.length) {
      return NextResponse.json(
        { error: `Eksik alanlar: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const qty = Math.max(1, Number(quantity) || 1);

    // Ürünü çek - fiyatı client'a güvenmeden sunucuda alıyoruz
    const product = productId
      ? await db.shopProduct.findUnique({ where: { id: String(productId) } })
      : await db.shopProduct.findFirst({
          where: { active: true },
          orderBy: { createdAt: "desc" },
        });

    if (!product) {
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    if (product.stock < qty) {
      return NextResponse.json(
        { error: `Yetersiz stok (kalan: ${product.stock})` },
        { status: 409 }
      );
    }

    const unitPrice = product.price;
    const totalPrice = Number((unitPrice * qty).toFixed(2));

    // Sipariş oluştur + stok düşür
    const order = await db.shopOrder.create({
      data: {
        productId: product.id,
        quantity: qty,
        unitPrice,
        totalPrice,
        customerName: String(customerName).trim(),
        email: String(email).trim(),
        phone: String(phone).trim(),
        address: String(address).trim(),
        city: String(city).trim(),
        note: note ? String(note).trim() : null,
        status: "PENDING",
      },
    });

    await db.shopProduct.update({
      where: { id: product.id },
      data: { stock: { decrement: qty } },
    });

    return NextResponse.json(
      { ok: true, order, message: "Siparişiniz alındı" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[shop/order POST]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
