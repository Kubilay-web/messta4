"use client";

import Link from "next/link";
import Logo from "./new/Logo";
import FooterTop from "./new/FooterTop";
import SocialMedia from "./new/SocialMedia";
import { useEffect, useState } from "react";

// Sanity/@constants yok — kategori ve hızlı bağlantı verisi burada tanımlı.
const quickLinksData = [
  { title: "Home", href: "/" },
  { title: "Shop", href: "/shop" },
  { title: "Orders", href: "/shop/orders" },
  { title: "Contact", href: "/shop/contact" },
];

const categoriesData = [
  { title: "Thermorollen", href: "shop" },
  { title: "Bonrollen", href: "shop" },
  { title: "Wettscheine", href: "shop" },
  { title: "Zubehör", href: "shop" },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSuccess(true);
    setEmail("");
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Üst iletişim bölümü */}
        <FooterTop />

        {/* Ana footer içeriği */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo />
            <SocialMedia
              className="text-[#151515]/60 mt-5"
              iconClassName="border-[#151515]/60 hover:border-[#15803d] hover:text-[#15803d]"
              tooltipClassName="bg-[#151515] text-white"
            />
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinksData?.map((item) => (
                <li key={item?.title}>
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-[#15803d] text-sm font-medium transition-all duration-300"
                  >
                    {item?.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Categories
            </h3>
            <ul className="space-y-3">
              {categoriesData.map((item) => (
                <li key={item?.title}>
                  <Link
                    href={`/${item?.href}`}
                    className="text-gray-600 hover:text-[#15803d] text-sm font-medium transition-all duration-300 capitalize"
                  >
                    {item?.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Newsletter
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Abonnieren Sie unseren Newsletter für Updates und exklusive
              Angebote.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="E-Mail eingeben"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#15803d]/30 outline-none"
              />
              <button
                type="submit"
                className="w-full bg-[#166534] text-white px-4 py-2 rounded-lg hover:bg-[#15803d] transition-colors"
              >
                Abonnieren
              </button>
            </form>
            {success && (
              <p className="text-[#15803d] text-sm mt-2">
                Danke für Ihr Abonnement!
              </p>
            )}
          </div>
        </div>

        {/* Alt telif bölümü */}
        <div className="py-6 border-t text-center text-sm text-gray-600">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-[#151515] font-black tracking-wider uppercase">
              Betprin<span className="text-[#15803d]">t</span>
            </span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
