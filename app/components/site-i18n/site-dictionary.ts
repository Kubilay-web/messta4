// app/components/site-i18n/site-dictionary.ts
// Genel site (ana sayfa, giriş, üye ol) için TR/EN/DE çeviri sözlüğü.
// Mağaza modülünden bağımsızdır (yalnızca dil; para birimi yok).

export type SiteLang = "tr" | "en" | "de";

export const SITE_LANGS: { code: SiteLang; label: string; flag: string }[] = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

export type SiteDictKey = keyof typeof tr;

const tr = {
  // Genel
  login: "Giriş",
  store: "Mağaza",
  backHome: "← Anasayfaya dön",
  rights: "Tüm hakları saklıdır.",
  unexpectedError: "Beklenmeyen bir hata oluştu.",

  // Ana sayfa
  tagline: "Tek Ürünlük Mağaza",
  heroTitleFallbackA: "Tek ürün, tam",
  heroTitleFallbackB: "odak",
  heroTitleSuffix: "şimdi senin",
  heroDescFallback:
    "Özenle seçilmiş tek ürünümüzü keşfedin. Hızlı kargo, güvenli ödeme ve koşulsuz iade ile.",
  discount: "indirim",
  buyNow: "🛒 Hemen Satın Al",
  contactUs: "Bize Ulaşın",
  feat1Title: "Ücretsiz Kargo",
  feat1Text: "Aynı gün hızlı gönderim.",
  feat2Title: "Güvenli Ödeme",
  feat2Text: "256-bit SSL altyapı.",
  feat3Title: "14 Gün İade",
  feat3Text: "Koşulsuz iade hakkı.",
  feat4Title: "2 Yıl Garanti",
  feat4Text: "Resmi distribütör garantisi.",
  whyTitle: "Neden",
  examineProduct: "Ürünü İncele →",
  ctaTitle: "Gündemin tek ürünü seni bekliyor",
  ctaDesc: "Stoklarla sınırlı. Hemen sipariş ver, kapına gelsin.",
  goToStore: "🛒 Mağazaya Git",

  // Giriş
  loginBrandTitle1: "Tekrar hoş geldin,",
  loginBrandTitle2: "alışverişe devam et.",
  loginBrandDesc:
    "Hesabına giriş yap; siparişlerini takip et, hızlı ödeme yap ve kampanyalardan ilk sen haberdar ol.",
  brandPerk1: "Hızlı ve güvenli ödeme",
  brandPerk2: "Sipariş takibi",
  brandPerk3: "Özel kampanyalar",
  loginTitle: "Giriş Yap",
  loginSubtitle: "Hesabına erişmek için bilgilerini gir.",
  username: "Kullanıcı Adı",
  password: "Şifre",
  forgotPassword: "Şifremi unuttum",
  show: "Göster",
  hide: "Gizle",
  loggingIn: "Giriş yapılıyor...",
  noAccount: "Hesabın yok mu?",
  signUp: "Üye Ol",
  loginRequired: "Kullanıcı adı ve şifre zorunludur.",

  // Üye ol
  regBrandTitle1: "Aramıza katıl,",
  regBrandTitle2: "alışverişe başla.",
  regBrandDesc:
    "Ücretsiz üye ol; tek tıkla sipariş ver, siparişlerini takip et ve kampanyalardan yararlan.",
  regPerk2: "Sipariş geçmişi & takip",
  regPerk3: "Üyelere özel indirimler",
  registerTitle: "Üye Ol",
  registerSubtitle: "Birkaç saniyede ücretsiz hesabını oluştur.",
  email: "E-posta",
  passwordHint: "En az 8 karakter",
  creatingAccount: "Hesap oluşturuluyor...",
  terms: "Üye olarak kullanım koşullarını kabul etmiş sayılırsın.",
  haveAccount: "Zaten hesabın var mı?",
  regAllRequired: "Tüm alanlar zorunludur.",
  regUsernameRule:
    "Kullanıcı adı yalnızca harf, rakam, - ve _ içerebilir.",
  regInvalidEmail: "Geçerli bir e-posta girin.",
  regPasswordMin: "Şifre en az 8 karakter olmalı.",
};

