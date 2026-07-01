import { twMerge } from "tailwind-merge";

interface Props {
  amount: number | undefined;
  currency?: string;
  className?: string;
}

const localeByCurrency: Record<string, string> = {
  TRY: "tr-TR",
  EUR: "de-DE",
  USD: "en-US",
};

const PriceFormatter = ({ amount, currency = "EUR", className }: Props) => {
  const locale = localeByCurrency[currency] ?? "de-DE";
  const formattedPrice = Number(amount).toLocaleString(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });

  return (
    <span
      className={twMerge("text-sm font-semibold text-[#151515]", className)}
    >
      {formattedPrice}
    </span>
  );
};

export default PriceFormatter;
