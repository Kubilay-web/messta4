import { redirect } from "next/navigation";
import { validateRequest } from "@/app/auth";

export const dynamic = "force-dynamic";

// Mağazaya erişim giriş gerektirir. Girişli değilse login'e yönlendir.
export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();
  if (!user) redirect("/login?redirect=/shop");

  return <>{children}</>;
}
