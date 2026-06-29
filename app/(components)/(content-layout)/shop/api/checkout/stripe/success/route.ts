// app/(components)/(content-layout)/shop/api/checkout/stripe/success/route.ts
// Stripe ödemesi sonrası dönüş noktası. Ödemeyi doğrular, siparişi
// PAID yapar ve kullanıcıyı /shop'a başarı bayrağıyla geri yollar.
import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/db";
import Stripe from "stripe";
import { sendInvoiceEmail } from "../../../../lib/invoice";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const sessionId = request.nextUrl.searchParams.get("session_id");
  let orderId = request.nextUrl.searchParams.get("order_id");

  console.log("[shop/stripe success] callback:", { sessionId, orderId });

  if (!sessionId) {
    return NextResponse.redirect(`${baseUrl}/shop?payment_error=1`);
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // order_id parametresi kaybolursa checkout'ta yazdığımız metadata'dan kurtar
    if (!orderId) {
      orderId = session.metadata?.orderId ?? null;
    }

    console.log("[shop/stripe success] session:", {
      payment_status: session.payment_status,
      orderId,
    });

    if (session.payment_status !== "paid" || !orderId) {
      return NextResponse.redirect(`${baseUrl}/shop?payment_error=1`);
    }

    // Mevcut durumu oku: yalnızca ilk PAID geçişinde fatura maili gönder
    // (kullanıcı sayfayı yenilerse çift mail önlenir).
    const existing = await db.shopOrder.findUnique({
      where: { id: orderId },
      include: { product: { select: { name: true, currency: true } } },
    });
    const alreadyPaid = existing?.status === "PAID";

    const order = await db.shopOrder.update({
      where: { id: orderId },
      data: { status: "PAID" },
      include: { product: { select: { name: true, currency: true } } },
    });

    if (!alreadyPaid) {
      try {
        await sendInvoiceEmail({
          id: order.id,
          createdAt: order.createdAt,
          customerName: order.customerName,
          email: order.email,
          phone: order.phone,
          address: order.address,
          city: order.city,
          quantity: order.quantity,
          unitPrice: order.unitPrice,
          totalPrice: order.totalPrice,
          status: order.status,
          productName: order.product?.name || "Ürün",
          currency: order.product?.currency || "TRY",
        });
      } catch (mailErr) {
        console.error("[shop/stripe success] fatura maili gonderilemedi", mailErr);
      }
    }

    console.log("[shop/stripe success] order marked PAID:", orderId);
    return NextResponse.redirect(`${baseUrl}/shop?payment_success=1`);
  } catch (error) {
    console.error("[shop/checkout stripe success]", error);
    return NextResponse.redirect(`${baseUrl}/shop?payment_error=1`);
  }
}
