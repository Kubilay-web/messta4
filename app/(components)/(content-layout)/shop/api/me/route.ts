// app/(components)/(content-layout)/shop/api/me/route.ts
// Shop - istemcinin oturum/rol bilgisini öğrenmesi için. Admin linkini
// göstermek ve "ilk admin ol" akışını yönetmek için kullanılır.
import { NextResponse } from "next/server";
import { validateRequest } from "@/app/auth";
import { isShopAdminRole } from "../../lib/auth";
import db from "@/app/lib/db";

export async function GET() {
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ user: null });

  // Sistemde hiç admin yoksa ilk kullanıcı kendini admin yapabilsin
  const adminCount = await db.user.count({
    where: { shopNewRole: { in: ["ADMIN", "SELLER"] } },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      shopNewRole: user.shopNewRole,
      isAdmin: isShopAdminRole(user.shopNewRole),
    },
    canClaimAdmin: adminCount === 0,
  });
}
