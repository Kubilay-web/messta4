

import "./globals.scss";
import ClientProviders from "./ClientProviders";
import { validateRequest } from "./auth";
import SessionProvider from "./SessionProvider";
import { headers } from "next/headers";

export async function generateMetadata() {
  const headersList = await headers();
  const host = headersList.get("x-hostname");

  if (host?.includes("cleververwaltet.de")) {
    return {
      title: "Cleververwaltet Deutschland",
      description: "Immobilienverwaltung in Deutschland",
    };
  }

  if (host?.includes("cleververwaltet.at")) {
    return {
      title: "Cleververwaltet Österreich",
      description: "Immobilienverwaltung in Österreich",
    };
  }

  return {
    title: "My App",
    description: "Property Management Platform",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();
  const headersList = await headers();
  const host = headersList.get("x-hostname");

  const lang =
    host?.includes("de") ? "de" :
    host?.includes("at") ? "de-AT" :
    "en";

  return (
    <html lang={lang} suppressHydrationWarning>
      <head />

      <body>
            <SessionProvider value={session}>
              <ClientProviders>{children}</ClientProviders>
            </SessionProvider>
      </body>
    </html>
  );
}
