import prisma from "@/app/lib/prisma";
import { validateRequest } from "@/app/auth";
import { getServerLocale } from "@/app/lib/locale";
import { SiteLangProvider } from "@/app/components/site-i18n/SiteLang";
import HomeClient from "@/app/components/site-i18n/HomeClient";

export const dynamic = "force-dynamic";

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
  const initialLang = await getServerLocale();

  // İstemciye yalnızca serileştirilebilir alanları geçir
  const clientProduct = product
    ? {
        name: product.name,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice ?? null,
        currency: product.currency,
        images: product.images ?? [],
        features: product.features ?? [],
      }
    : null;

  return (
    <SiteLangProvider initialLang={initialLang}>
      <HomeClient
        product={clientProduct}
        discountPct={discountPct}
        shopHref={shopHref}
        hasUser={!!user}
      />
    </SiteLangProvider>
  );
}
