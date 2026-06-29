import Link from "next/link";
import prisma from "@/app/lib/prisma";
import { validateRequest } from "@/app/auth";

export const dynamic = "force-dynamic";

// Shop — tek ürünlük mağaza vitrin/ana sayfası
const SITE = {
  name: "Shop",
  tagline: "Tek Ürünlük Mağaza",
  phone: "0500 000 00 00",
  phoneHref: "tel:05000000000",
  email: "info@shop.com",
  address: "İstanbul, Türkiye",
};

function fmt(n: number, currency = "TRY") {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);
}

export default async function Home() {
  const { user } = await validateRequest();

  const product = await prisma.shopProduct.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  const discountPct =
    product?.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  // Mağazaya gitmek için giriş gerekir; girişli değilse login'e yönlendir
  const shopHref = user ? "/shop" : "/login?redirect=/shop";

  return (
    <div
      className="flex min-h-screen flex-col bg-gray-50 text-gray-900"
      style={{ colorScheme: "light" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-3">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-extrabold text-white">
              S
            </span>
            <span className="text-base font-extrabold leading-none text-gray-900">
              {SITE.name}
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href={shopHref}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Mağaza
            </Link>
            <a
              href={SITE.phoneHref}
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 md:block"
            >
              📞 {SITE.phone}
            </a>
            {user ? (
              <Link
                href="/shop"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Panel
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Giriş
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-4 py-12 lg:flex-row lg:py-20">
          {/* Sol: metin */}
          <div className="flex w-full flex-col items-start gap-5 lg:w-1/2">
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {SITE.tagline}
            </span>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              {product ? product.name : "Tek ürün, tam"}{" "}
              <span className="text-indigo-600">
                {product ? "şimdi senin" : "odak"}
              </span>
            </h1>
            <p className="max-w-xl text-base text-gray-500 sm:text-lg">
              {product?.description ??
                "Özenle seçilmiş tek ürünümüzü keşfedin. Hızlı kargo, güvenli ödeme ve koşulsuz iade ile."}
            </p>

            {product && (
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-3xl font-extrabold text-indigo-600">
                  {fmt(product.price, product.currency)}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-lg text-gray-400 line-through">
                    {fmt(product.oldPrice, product.currency)}
                  </span>
                )}
                {discountPct > 0 && (
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-sm font-semibold text-rose-600">
                    %{discountPct} indirim
                  </span>
                )}
              </div>
            )}

            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                href={shopHref}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                🛒 Hemen Satın Al
              </Link>
              <a
                href={SITE.phoneHref}
                className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                Bize Ulaşın
              </a>
            </div>
          </div>

          {/* Sağ: görsel */}
          <div className="flex w-full items-center justify-center lg:w-1/2">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gray-100 shadow-xl">
              {discountPct > 0 && (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-rose-500 px-3 py-1 text-sm font-bold text-white">
                  %{discountPct}
                </span>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  product?.images?.[0] ||
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900"
                }
                alt={product?.name || "Ürün"}
                className="aspect-square w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Özellikler */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap">
          {[
            { icon: "🚚", title: "Ücretsiz Kargo", text: "Aynı gün hızlı gönderim." },
            { icon: "🔒", title: "Güvenli Ödeme", text: "256-bit SSL altyapı." },
            { icon: "↩️", title: "14 Gün İade", text: "Koşulsuz iade hakkı." },
            { icon: "🛡️", title: "2 Yıl Garanti", text: "Resmi distribütör garantisi." },
          ].map((f) => (
            <div
              key={f.title}
              className="flex flex-1 basis-full items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:basis-[calc(50%-0.625rem)] lg:basis-[calc(25%-0.94rem)]"
            >
              <span className="text-2xl">{f.icon}</span>
              <div>
                <h3 className="font-bold text-gray-800">{f.title}</h3>
                <p className="mt-0.5 text-sm text-gray-500">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ürün öne çıkanları */}
      {product && product.features.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 pb-12">
          <div className="flex flex-col gap-8 rounded-3xl bg-white p-6 sm:p-10 lg:flex-row lg:items-center">
            <div className="flex w-full justify-center lg:w-2/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  product.images?.[1] ||
                  product.images?.[0] ||
                  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900"
                }
                alt={product.name}
                className="aspect-square w-full max-w-sm rounded-2xl object-cover"
              />
            </div>
            <div className="flex w-full flex-col gap-4 lg:w-3/5">
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Neden {product.name}?
              </h2>
              <ul className="flex flex-col gap-3">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-600">
                      ✓
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={shopHref}
                className="mt-2 w-fit rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                Ürünü İncele →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-14">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-10 text-center text-white sm:py-14">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Gündemin tek ürünü seni bekliyor
          </h2>
          <p className="max-w-xl text-indigo-100">
            Stoklarla sınırlı. Hemen sipariş ver, kapına gelsin.
          </p>
          <Link
            href={shopHref}
            className="rounded-xl bg-white px-8 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
          >
            🛒 Mağazaya Git
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-extrabold text-white">
              S
            </span>
            <div>
              <div className="font-extrabold text-gray-900">{SITE.name}</div>
              <div className="text-xs text-gray-500">{SITE.tagline}</div>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-sm text-gray-500 sm:items-end">
            <a href={SITE.phoneHref} className="hover:text-indigo-600">
              {SITE.phone}
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="hover:text-indigo-600"
            >
              {SITE.email}
            </a>
            <span>{SITE.address}</span>
          </div>
        </div>
        <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
          © 2026 {SITE.name}. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}
