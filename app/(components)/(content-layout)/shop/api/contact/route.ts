// app/(components)/(content-layout)/shop/api/contact/route.ts
// Shop - "Bize Ulaşın" mesajları.
//   POST: ziyaretçi/alıcı mesaj gönderir -> admin paneline düşer.
//   GET : (admin) tüm mesajları listeler.
import db from "@/app/lib/db";
import { validateRequest } from "@/app/auth";
import { NextResponse } from "next/server";
import { requireShopAdmin } from "../../lib/auth";

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    const body = await req.json();
    const { fullName, email, phone, subject, message } = body;

    const missing = ["fullName", "email", "subject", "message"].filter(
      (f) => !body[f] || String(body[f]).trim() === ""
    );
    if (missing.length) {
      return NextResponse.json(
        { error: `Eksik alanlar: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const msg = await db.shopContactMessage.create({
      data: {
        fullName: String(fullName).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : null,
        subject: String(subject).trim(),
        message: String(message).trim(),
        userId: user?.id ?? null,
        status: "NEW",
      },
    });

    return NextResponse.json(
      { ok: true, id: msg.id, message: "Mesajınız alındı" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[shop/contact POST]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const guard = await requireShopAdmin();
    if (guard.error)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    const messages = await db.shopContactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    const unread = messages.filter((m) => m.status === "NEW").length;
    return NextResponse.json({ messages, unread });
  } catch (err: any) {
    console.error("[shop/contact GET]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