const en: Record<SiteDictKey, string> = {
  login: "Sign In",
  store: "Store",
  backHome: "← Back to home",
  rights: "All rights reserved.",
  unexpectedError: "An unexpected error occurred.",

  tagline: "Single-Product Store",
  heroTitleFallbackA: "One product, full",
  heroTitleFallbackB: "focus",
  heroTitleSuffix: "is now yours",
  heroDescFallback:
    "Discover our carefully selected single product. With fast shipping, secure payment and free returns.",
  discount: "off",
  buyNow: "🛒 Buy Now",
  contactUs: "Contact Us",
  feat1Title: "Free Shipping",
  feat1Text: "Same-day fast delivery.",
  feat2Title: "Secure Payment",
  feat2Text: "256-bit SSL infrastructure.",
  feat3Title: "14-Day Returns",
  feat3Text: "No-questions-asked returns.",
  feat4Title: "2-Year Warranty",
  feat4Text: "Official distributor warranty.",
  whyTitle: "Why",
  examineProduct: "View Product →",
  ctaTitle: "The product everyone's talking about awaits you",
  ctaDesc: "Limited stock. Order now and we'll bring it to your door.",
  goToStore: "🛒 Go to Store",

  loginBrandTitle1: "Welcome back,",
  loginBrandTitle2: "continue shopping.",
  loginBrandDesc:
    "Sign in to your account; track your orders, check out quickly and be the first to hear about campaigns.",
  brandPerk1: "Fast and secure payment",
  brandPerk2: "Order tracking",
  brandPerk3: "Exclusive campaigns",
  loginTitle: "Sign In",
  loginSubtitle: "Enter your details to access your account.",
  username: "Username",
  password: "Password",
  forgotPassword: "Forgot password",
  show: "Show",
  hide: "Hide",
  loggingIn: "Signing in...",
  noAccount: "Don't have an account?",
  signUp: "Sign Up",
  loginRequired: "Username and password are required.",

  regBrandTitle1: "Join us,",
  regBrandTitle2: "start shopping.",
  regBrandDesc:
    "Sign up for free; order in one click, track your orders and enjoy campaigns.",
  regPerk2: "Order history & tracking",
  regPerk3: "Member-only discounts",
  registerTitle: "Sign Up",
  registerSubtitle: "Create your free account in seconds.",
  email: "Email",
  passwordHint: "At least 8 characters",
  creatingAccount: "Creating account...",
  terms: "By signing up, you agree to the terms of use.",
  haveAccount: "Already have an account?",
  regAllRequired: "All fields are required.",
  regUsernameRule:
    "Username may only contain letters, numbers, - and _.",
  regInvalidEmail: "Enter a valid email.",
  regPasswordMin: "Password must be at least 8 characters.",
};

const de: Record<SiteDictKey, string> = {
  login: "Anmelden",
  store: "Shop",
  backHome: "← Zurück zur Startseite",
  rights: "Alle Rechte vorbehalten.",
  unexpectedError: "Ein unerwarteter Fehler ist aufgetreten.",

  tagline: "Ein-Produkt-Shop",
  heroTitleFallbackA: "Ein Produkt, volle",
  heroTitleFallbackB: "Konzentration",
  heroTitleSuffix: "jetzt deins",
  heroDescFallback:
    "Entdecken Sie unser sorgfältig ausgewähltes Einzelprodukt. Mit schnellem Versand, sicherer Zahlung und kostenloser Rückgabe.",
  discount: "Rabatt",
  buyNow: "🛒 Jetzt kaufen",
  contactUs: "Kontakt",
  feat1Title: "Kostenloser Versand",
  feat1Text: "Schneller Versand am selben Tag.",
  feat2Title: "Sichere Zahlung",
  feat2Text: "256-Bit-SSL-Infrastruktur.",
  feat3Title: "14 Tage Rückgabe",
  feat3Text: "Bedingungslose Rückgabe.",
  feat4Title: "2 Jahre Garantie",
  feat4Text: "Offizielle Händlergarantie.",
  whyTitle: "Warum",
  examineProduct: "Produkt ansehen →",
  ctaTitle: "Das Produkt der Stunde wartet auf Sie",
  ctaDesc: "Begrenzter Bestand. Jetzt bestellen, wir liefern bis vor die Tür.",
  goToStore: "🛒 Zum Shop",

  loginBrandTitle1: "Willkommen zurück,",
  loginBrandTitle2: "weiter einkaufen.",
  loginBrandDesc:
    "Melden Sie sich an; verfolgen Sie Bestellungen, zahlen Sie schnell und erfahren Sie als Erster von Aktionen.",
  brandPerk1: "Schnelle und sichere Zahlung",
  brandPerk2: "Bestellverfolgung",
  brandPerk3: "Exklusive Aktionen",
  loginTitle: "Anmelden",
  loginSubtitle: "Geben Sie Ihre Daten ein, um auf Ihr Konto zuzugreifen.",
  username: "Benutzername",
  password: "Passwort",
  forgotPassword: "Passwort vergessen",
  show: "Anzeigen",
  hide: "Verbergen",
  loggingIn: "Anmeldung läuft...",
  noAccount: "Noch kein Konto?",
  signUp: "Registrieren",
  loginRequired: "Benutzername und Passwort sind erforderlich.",

  regBrandTitle1: "Werden Sie Teil,",
  regBrandTitle2: "starten Sie den Einkauf.",
  regBrandDesc:
    "Kostenlos registrieren; mit einem Klick bestellen, Bestellungen verfolgen und Aktionen nutzen.",
  regPerk2: "Bestellverlauf & Verfolgung",
  regPerk3: "Rabatte nur für Mitglieder",
  registerTitle: "Registrieren",
  registerSubtitle: "Erstellen Sie in Sekunden Ihr kostenloses Konto.",
  email: "E-Mail",
  passwordHint: "Mindestens 8 Zeichen",
  creatingAccount: "Konto wird erstellt...",
  terms: "Mit der Registrierung akzeptieren Sie die Nutzungsbedingungen.",
  haveAccount: "Haben Sie bereits ein Konto?",
  regAllRequired: "Alle Felder sind erforderlich.",
  regUsernameRule:
    "Der Benutzername darf nur Buchstaben, Zahlen, - und _ enthalten.",
  regInvalidEmail: "Geben Sie eine gültige E-Mail ein.",
  regPasswordMin: "Das Passwort muss mindestens 8 Zeichen lang sein.",
};

export const SITE_DICT: Record<SiteLang, Record<SiteDictKey, string>> = {
  tr,
  en,
  de,
};
