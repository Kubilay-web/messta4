"use client";
import { Loader2, Search, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import AddToCartButton from "../AddToCartButton";
import PriceView from "../PriceView";
import Link from "next/link";
import Logo from "./Logo";
import type { ShopHomeProduct } from "@/app/queries/shop";

// Sanity yerine mevcut Prisma arama API'si kullanılır: /shop/api/products?q=
const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ShopHomeProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [featuredProduct, setFeaturedProduct] = useState<ShopHomeProduct[]>([]);

  const fetchFeaturedProducts = async () => {
    try {
      const res = await fetch("/shop/api/products");
      const data = await res.json();
      setFeaturedProduct((data?.products ?? []).slice(0, 6));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    if (showSearch === true) {
      fetchFeaturedProducts();
    }
  }, [showSearch]);

  // Prisma'dan arama girdisine göre ürünleri getirir.
  const fetchProducts = useCallback(async () => {
    if (!search) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/shop/api/products?q=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      setProducts(data?.products ?? []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  // API çağrılarını azaltmak için girdi değişikliklerini geciktir (debounce).
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, fetchProducts]);

  return (
    <Dialog open={showSearch} onOpenChange={() => setShowSearch(!showSearch)}>
      <DialogTrigger
        onClick={() => setShowSearch(!showSearch)}
        className="flex items-center"
      >
        <Search className="w-5 h-5 hover:text-[#16a34a] transition-all duration-300" />
      </DialogTrigger>
      <DialogContent className="max-w-5xl min-h-[90vh] max-h-[90vh] flex flex-col overflow-hidden bg-white text-black">
        <DialogHeader>
          <DialogTitle className="mb-1">Product Searchbar</DialogTitle>
          <form className="relative" onSubmit={(e) => e.preventDefault()}>
            <Input
              placeholder="Search your product here..."
              className="flex-1 rounded-md py-5 bg-white text-black placeholder:text-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <X
                onClick={() => setSearch("")}
                className="w-4 h-4 absolute top-3 right-11 hover:text-red-600 transition-all duration-300 cursor-pointer"
              />
            )}
            <button
              type="submit"
              className="absolute right-0 top-0 bg-[#15803d]/10 w-10 h-full flex items-center justify-center rounded-tr-md hover:bg-[#15803d] hover:text-white transition-all duration-300"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </DialogHeader>
        <div className="w-full h-full overflow-y-scroll border border-[#151515]/20 rounded-md">
          <div>
            {loading ? (
              <p className="flex items-center px-6 gap-1 py-10 text-center text-green-600 font-semibold">
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching on progress...
              </p>
            ) : products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product?.id}
                  className="bg-white overflow-hidden border-b"
                >
                  <div className="flex items-center p-1">
                    <Link
                      href={`/shop/${product?.slug}`}
                      onClick={() => setShowSearch(false)}
                      className="h-20 w-20 md:h-24 md:w-24 shrink-0 border border-[#151515]/20 rounded-md overflow-hidden group"
                    >
                      {product?.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt={product?.name ?? "productImage"}
                          className={`object-cover w-full h-full group-hover:scale-110 transition-transform duration-300 ${
                            product?.stock === 0 ? "opacity-50" : ""
                          }`}
                        />
                      )}
                    </Link>
                    <div className="px-4 py-2 grow">
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/shop/${product?.slug}`}
                          onClick={() => setShowSearch(false)}
                        >
                          <h3 className="text-sm md:text-lg font-semibold text-gray-800 line-clamp-1">
                            {product.name}
                          </h3>
                        </Link>
                        <PriceView
                          price={product?.price}
                          oldPrice={product?.oldPrice}
                          currency={product?.currency}
                          className="md:text-lg"
                        />
                      </div>

                      <div className="w-60 mt-1">
                        <AddToCartButton product={product} className="w-44" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="py-5 px-3 bg-white text-black font-semibold tracking-wide">
                  {search === "" && products.length === 0 && (
                    <p className="text-black flex items-center gap-1">
                      <Search className="w-5 h-5" />
                      Search and explore your products from{" "}
                      <Logo className="text-base" />
                    </p>
                  )}
                  {search && products.length === 0 && (
                    <p>
                      Nothing match with the keyword{" "}
                      <span className="underline text-red-600">{search}</span>.
                      Please try something else.
                    </p>
                  )}
                </div>
                <div className="space-y-2 flex flex-col my-5">
                  {featuredProduct.length > 0 &&
                    featuredProduct.map((item) => (
                      <button
                        key={item?.id}
                        onClick={() => setSearch(item?.name as string)}
                        className="flex items-center gap-x-2 text-base font-medium hover:bg-[#93D991]/30 px-3 py-1.5"
                      >
                        <Search className="w-5 h-5" /> {item?.name}
                      </button>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchBar;
