import { getHomeShopProducts } from "@/app/queries/shop";
import Header from "@/app/componentsMainpage/Header";
import Hero from "@/app/componentsMainpage/Hero";
import ProductGrid from "@/app/componentsMainpage/ProductGrid";
import Footer from "@/app/componentsMainpage/Footer";
// import HomeBanner from "@/app/componentsMainpage/new/HomeBanner";

// Sayfa 60 saniyede bir yeniden üretilir: kullanıcılar önbellekten çok hızlı
// yanıt alır, stok/fiyat en fazla 60 sn gecikmeyle güncellenir.
export const revalidate = 60;

// Server Component: Prisma'ya doğrudan sunucuda tek sorgu atılır.
// Client fetch / waterfall yok → DB ile en hızlı iletişim.
export default async function Home() {
  const products = await getHomeShopProducts(8);

  return (
    <div>
      <Header />
      {/* <HomeBanner /> */}
      <Hero />
      <div className="py-10">
        <ProductGrid products={products} />
      </div>
      <Footer />
    </div>
  );
}
