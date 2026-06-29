// app/(components)/(content-layout)/shop/lib/auth.ts
// Shop - admin/satıcı yetki yardımcıları. Shop'a özel shopNewRole alanına bakar
// (ADMIN | SELLER). Diğer modüllerin rolünden (roleshop) bağımsızdır.
import { validateRequest } from "@/app/auth";

// Shop yönetici/satıcı rolleri
export const SHOP_ADMIN_ROLES = ["ADMIN", "SELLER"] as const;

export const isShopAdminRole = (shopNewRole?: string | null) =>
  shopNewRole === "ADMIN" || shopNewRole === "SELLER";

// Girişli ve yetkili (admin/satıcı) kullanıcıyı döner; değilse hata mesajı.
export async function requireShopAdmin() {
  const { user } = await validateRequest();
  if (!user) return { user: null, error: "Giriş gerekli", status: 401 as const };
  if (!isShopAdminRole(user.shopNewRole))
    return { user, error: "Bu işlem için yönetici yetkisi gerekli", status: 403 as const };
  return { user, error: null, status: 200 as const };
}
