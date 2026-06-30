// app/lib/locale.ts
// Tek, paylaşılan dil çerezi (NEXT_LOCALE — Next.js konvansiyonu).
// Hem mağaza hem genel sayfalar bunu kullanır; sunucu tarafında okunup
// <html lang> ve provider başlangıç diline beslenir (SEO + flash önleme).

import { cookies } from "next/headers";

export type AppLocale = "tr" | "en" | "de";
export const APP_LOCALES: AppLocale[] = ["tr", "en", "de"];
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isAppLocale(v: unknown): v is AppLocale {
  return v === "tr" || v === "en" || v === "de";
}

// Sunucu bileşenlerinde geçerli dili çerezden okur (yoksa "tr").
export async function getServerLocale(): Promise<AppLocale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isAppLocale(v) ? v : "tr";
}
