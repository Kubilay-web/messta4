import { redirect } from "next/navigation";
import { validateRequest } from "@/app/auth";
import { isShopAdminRole } from "./lib/auth";
import { getServerLocale } from "@/app/lib/locale";
import ShopShell from "./components/ShopShell";

export const dynamic = "force-dynamic";

// Mağazaya erişim giriş gerektirir. Girişli değilse login'e yönlendir.
export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();
  if (!user) redirect("/login?redirect=/shop");

  const isAdmin = isShopAdminRole(user.shopNewRole);
  const initialLang = await getServerLocale();

  return (
    <ShopShell isAdmin={isAdmin} initialLang={initialLang}>
      {children}
    </ShopShell>
  );
}
