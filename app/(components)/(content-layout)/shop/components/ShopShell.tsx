"use client";

// app/(components)/(content-layout)/shop/components/ShopShell.tsx
// Shop - sunucu layout'unun içine yerleşen istemci kabuğu.
// Ayarlar context'ini (dil/para) sağlar ve üst araç çubuğunu render eder.

import React from "react";
import { ShopSettingsProvider } from "../lib/shop-settings";
import { ShopLang } from "../lib/dictionary";
import ShopToolbar from "./ShopToolbar";

export default function ShopShell({
  isAdmin,
  initialLang,
  children,
}: {
  isAdmin: boolean;
  initialLang: ShopLang;
  children: React.ReactNode;
}) {
  return (
    <ShopSettingsProvider initialLang={initialLang}>
      <ShopToolbar isAdmin={isAdmin} />
      {children}
    </ShopSettingsProvider>
  );
}
