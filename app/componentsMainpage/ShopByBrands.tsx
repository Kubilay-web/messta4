import React from "react";
import Container from "./Container";
import Title from "./Title";
import Link from "next/link";
import { GitCompareArrows, Headset, ShieldCheck, Truck } from "lucide-react";

// TODO: Prisma karşılığı yok, placeholder
type Brand = {
  _id?: string;
  title?: string;
  slug?: { current?: string };
  image?: string;
};

// TODO: Prisma karşılığı yok, placeholder
const getAllBrands = async () => [] as Brand[];

const extraData = [
  {
    title: "Free Delivery",
    description: "Free shipping over €200",
    icon: <Truck size={45} />,
  },
  {
    title: "Free Return",
    description: "Free shipping over €200",
    icon: <GitCompareArrows size={45} />,
  },
  {
    title: "Customer Support",
    description: "Friendly 27/7 customer support",
    icon: <Headset size={45} />,
  },
  {
    title: "Money Back guarantee",
    description: "Quality checked by our team",
    icon: <ShieldCheck size={45} />,
  },
];

const ShopByBrands = async () => {
  const brands = await getAllBrands();

  return (
    <Container className="mt-10 lg:mt-20 bg-lightBg p-5 lg:p-7 rounded-md">
      <div className="flex items-center gap-5 justify-between mb-10">
        <Title className="text-2xl">Shop By Brands</Title>
        <Link
          href={"/shop"}
          className="text-sm font-semibold tracking-wide hover:text-shop_btn_dark_green hoverEffect"
        >
          View all
        </Link>
      </div>
      <div className="flex items-center gap-2.5 justify-between">
        {brands?.map((brand) => (
          <Link
            key={brand?._id}
            href={{
              pathname: "/shop",
              query: { brand: brand?.slug?.current },
            }}
            className="bg-white w-36 h-24 flex items-center justify-center rounded-md overflow-hidden hover:shadow-lg shadow-shop_dark_green/20 hoverEffect"
          >
            {brand?.image && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={brand?.image}
                alt="brandImage"
                width={250}
                height={250}
                className="w-32 h-20 object-contain"
              />
            )}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 p-2  shadow-xs shadow-shop_light_green/20 py-5">
        {extraData?.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 group text-lightColor hover:text-shop_light_green"
          >
            <span className="inline-flex scale-100 group-hover:scale-90 hoverEffect">
              {item?.icon}
            </span>
            <div className="text-sm">
              <p className="text-darkColor/80 font-bold capitalize">
                {item?.title}
              </p>
              <p className="text-lightColor">{item?.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default ShopByBrands;
