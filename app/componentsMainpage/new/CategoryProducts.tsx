"use client";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import ProductCard from "../ProductCard";
import NoProductAvailable from "./NoProductAvailable";
import { useRouter } from "next/navigation";
import type { ShopHomeProduct } from "@/app/queries/shop";

// Sanity kaldırıldı; kategori için minimal yerel tip.
type Category = {
  _id: string;
  title?: string;
  slug?: { current?: string };
};

interface Props {
  categories: Category[];
  slug: string;
}

const CategoryProducts = ({ categories, slug }: Props) => {
  const [currentSlug, setCurrentSlug] = useState(slug);
  const [products, setProducts] = useState<ShopHomeProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchProducts = async (categorySlug: string) => {
    try {
      setLoading(true);
      // Prisma API'sinden ürünler. Kategori filtresi için model olmadığından
      // arama terimi olarak slug kullanılıyor.
      const res = await fetch(
        `/shop/api/products?q=${encodeURIComponent(categorySlug)}`
      );
      const json = await res.json();
      setProducts((json?.products ?? []) as ShopHomeProduct[]);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentSlug);
  }, [router]);

  const handleCategoryChange = (newSlug: string) => {
    if (newSlug === currentSlug) return; // Prevent unnecessary updates
    setCurrentSlug(newSlug);
    router.push(`/category/${newSlug}`, { scroll: false }); // Update URL without
  };

  return (
    <div className="py-5 flex flex-col md:flex-row items-start gap-5">
      <div className="flex flex-col md:min-w-40 border">
        {categories?.map((item) => (
          <Button
            key={item?._id}
            onClick={() => handleCategoryChange(item?.slug?.current as string)}
            className={`bg-transparent border-0 p-0 rounded-none text-darkColor shadow-none hover:bg-darkRed hover:text-white font-semibold hoverEffect border-b last:border-b-0 capitalize ${item?.slug?.current === currentSlug ? "bg-darkRed text-white border-darkRed" : ""}`}
          >
            <p className="w-full text-left px-2">{item?.title}</p>
          </Button>
        ))}
      </div>
      <div className="w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 min-h-80 space-y-4 text-center bg-gray-100 rounded-lg w-full">
            <motion.div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Product is loading...</span>
            </motion.div>
          </div>
        ) : products?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <>
              {products?.map((product) => (
                <AnimatePresence key={product?.id}>
                  <motion.div
                    layout
                    initial={{ opacity: 0.2 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ProductCard key={product?.id} product={product} />
                  </motion.div>
                </AnimatePresence>
              ))}
            </>
          </div>
        ) : (
          <NoProductAvailable
            selectedTab={currentSlug}
            className="mt-0 w-full"
          />
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
