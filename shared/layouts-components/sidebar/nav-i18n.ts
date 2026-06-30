// shared/layouts-components/sidebar/nav-i18n.ts
// Sidebar menü başlıkları için TR/EN/DE çeviri haritası.
// Kaynak (anahtar) Türkçe başlıktır; tr için olduğu gibi döner, en/de için
// karşılığı yoksa yine kaynağı döndürür (zarif geri dönüş).

import { ClientLocale } from "@/app/lib/useLocale";

const NAV_DICT: Record<"en" | "de", Record<string, string>> = {
  en: {
    // Bölüm başlıkları (menutitle)
    "MAĞAZA": "STORE",
    // Menü öğeleri (title)
    Shop: "Shop",
    Anasayfa: "Home",
    Mağaza: "Store",
    "Admin Paneli": "Admin Panel",
  },
  de: {
    "MAĞAZA": "SHOP",
    Shop: "Shop",
    Anasayfa: "Startseite",
    Mağaza: "Shop",
    "Admin Paneli": "Admin-Panel",
  },
};

export function translateNav(
  text: string | undefined | null,
  lang: ClientLocale
): string {
  if (!text) return text ?? "";
  if (lang === "tr") return text;
  return NAV_DICT[lang]?.[text] ?? text;
}
