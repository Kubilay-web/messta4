"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Sanity/@constants yok — navigasyon verisi burada tanımlı.
const headerData = [
  { title: "Home", href: "/" },
  { title: "Shop", href: "/shop" },
  { title: "Orders", href: "/shop/orders" },
  { title: "Contact", href: "/shop/contact" },
];

const HeaderMenu = () => {
  const pathname = usePathname();

  return (
    <div className="hidden md:inline-flex w-1/3 items-center justify-center gap-7 text-lg capitalize font-semibold text-[#374151]">
      {headerData?.map((item) => (
        <Link
          key={item?.title}
          href={item?.href}
          className={`hover:text-[#16a34a] transition-all duration-300 relative group ${pathname === item?.href ? "text-[#16a34a]" : ""}`}
        >
          {item?.title}
          <span
            className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-[#16a34a] transition-all duration-300 group-hover:w-1/2 group-hover:left-0 ${
              pathname === item?.href ? "w-1/2" : ""
            }`}
          />
          <span
            className={`absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-[#16a34a] transition-all duration-300 group-hover:w-1/2 group-hover:right-0 ${
              pathname === item?.href ? "w-1/2" : ""
            }`}
          />
        </Link>
      ))}
    </div>
  );
};

export default HeaderMenu;
