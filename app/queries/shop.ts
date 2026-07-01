import { cache } from "react";
import prisma from "@/app/lib/prisma";

// Ana sayfada gösterilen ürün için gereken minimum alanlar.
// Sadece bu alanları select ederek DB'den en az veriyi en hızlı çekiyoruz.
export type ShopHomeProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  currency: string;
  images: string[];
  stock: number;
  rating: number;
  numReviews: number;
};

/**
 * Ana sayfa için aktif (yayında) ShopProduct'ları çeker.
 *
 * Hız için:
 *  - Tek sorgu (round-trip yok, waterfall yok)
 *  - `select` ile yalnızca gerekli kolonlar
 *  - `take` ile sınırlı satır
 *  - React `cache()` ile aynı istek içinde tekrar çağrılırsa DB'ye tekrar gitmez
 */
export const getHomeShopProducts = cache(
  async (limit = 8): Promise<ShopHomeProduct[]> => {
    return prisma.shopProduct.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        oldPrice: true,
        currency: true,
        images: true,
        stock: true,
        rating: true,
        numReviews: true,
      },
    });
  }
);
