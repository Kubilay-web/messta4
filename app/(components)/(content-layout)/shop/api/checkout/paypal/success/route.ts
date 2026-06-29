// app/(components)/(content-layout)/shop/api/checkout/paypal/success/route.ts
// PayPal onayı sonrası dönüş noktası. Ödemeyi capture eder, siparişi
// PAID yapar ve kullanıcıyı /shop'a başarı bayrağıyla geri yollar.
import { NextRequest, NextResponse } from "next/server";
import db from "@/app/lib/db";
import paypal from "@paypal/checkout-server-sdk";

const initializePayPal = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_SECRET!;
  const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
  return new paypal.core.PayPalHttpClient(environment);
};

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  // PayPal dönerken ?token=<paypalOrderId>&PayerID=... ekler
  const token = request.nextUrl.searchParams.get("token");
  let orderId = request.nextUrl.searchParams.get("order_id");

  console.log("[shop/paypal success] callback:", { token, orderId });

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/shop?payment_error=1`);
  }

  try {
    const client = initializePayPal();

    // 1) PayPal order'ı capture etmeye çalış. Daha önce capture edilmişse
    //    (kullanıcı sayfayı yenilemiş olabilir) tekrar denemeyip mevcut durumu okuyoruz.
    let captureStatus: string | undefined;
    try {
      const captureReq = new paypal.orders.OrdersCaptureRequest(token);
      // NOT: Boş requestBody göndermek bazı SDK sürümlerinde capture'ı reddediyor;
      // çalışan referansta (oneshop) olduğu gibi gövdesiz çağırıyoruz.
      const capture = await client.execute(captureReq);
      captureStatus = capture.result?.status;
      // reference_id checkout'ta order.id olarak set ediliyor; order_id parametresi
      // kaybolursa buradan kurtarıyoruz.
      if (!orderId) {
        orderId =
          capture.result?.purchase_units?.[0]?.reference_id ?? null;
      }
    } catch (captureErr: any) {
      // Zaten capture edilmiş olabilir -> order'ı getirip durumu doğrula
      const msg = JSON.stringify(captureErr?.message ?? captureErr ?? "");
      console.warn("[shop/paypal success] capture failed, verifying order:", msg);
      const getReq = new paypal.orders.OrdersGetRequest(token);
      const details = await client.execute(getReq);
      captureStatus = details.result?.status; // COMPLETED ise ödeme alınmış demektir
      if (!orderId) {
        orderId =
          details.result?.purchase_units?.[0]?.reference_id ?? null;
      }
    }

    const paid =
      captureStatus === "COMPLETED" || captureStatus === "APPROVED";

    if (!paid || !orderId) {
      console.error("[shop/paypal success] not paid:", { captureStatus, orderId });
      return NextResponse.redirect(`${baseUrl}/shop?payment_error=1`);
    }

    await db.shopOrder.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });

    console.log("[shop/paypal success] order marked PAID:", orderId);
    return NextResponse.redirect(`${baseUrl}/shop?payment_success=1`);
  } catch (error) {
    console.error("[shop/checkout paypal success]", error);
    return NextResponse.redirect(`${baseUrl}/shop?payment_error=1`);
  }
}
