"use client";
import React, { useEffect, useState } from "react";
import Container from "../Container";
import Title from "../Title";
import CategoryList from "./CategoryList";
import { Loader2 } from "lucide-react";
import ProductCard from "../ProductCard";
import NoProductAvailable from "../new/NoProductAvailable";
import BrandList from "./BrandList";
import { useSearchParams } from "next/navigation";
import PriceList from "./PriceList";
import type { ShopHomeProduct } from "@/app/queries/shop";

// Sanity kaldırıldı; kategori/marka için minimal yerel tipler.
type Category = {
  _id: string;
  title?: string;
  slug?: { current?: string };
  image?: string;
};
type Brand = {
  _id: string;
  title?: string;
  slug?: { current?: string };
  image?: string;
};

interface Props {
  categories: Category[];
  brands: Brand[];
}

const Shop = ({ categories, brands }: Props) => {
  const searchParams = useSearchParams();
  const brandParams = searchParams?.get("brand");
  const [products, setProducts] = useState<ShopHomeProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    brandParams || null
  );
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Extract min and max price from selectedPrice
      let minPrice = 0;
      let maxPrice = 10000; // Default high value

      if (selectedPrice) {
        const [min, max] = selectedPrice.split("-").map(Number);
        minPrice = min;
        maxPrice = max;
      }

      // Ürünler Prisma API'sinden çekiliyor. Kategori/marka filtresi için
      // Prisma modeli yok; fiyat filtresi istemci tarafında uygulanıyor.
      const res = await fetch(`/shop/api/products`);
      const json = await res.json();
      const all = (json?.products ?? []) as ShopHomeProduct[];
      const data = all.filter(
        (p) => p.price >= minPrice && p.price <= maxPrice
      );
      setProducts(data);
    } catch (error) {
      console.log("Shop product fetching Error", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, selectedPrice]);

  return (
    <div className="bg-white border-t">
      <Container className="mt-5">
        <div className="sticky top-0 z-10 mb-5">
          <div className="flex justify-between items-center">
            <Title className="text-lg uppercase tracking-wide">
              Get the products as your needs
            </Title>
            {(selectedCategory !== null ||
              selectedBrand !== null ||
              selectedPrice !== null) && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedBrand(null);
                  setSelectedPrice(null);
                }}
                className="text-shop_dark_green underline text-sm mt-2 font-medium hover:text-darkRed hoverEffect"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-5 border-t border-t-shop_btn_dark_green/50">
          <div className="md:sticky md:top-20 md:self-start md:h-[calc(100vh-160px)] md:overflow-y-auto md:min-w-64 pb-5 scrollbar-hide border-r border-r-shop_btn_dark_green/50">
            <CategoryList
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
            <BrandList
              brands={brands}
              setSelectedBrand={setSelectedBrand}
              selectedBrand={selectedBrand}
            />
            <PriceList
              setSelectedPrice={setSelectedPrice}
              selectedPrice={selectedPrice}
            />
          </div>
          <div className="flex-1 pt-5">
            <div className="h-[calc(100vh-160px)] overflow-y-auto pr-2 scrollbar-hide">
              {loading ? (
                <div className="p-20 flex flex-col gap-2 items-center justify-center bg-white">
                  <Loader2 className="w-10 h-10 text-shop_dark_green animate-spin" />
                  <p className="font-semibold tracking-wide text-base">
                    Product is loading . . .
                  </p>
                </div>
              ) : products?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {products?.map((product) => (
                    <ProductCard key={product?.id} product={product} />
                  ))}
                </div>
              ) : (
                <NoProductAvailable className="bg-white mt-0" />
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Shop;
