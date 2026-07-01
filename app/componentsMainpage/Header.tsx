import Link from "next/link";
import React from "react";
import Container from "./Container";
import HeaderMenu from "./new/HeaderMenu";
import Logo from "./new/Logo";
import { Logs, User as UserIcon } from "lucide-react";
import CartIcon from "./new/CartIcon";
import MobileMenu from "./new/MobileMenu";
import SearchBar from "./new/SearchBar";
import FavoriteButton from "./FavoriteButton";
import { validateRequest } from "@/app/auth";

// Clerk / Sanity yok — projenin mevcut Lucia auth sistemi (validateRequest)
// kullanılır. Sunucu bileşeni.
const Header = async () => {
  const { user } = await validateRequest();

  return (
    <header className="bg-white sticky top-0 z-50 py-5 border-b">
      <Container className="flex items-center justify-between gap-4 text-[#374151]">
        <div className="w-auto md:w-1/3 flex items-center justify-start gap-2.5 md:gap-0">
          <MobileMenu />
          <Logo />
        </div>
        <HeaderMenu />
        <div className="w-auto md:w-1/3 flex items-center justify-end gap-5">
          <SearchBar />
          <CartIcon />
          <FavoriteButton />
          {user && (
            <Link
              href={"/shop/orders"}
              className="group relative hover:text-[#16a34a] transition-all duration-300 hidden min-[425px]:flex"
            >
              <Logs className="group-hover:text-[#16a34a] transition-all duration-300 mt-0.5" />
            </Link>
          )}
          {user ? (
            <Link
              href={"/shop/orders"}
              className="flex items-center gap-2 text-sm font-semibold hover:text-[#151515] transition-all duration-300"
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.displayName ?? "user"}
                  className="h-8 w-8 rounded-full object-cover border"
                />
              ) : (
                <span className="h-8 w-8 rounded-full border flex items-center justify-center bg-[#f3f4f6]">
                  <UserIcon className="h-4 w-4" />
                </span>
              )}
              <span className="hidden sm:inline">
                {user.displayName || user.username}
              </span>
            </Link>
          ) : (
            <Link
              href={"/login"}
              className="text-sm font-semibold hover:text-[#151515] transition-all duration-300"
            >
              Login
            </Link>
          )}
        </div>
      </Container>
    </header>
  );
};

export default Header;
