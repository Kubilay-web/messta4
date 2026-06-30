// app/(components)/(content-layout)/shop/api/checkout/route.ts
// Shop - ödeme başlatma (checkout) endpoint'i.
// Siparişi PENDING olarak oluşturur, stoğu düşürür ve seçilen
// ödeme yöntemine göre (Stripe / PayPal) ödeme oturumu açıp
// kullanıcının yönlendirileceği URL'i döner.
import db from "@/app/lib/db";
import { validateRequest } from "@/app/auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import paypal from "@paypal/checkout-server-sdk";
import { getRates, convertAmount, SHOP_CURRENCIES } from "../../lib/rates";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

// PayPal sandbox client
const initializePayPal = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_SECRET!;
  const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
  return new paypal.core.PayPalHttpClient(environment);
};

const PAYMENT_METHODS = ["stripe", "paypal", "cod_cash", "cod_card"];

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, quantity, paymentMethod } = body;

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

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Geçersiz ödeme yöntemi" },
        { status: 400 }
      );
    }

    const qty = Math.max(1, Number(quantity) || 1);

    // Ürünü ve fiyatı sunucudan al (client'a güvenme)
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

    // Seçilen para birimi (alıcının görüntüleme tercihi). Fiyatı canlı kurla çevir.
    const currency = SHOP_CURRENCIES.includes(body.currency)
      ? body.currency
      : product.currency;
    const rates = await getRates();
    const unitPrice = Number(
      convertAmount(product.price, product.currency, currency, rates).toFixed(2)
    );
    const totalPrice = Number((unitPrice * qty).toFixed(2));

    const isCod = paymentMethod === "cod_cash" || paymentMethod === "cod_card";

    // Siparişi PENDING (Sipariş Alındı) olarak oluştur ve stoğu düş
    const order = await db.shopOrder.create({
      data: {
        productId: product.id,
        userId: user.id,
        quantity: qty,
        unitPrice,
        totalPrice,
        currency,
        paymentMethod,
        customerName: String(body.customerName).trim(),
        email: String(body.email).trim(),
        phone: String(body.phone).trim(),
        address: String(body.address).trim(),
        city: String(body.city).trim(),
        note: body.note ? String(body.note).trim() : null,
        status: "PENDING",
      },
    });

    await db.shopProduct.update({
      where: { id: product.id },
      data: { stock: { decrement: qty } },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // ---- KAPIDA ÖDEME (COD) ----
    // Ödeme teslimatta yapılacağı için ödeme sağlayıcısına yönlendirme yok.
    if (isCod) {
      return NextResponse.json({
        ok: true,
        cod: true,
        orderId: order.id,
        redirectUrl: `/shop/orders?order_success=1`,
      });
    }

    // Stok geri alma (ödeme başlatılamazsa)
    const rollback = async () => {
      try {
        await db.shopProduct.update({
          where: { id: product.id },
          data: { stock: { increment: qty } },
        });
        await db.shopOrder.update({
          where: { id: order.id },
          data: { status: "CANCELLED" },
        });
      } catch (e) {
        console.error("[shop/checkout rollback]", e);
      }
    };

    // ---- STRIPE ----
    if (paymentMethod === "stripe") {
      try {
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          customer_email: order.email,
          line_items: [
            {
              price_data: {
                currency: currency.toLowerCase(),
                product_data: {
                  name: product.name,
                  images: product.images?.length ? [product.images[0]] : [],
                },
                unit_amount: Math.round(unitPrice * 100),
              },
              quantity: qty,
            },
          ],
          metadata: { orderId: order.id },
          success_url: `${baseUrl}/shop/api/checkout/stripe/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
          cancel_url: `${baseUrl}/shop?payment_cancelled=1`,
        });

        return NextResponse.json({
          ok: true,
          paymentUrl: session.url,
          orderId: order.id,
        });
      } catch (error: any) {
        await rollback();
        console.error("[shop/checkout stripe]", error);
        return NextResponse.json(
          { error: `Stripe hatası: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // ---- PAYPAL ----
    try {
      const client = initializePayPal();
      const request = new paypal.orders.OrdersCreateRequest();

      // PayPal sandbox TRY desteklemediği için tutarı USD'ye çeviriyoruz.
      const usdTotal = convertAmount(totalPrice, currency, "USD", rates).toFixed(2);

      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: order.id,
            description: `${product.name} x${qty}`,
            amount: {
              currency_code: "USD",
              value: usdTotal,
            },
          },
        ],
        application_context: {
          brand_name: "Mağaza",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
          return_url: `${baseUrl}/shop/api/checkout/paypal/success?order_id=${order.id}`,
          cancel_url: `${baseUrl}/shop?payment_cancelled=1`,
        },
      });

      const response = await client.execute(request);
      if (response.statusCode !== 201) {
        throw new Error(`PayPal durum kodu: ${response.statusCode}`);
      }

      const approvalUrl = response.result.links.find(
        (l: any) => l.rel === "approve"
      )?.href;
      if (!approvalUrl) throw new Error("Onay URL'i bulunamadı");

      return NextResponse.json({
        ok: true,
        paymentUrl: approvalUrl,
        orderId: order.id,
      });
    } catch (error: any) {
      await rollback();
      console.error("[shop/checkout paypal]", error);
      return NextResponse.json(
        { error: `PayPal hatası: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("[shop/checkout POST]", err);
    return NextResponse.json(
      { error: err.message || "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
