import { redirect as nav } from "next/navigation";
import { validateRequest } from "@/app/auth";
import { getServerLocale } from "@/app/lib/locale";
import { SiteLangProvider } from "@/app/components/site-i18n/SiteLang";
import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const target = redirect && redirect.startsWith("/") ? redirect : "/shop";

  const { user } = await validateRequest();
  if (user) nav(target);

  const initialLang = await getServerLocale();

  return (
    <SiteLangProvider initialLang={initialLang}>
      <LoginForm redirect={target} />
    </SiteLangProvider>
  );
}
