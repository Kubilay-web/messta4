"use client";

// app/(components)/(content-layout)/shop/components/ShopToolbar.tsx
// Shop - tüm mağaza sayfalarında üstte görünen genel araç çubuğu.
// Dil (TR/EN/DE) ve para birimi (₺/$/€) değiştiricileri + hızlı gezinme linkleri.

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { shopLogout } from "../lib/actions";
import { useShopSettings } from "../lib/shop-settings";
import { SHOP_LANGS } from "../lib/dictionary";
import { SHOP_CURRENCIES, CURRENCY_SYMBOL, ShopCurrency } from "../lib/rates";

export default function ShopToolbar({ isAdmin }: { isAdmin: boolean }) {
  const { lang, setLang, currency, setCurrency, t } = useShopSettings();
  const [openMenu, setOpenMenu] = useState<"lang" | "cur" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Dışarı tıklayınca açılır menüleri kapat
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpenMenu(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const activeLang = SHOP_LANGS.find((l) => l.code === lang) ?? SHOP_LANGS[0];

  return (
    <div className="sticky top-0 z-40 bg-white/90 dark:bg-bodybg/90 backdrop-blur border-b border-defaultborder dark:border-defaultborder/10">
      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-2 flex flex-wrap items-center gap-2">
        <Link
          href="/shop"
          className="font-bold text-primary text-lg me-2 flex items-center gap-1"
        >
          <i className="ri-store-2-line"></i>
          <span className="hidden sm:inline">{t("store")}</span>
        </Link>

        <Link
          href="/shop/orders"
          className="ti-btn ti-btn-light ti-btn-sm whitespace-nowrap"
        >
          <i className="ri-truck-line sm:me-1"></i>
          <span className="hidden sm:inline">{t("myOrders")}</span>
        </Link>
        <Link
          href="/shop/contact"
          className="ti-btn ti-btn-light ti-btn-sm whitespace-nowrap"
        >
          <i className="ri-customer-service-2-line sm:me-1"></i>
          <span className="hidden sm:inline">{t("contactUs")}</span>
        </Link>

        <div ref={ref} className="ms-auto flex items-center gap-2">
          {/* Para birimi seçici */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "cur" ? null : "cur")}
              className="ti-btn ti-btn-light ti-btn-sm whitespace-nowrap"
              title={t("currency")}
            >
              {CURRENCY_SYMBOL[currency]} {currency}
              <i className="ri-arrow-down-s-line ms-1"></i>
            </button>
            {openMenu === "cur" && (
              <div className="absolute end-0 mt-1 w-32 bg-white dark:bg-bodybg border border-defaultborder dark:border-defaultborder/10 rounded-md shadow-lg py-1 z-50">
                {SHOP_CURRENCIES.map((c: ShopCurrency) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCurrency(c);
                      setOpenMenu(null);
                    }}
                    className={`w-full text-start px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-bodybg2 flex items-center gap-2 ${
                      currency === c ? "text-primary font-medium" : ""
                    }`}
                  >
                    <span className="w-4">{CURRENCY_SYMBOL[c]}</span> {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dil seçici */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "lang" ? null : "lang")}
              className="ti-btn ti-btn-light ti-btn-sm whitespace-nowrap"
              title={t("language")}
            >
              <span className="me-1">{activeLang.flag}</span>
              <span className="hidden sm:inline">{activeLang.code.toUpperCase()}</span>
              <i className="ri-arrow-down-s-line ms-1"></i>
            </button>
            {openMenu === "lang" && (
              <div className="absolute end-0 mt-1 w-36 bg-white dark:bg-bodybg border border-defaultborder dark:border-defaultborder/10 rounded-md shadow-lg py-1 z-50">
                {SHOP_LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setOpenMenu(null);
                    }}
                    className={`w-full text-start px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-bodybg2 flex items-center gap-2 ${
                      lang === l.code ? "text-primary font-medium" : ""
                    }`}
                  >
                    <span>{l.flag}</span> {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAdmin && (
            <Link
              href="/shop/admin"
              className="ti-btn ti-btn-primary ti-btn-sm whitespace-nowrap"
            >
              <i className="ri-settings-3-line sm:me-1"></i>
              <span className="hidden sm:inline">{t("admin")}</span>
            </Link>
          )}

          <form action={shopLogout}>
            <button
              type="submit"
              className="ti-btn ti-btn-danger-light ti-btn-sm whitespace-nowrap"
              title={t("logout")}
            >
              <i className="ri-logout-box-r-line"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
