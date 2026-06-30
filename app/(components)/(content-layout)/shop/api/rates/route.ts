// app/(components)/(content-layout)/shop/api/rates/route.ts
// Shop - güncel döviz kurlarını (USD bazlı TRY/USD/EUR) istemciye verir.
import { NextResponse } from "next/server";
import { getRates } from "../../lib/rates";

export async function GET() {
  const rates = await getRates();
  return NextResponse.json({ rates });
}
