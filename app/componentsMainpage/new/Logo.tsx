import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

interface Props {
  className?: string;
}

const Logo = ({ className }: Props) => {
  return (
    <Link href={"/"}>
      <h2
        className={cn(
          "text-2xl md:text-4xl text-[#15803d] font-black tracking-wider uppercase hover:text-[#16a34a] transition-all duration-300 group font-sans",
          className
        )}
      >
        Betprin
        <span className="text-[#16a34a] group-hover:text-[#15803d] transition-all duration-300">
          t
        </span>
      </h2>
    </Link>
  );
};

export default Logo;
