"use client";

// app/(components)/(content-layout)/shop/lib/shop-settings.tsx
// Shop - müşteri tarafı dil + para birimi durumunu tutan context.
// Dil/para tercihini çerezde saklar, canlı kurları /shop/api/rates'ten çeker,
// t() çeviri ve money() para biçimlendirme yardımcıları sağlar.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DICT,
  DictKey,
  LANG_LOCALE,
  ShopLang,
} from "./dictionary";
import {
  convertAmount,
  RateMap,
  ShopCurrency,
} from "./rates";
import { setLocaleCookie } from "@/app/lib/useLocale";

const FALLBACK_RATES: RateMap = { USD: 1, EUR: 0.92, TRY: 39 };

// Para birimi çerezi (dil çerezi NEXT_LOCALE, useLocale yardımcısı üzerinden yönetilir).
const CURRENCY_COOKIE = "shop_currency";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  // 1 yıl
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${
    60 * 60 * 24 * 365
  };SameSite=Lax`;
}

interface ShopSettingsValue {
  lang: ShopLang;
  setLang: (l: ShopLang) => void;
  currency: ShopCurrency;
  setCurrency: (c: ShopCurrency) => void;
  rates: RateMap;
  t: (key: DictKey) => string;
  // amount'u (from para biriminde) seçili görüntüleme para birimine çevirir
  convert: (amount: number, from?: string) => number;
  // çevirip biçimlendirilmiş string döner (ör. "₺1.499,90")
  money: (amount: number, from?: string) => string;
}

const Ctx = createContext<ShopSettingsValue | null>(null);

export function ShopSettingsProvider({
  initialLang = "tr",
  children,
}: {
  initialLang?: ShopLang;
  children: React.ReactNode;
}) {
  // Başlangıç dili sunucudan (NEXT_LOCALE çerezi) gelir → ilk render doğru dilde
  const [lang, setLangState] = useState<ShopLang>(initialLang);
  const [currency, setCurrencyState] = useState<ShopCurrency>("TRY");
  const [rates, setRates] = useState<RateMap>(FALLBACK_RATES);

  // Para birimi tercihini çerezden oku (dil sunucudan geldiği için yalnızca para)
  useEffect(() => {
    const c = readCookie(CURRENCY_COOKIE);
    if (c === "TRY" || c === "USD" || c === "EUR") setCurrencyState(c);
  }, []);

  // Canlı kurları çek
  useEffect(() => {
    let active = true;
    fetch("/shop/api/rates", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (active && d?.rates) setRates(d.rates);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const setLang = useCallback((l: ShopLang) => {
    setLangState(l);
    // Çerez + <html lang> + "localechange" yayını (sidebar gibi dinleyiciler güncellenir)
    setLocaleCookie(l);
  }, []);

  const setCurrency = useCallback((c: ShopCurrency) => {
    setCurrencyState(c);
    writeCookie(CURRENCY_COOKIE, c);
  }, []);

  const t = useCallback(
    (key: DictKey) => DICT[lang]?.[key] ?? DICT.tr[key] ?? key,
    [lang]
  );

  const convert = useCallback(
    (amount: number, from = "TRY") =>
      convertAmount(amount, from, currency, rates),
    [currency, rates]
  );

  const money = useCallback(
    (amount: number, from = "TRY") => {
      const value = convertAmount(amount, from, currency, rates);
      return new Intl.NumberFormat(LANG_LOCALE[lang], {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(value);
    },
    [currency, rates, lang]
  );

  const value = useMemo<ShopSettingsValue>(
    () => ({ lang, setLang, currency, setCurrency, rates, t, convert, money }),
    [lang, setLang, currency, setCurrency, rates, t, convert, money]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShopSettings() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useShopSettings must be used within ShopSettingsProvider");
  return ctx;
}
