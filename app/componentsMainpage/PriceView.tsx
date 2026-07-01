import { twMerge } from "tailwind-merge";
import PriceFormatter from "./PriceFormatter";
import { cn } from "@/lib/utils";

interface Props {
  price: number | undefined;
  oldPrice?: number | null;
  currency?: string;
  className?: string;
}

const PriceView = ({ price, oldPrice, currency, className }: Props) => {
  const onSale = oldPrice != null && price != null && oldPrice > price;
  return (
    <div className="flex items-center justify-between gap-5">
      <div className="flex items-center gap-2">
        <PriceFormatter
          amount={price}
          currency={currency}
          className={cn("text-[#15803d]", className)}
        />
        {onSale && (
          <PriceFormatter
            amount={oldPrice as number}
            currency={currency}
            className={twMerge(
              "line-through text-xs font-normal text-zinc-500",
              className
            )}
          />
        )}
      </div>
    </div>
  );
};

export default PriceView;
