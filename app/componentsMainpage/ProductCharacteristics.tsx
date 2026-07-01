import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import type { ShopHomeProduct } from "@/app/queries/shop";

// TODO: Prisma karşılığı yok — geçici stub (Sanity getBrand yerine).
const getBrand = async (
  _slug: string
): Promise<{ brandName: string }[] | null> => null;

// ShopHomeProduct'ta olmayan variant alanı opsiyonel eklenir.
type CharacteristicsProduct = ShopHomeProduct & { variant?: string };

const ProductCharacteristics = async ({
  product,
}: {
  product: CharacteristicsProduct;
}) => {
  const brand = await getBrand(product?.slug as string);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="font-bold">
          {product?.name}: Characteristics
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-1">
          <p className="flex items-center justify-between">
            Brand:{" "}
            {brand && (
              <span className="font-semibold tracking-wide">
                {brand[0]?.brandName}
              </span>
            )}
          </p>
          <p className="flex items-center justify-between">
            Collection:{" "}
            <span className="font-semibold tracking-wide">2025</span>
          </p>
          <p className="flex items-center justify-between">
            Type:{" "}
            <span className="font-semibold tracking-wide">
              {product?.variant}
            </span>
          </p>
          <p className="flex items-center justify-between">
            Stock:{" "}
            <span className="font-semibold tracking-wide">
              {product?.stock ? "Available" : "Out of Stock"}
            </span>
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ProductCharacteristics;
