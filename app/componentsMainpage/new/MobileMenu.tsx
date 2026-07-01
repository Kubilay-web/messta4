"use client";

import { AlignLeft, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SocialMedia from "./SocialMedia";

// Sanity bağımlı Sidebar kaldırıldı — orijinal sitedeki koyu, tam boy drawer.
const navLinks = [
  { title: "Home", href: "/" },
  { title: "Shop", href: "/shop" },
  { title: "Orders", href: "/shop/orders" },
  { title: "Contact", href: "/shop/contact" },
  { title: "Wishlist", href: "/wishlist" },
];

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden"
        aria-label="Menü"
      >
        <AlignLeft className="w-6 h-6 hover:text-[#16a34a] transition-all duration-300" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Arkaplan karartma */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          {/* Koyu drawer */}
          <div className="absolute left-0 top-0 h-screen w-72 max-w-[80%] bg-[#0d0d0d] text-white p-7 shadow-xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-10">
              <span className="text-2xl font-black tracking-wider uppercase">
                BETPRIN<span className="text-[#16a34a]">T</span>
              </span>
              <button onClick={() => setOpen(false)} aria-label="Kapat">
                <X className="w-6 h-6 hover:text-[#16a34a] transition-all duration-300" />
              </button>
            </div>

            <nav className="flex flex-col gap-5">
              {navLinks.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`text-lg font-semibold transition-all duration-300 hover:text-[#16a34a] ${
                      active ? "text-[#16a34a]" : "text-gray-300"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            <SocialMedia
              className="mt-8"
              iconClassName="border-white/30 text-white hover:border-[#16a34a] hover:text-[#16a34a]"
              tooltipClassName="bg-white text-[#151515]"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
