import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Flame } from "lucide-react";
import PriceView from "./PriceView";
import AddToCartButton from "./AddToCartButton";
import Title from "./Title";
import ProductSideMenu from "./ProductSideMenu";
import type { ShopHomeProduct } from "@/app/queries/shop";

const ProductCard = ({ product }: { product: ShopHomeProduct }) => {
  const isOutOfStock = product?.stock === 0;
  const onSale = product?.oldPrice != null && product.oldPrice > product.price;
  const rounded = Math.round(product?.rating ?? 0);

  return (
    <div className="text-sm border rounded-md border-[#15803d]/20 group bg-white">
      <div className="relative group overflow-hidden bg-[#f5f5f5]">
        {product?.images?.[0] && (
          <Link href={`/shop/${product?.slug}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[0]}
              className={`w-full h-64 object-contain overflow-hidden transition-transform bg-[#f5f5f5] duration-500 ${
                !isOutOfStock ? "group-hover:scale-105" : "opacity-50"
              }`}
              alt={product?.name ?? "productImage"}
              loading="lazy"
            />
          </Link>
        )}
        <ProductSideMenu product={product} />
        {onSale ? (
          <p className="absolute top-2 left-2 z-10 text-xs border border-[#151515]/50 px-2 rounded-full bg-white/80 group-hover:border-[#93D991] hover:text-[#15803d] transition-all duration-300">
            Sale!
          </p>
        ) : (
          <Link
            href={"/deal"}
            className="absolute top-2 left-2 z-10 border border-[#fb6c08]/50 p-1 rounded-full bg-white/80 group-hover:border-[#fb6c08] hover:text-[#15803d] transition-all duration-300"
          >
            <Flame
              size={18}
              fill="#fb6c08"
              className="text-[#fb6c08]/50 group-hover:text-[#fb6c08] transition-all duration-300"
            />
          </Link>
        )}
      </div>
      <div className="p-3 flex flex-col gap-2">
        <Title className="text-sm line-clamp-1">{product?.name}</Title>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                size={13}
                className={index < rounded ? "text-[#93D991]" : "text-[#ababab]"}
                fill={index < rounded ? "#93D991" : "#ababab"}
              />
            ))}
          </div>
          <p className="text-[#6b7280] text-xs tracking-wide">
            {product?.numReviews} Reviews
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <p className="font-medium">In Stock</p>
          <p
            className={`${isOutOfStock ? "text-red-600" : "text-[#15803d]/80 font-semibold"}`}
          >
            {!isOutOfStock ? product?.stock : "unavailable"}
          </p>
        </div>

        <PriceView
          price={product?.price}
          oldPrice={product?.oldPrice}
          currency={product?.currency}
          className="text-sm"
        />
        <AddToCartButton product={product} className="w-full rounded-full" />
      </div>
    </div>
  );
};

export default ProductCard;
