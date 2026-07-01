import ProductCard from "./ProductCard";
import Container from "./Container";
import NoProductAvailable from "./new/NoProductAvailable";
import type { ShopHomeProduct } from "@/app/queries/shop";

/**
 * Öne çıkan ürün ızgarası — Sanity client fetch ve variant sekmeleri
 * kaldırıldı. Ürünler sunucudan (getHomeShopProducts) prop olarak gelir.
 */
const ProductGrid = ({ products }: { products: ShopHomeProduct[] }) => {
  return (
    <Container className="flex flex-col lg:px-0">
      {products?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <NoProductAvailable />
      )}
    </Container>
  );
};

export default ProductGrid;
