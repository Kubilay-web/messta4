"use server";

// Shop - oturumu kapatır ve /shop'a yönlendirir.
// (Mevcut genel logout "/"'a yönlendirdiği için mağazaya özel bir sürüm.)
import { lucia, validateRequest } from "@/app/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function shopLogout() {
  const { session } = await validateRequest();

  if (session) {
    await lucia.invalidateSession(session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  }

  redirect("/shop");
}
