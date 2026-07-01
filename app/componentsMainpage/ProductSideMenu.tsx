"use client";
import { cn } from "@/lib/utils";
import type { ShopHomeProduct } from "@/app/queries/shop";
import useCartStore from "@/store";
import { Heart } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ProductSideMenu = ({
  product,
  className,
}: {
  product: ShopHomeProduct;
  className?: string;
}) => {
  const { favoriteProduct, addToFavorite } = useCartStore();
  const [existingProduct, setExistingProduct] =
    useState<ShopHomeProduct | null>(null);

  useEffect(() => {
    const availableItem = favoriteProduct.find(
      (item) => item?.id === product?.id
    );
    setExistingProduct(availableItem || null);
  }, [product, favoriteProduct]);

  const handleFavorite = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (product?.id) {
      addToFavorite(product).then(() => {
        toast.success(
          existingProduct
            ? "Product removed successfully!"
            : "Product added successfully!"
        );
      });
    }
  };
  return (
    <div className={cn("absolute top-2 right-2", className)}>
      <div
        onClick={handleFavorite}
        className={`p-2.5 rounded-full hover:bg-[#15803d]/80 hover:text-white transition-all duration-300 ${
          existingProduct
            ? "bg-[#15803d]/80 text-white"
            : "bg-[#f3f4f6]"
        }`}
      >
        <Heart size={15} />
      </div>
    </div>
  );
};

export default ProductSideMenu;
