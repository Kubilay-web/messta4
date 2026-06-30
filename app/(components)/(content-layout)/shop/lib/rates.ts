// app/(components)/(content-layout)/shop/lib/rates.ts
// Shop - canlı döviz kuru yardımcısı.
// exchangerate-api.com (v6) servisinden EXCHANGE_RATE_API_KEY ile USD bazlı kurları
// çeker, 1 saat in-memory cache'ler ve TRY/USD/EUR arası dönüşüm yapar.
// Hem /shop/api/rates route'u hem de checkout sunucu tarafı kullanır.

export type ShopCurrency = "TRY" | "USD" | "EUR";
export const SHOP_CURRENCIES: ShopCurrency[] = ["TRY", "USD", "EUR"];

export const CURRENCY_SYMBOL: Record<string, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

// USD bazlı kur haritası: 1 USD = rates[X] birim X
export type RateMap = Record<string, number>;

// Servis erişilemezse kullanılacak yaklaşık yedek kurlar (USD bazlı)
const FALLBACK: RateMap = { USD: 1, EUR: 0.92, TRY: 39 };

let cache: { rates: RateMap; at: number } | null = null;
const TTL = 1000 * 60 * 60; // 1 saat

export async function getRates(): Promise<RateMap> {
  if (cache && Date.now() - cache.at < TTL) return cache.rates;

  const key = process.env.EXCHANGE_RATE_API_KEY;
  if (!key) {
    console.warn("[shop/rates] EXCHANGE_RATE_API_KEY yok, yedek kurlar kullanılıyor");
    return cache?.rates ?? FALLBACK;
  }

  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${key}/latest/USD`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    if (data?.result === "success" && data.conversion_rates) {
      const cr = data.conversion_rates;
      const rates: RateMap = {
        USD: 1,
        EUR: Number(cr.EUR) || FALLBACK.EUR,
        TRY: Number(cr.TRY) || FALLBACK.TRY,
      };
      cache = { rates, at: Date.now() };
      return rates;
    }
    console.error("[shop/rates] beklenmeyen yanıt:", data?.["error-type"] || data?.result);
  } catch (e) {
    console.error("[shop/rates]", e);
  }
  return cache?.rates ?? FALLBACK;
}

// from para biriminden to para birimine çevirir (USD bazlı çapraz kur)
export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: RateMap
): number {
  const f = rates[from] ?? FALLBACK[from] ?? 1;
  const t = rates[to] ?? FALLBACK[to] ?? 1;
  if (!f) return amount;
  return (amount / f) * t;
}
