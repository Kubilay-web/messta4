"use client";

import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { useShopSettings } from "./lib/shop-settings";

interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number | null;
  currency: string;
  images: string[];
  stock: number;
  rating: number;
  numReviews: number;
}

const Shop = () => {
  const { t, money } = useShopSettings();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchProducts = async (q = "") => {
    setLoading(true);
    try {
      const res = await fetch(
        `/shop/api/products${q ? `?q=${encodeURIComponent(q)}` : ""}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      toast.error("Ürünler getirilemedi");
    } finally {
      setLoading(false);
    }
  };

  const fetchMe = async () => {
    try {
      const res = await fetch("/shop/api/me", { cache: "no-store" });
      const data = await res.json();
      if (data.user) setIsAdmin(!!data.user.isAdmin);
    } catch {}
  };

  useEffect(() => {
    fetchProducts();
    fetchMe();
  }, []);

  // Ödeme dönüşü bildirimleri
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment_success")) {
      toast.success("Ödeme başarılı! Faturanız e-posta ile gönderildi.");
    } else if (params.get("payment_cancelled")) {
      toast.warning("Ödeme iptal edildi.");
    } else if (params.get("payment_error")) {
      toast.error("Ödeme tamamlanamadı. Lütfen tekrar deneyin.");
    } else {
      return;
    }
    window.history.replaceState({}, "", "/shop");
  }, []);

  // arama: yazarken 400ms debounce
  useEffect(() => {
    const tm = setTimeout(() => fetchProducts(search), 400);
    return () => clearTimeout(tm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const seedDemo = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/shop/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Premium Ürün",
          slug: "premium-urun",
          description:
            "Mağazamızın örnek ürünü. Yüksek kalite, hızlı kargo ve güvenli ödeme.",
          price: 1499.9,
          oldPrice: 1999.9,
          currency: "TRY",
          images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900",
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900",
          ],
          features: ["Ücretsiz kargo", "14 gün iade", "2 yıl garanti"],
          stock: 25,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Demo ürün eklendi");
      fetchProducts();
    } catch (e: any) {
      toast.error(e.message || "Eklenemedi");
    } finally {
      setSeeding(false);
    }
  };

  const discount = (p: ShopProduct) =>
    p.oldPrice && p.oldPrice > p.price
      ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
      : 0;

  return (
    <Fragment>
      <Toaster richColors position="top-right" />

      <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-[1400px] mx-auto w-full">
        {/* Sayfa başlığı */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold mb-0">{t("store")}</h1>
          <nav className="flex items-center gap-2 text-sm text-muted">
            <span>{t("ecommerce")}</span>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-primary">{t("store")}</span>
          </nav>
        </div>

        {/* Arama */}
        <div className="box">
          <div className="box-body">
            <div className="relative flex-1 min-w-0">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="form-control w-full"
              />
            </div>
          </div>
        </div>

        {/* Yükleniyor */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <span className="ti-spinner text-primary" role="status">
              <span className="sr-only">{t("loading")}</span>
            </span>
            <span className="ms-3 text-muted">{t("productsLoading")}</span>
          </div>
        )}

        {/* Ürün yok */}
        {!loading && products.length === 0 && (
          <div className="box">
            <div className="box-body flex flex-col items-center justify-center text-center gap-4 py-16">
              <i className="ri-shopping-bag-3-line text-[3rem] text-muted"></i>
              <div>
                <h5 className="font-semibold mb-1">
                  {search ? t("noProductsResultTitle") : t("noProductsTitle")}
                </h5>
                <p className="text-muted mb-0">
                  {search ? t("noProductsResultDesc") : t("comingSoon")}
                </p>
              </div>
              {!search && isAdmin && (
                <div className="flex flex-wrap justify-center gap-2">
                  <Link href="/shop/admin" className="ti-btn ti-btn-primary">
                    Ürün Ekle
                  </Link>
                  <button
                    onClick={seedDemo}
                    disabled={seeding}
                    className="ti-btn ti-btn-light"
                  >
                    {seeding ? "Ekleniyor..." : "Demo ürün ekle"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ürün listesi */}
        {!loading && products.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                className="box !mb-0 overflow-hidden group hover:shadow-lg transition-shadow flex flex-col
                  basis-full
                  sm:basis-[calc(50%-0.5rem)]
                  lg:basis-[calc(33.333%-0.667rem)]
                  xl:basis-[calc(25%-0.75rem)]"
              >
                <div className="relative aspect-square bg-gray-50 dark:bg-bodybg2 overflow-hidden">
                  {discount(p) > 0 && (
                    <span className="absolute top-2 start-2 z-10 badge bg-danger text-white text-xs px-2 py-1 rounded">
                      %{discount(p)}
                    </span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.images[0] || "https://via.placeholder.com/400?text=Urun"}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="box-body flex flex-col gap-2 flex-1">
                  <h6 className="font-semibold truncate mb-0" title={p.name}>
                    {p.name}
                  </h6>
                  <div className="flex items-center gap-1 text-warning text-xs">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i
                        key={i}
                        className={
                          i < Math.round(p.rating) ? "ri-star-fill" : "ri-star-line"
                        }
                      ></i>
                    ))}
                    <span className="text-muted ms-1">({p.numReviews})</span>
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <span className="text-lg font-bold text-primary">
                      {money(p.price, p.currency)}
                    </span>
                    {p.oldPrice && p.oldPrice > p.price && (
                      <span className="text-muted line-through text-sm">
                        {money(p.oldPrice, p.currency)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                    {p.stock > 0 ? (
                      <span className="badge bg-success/10 text-success text-xs">
                        {t("inStock")}: {p.stock}
                      </span>
                    ) : (
                      <span className="badge bg-danger/10 text-danger text-xs">
                        {t("soldOut")}
                      </span>
                    )}
                    <span className="text-primary text-sm font-medium whitespace-nowrap">
                      {t("examine")} <i className="ri-arrow-right-line"></i>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default Shop;
