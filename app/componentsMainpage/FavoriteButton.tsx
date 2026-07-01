"use client";
import type { ShopHomeProduct } from "@/app/queries/shop";
import useCartStore from "@/store";
import { Heart } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const FavoriteButton = ({
  showProduct = false,
  product,
}: {
  showProduct?: boolean;
  product?: ShopHomeProduct;
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

  const handleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
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
    <>
      {!showProduct ? (
        <Link
          href={"/wishlist"}
          className="group relative hover:text-[#16a34a] transition-all duration-300"
        >
          <Heart className="group-hover:text-[#16a34a] transition-all duration-300 mt-0.5 w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-[#166534] text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center">
            {favoriteProduct?.length ? favoriteProduct?.length : 0}
          </span>
        </Link>
      ) : (
        <button
          onClick={handleFavorite}
          className="group relative hover:text-[#16a34a] transition-all duration-300 border border-[#16a34a]/80 p-1.5 rounded-sm"
        >
          <Heart
            fill={existingProduct ? "#063c28" : "#fff"}
            className="text-[#16a34a]/80 group-hover:text-[#16a34a] transition-all duration-300 mt-0.5 w-5 h-5"
          />
        </button>
      )}
    </>
  );
};

export default FavoriteButton;
