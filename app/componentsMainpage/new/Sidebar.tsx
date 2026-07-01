import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Logo from "./Logo";
import Link from "next/link";
import SocialMedia from "./SocialMedia";

// @/constants kaldırıldı; navigasyon verisi inline.
const headerData = [
  { title: "Home", href: "/" },
  { title: "Shop", href: "/shop" },
  { title: "Blog", href: "/blog" },
  { title: "Contact", href: "/contact" },
];

// @/hooks kaldırıldı; dış tıklamayı algılayan hook yerel olarak tanımlandı.
function useOutsideClick<T extends HTMLElement>(callback: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [callback]);
  return ref;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const sidebarRef = useOutsideClick<HTMLDivElement>(onClose);

  return (
    <div
      className={`fixed inset-y-0 h-screen left-0 z-50 w-full bg-primary/50 shadow-xl transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform ease-in-out duration-300`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        ref={sidebarRef}
        className="min-w-72 max-w-96 bg-black z-50 h-screen text-primary-foreground p-10 border-r border-r-shop_dark_green flex flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <Logo className="text-white" />
          <button
            onClick={onClose}
            className="hover:text-shop_dark_green hoverEffect"
          >
            <X />
          </button>
        </div>
        <div className="flex flex-col gap-3.5 text-base font-semibold tracking-wide text-zinc-400 bg-black">
          {headerData?.map((item) => (
            <Link
              onClick={onClose}
              key={item?.title}
              href={item?.href}
              className={`hover:text-shop_light_green hoverEffect ${
                pathname === item?.href && "text-shop_light_green"
              }`}
            >
              {item?.title}
            </Link>
          ))}
        </div>
        <SocialMedia />
      </motion.div>
    </div>
  );
};

export default Sidebar;
