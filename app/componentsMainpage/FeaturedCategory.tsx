import React from "react";
import Container from "./Container";
import Link from "next/link";

// TODO: Prisma karşılığı yok, placeholder
type Category = {
  _id?: string;
  title?: string;
  slug?: { current?: string };
  image?: string;
  range?: string | number;
};

// TODO: Prisma karşılığı yok, placeholder
const getFeaturedCategory = async (_n?: number) => [] as Category[];

const FeaturedCategory = async () => {
  const featuredCategories = await getFeaturedCategory(4);

  return (
    <Container className="py-10 lg:py-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredCategories?.map((category: Category) => (
          <div
            key={category?._id}
            className="bg-[#F5F5F5] px-5 py-3 flex items-center justify-between gap-4 rounded-md relative group overflow-hidden"
          >
            <div>
              {category?.image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={category?.image}
                  alt="categoryImage"
                  width={100}
                  height={100}
                  className="w-24 h-24 object-cover group-hover:scale-110 hoverEffect"
                />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold uppercase">
                {category?.title}
              </h3>
              <Link
                href={`/category/${category?.slug?.current}`}
                className="absolute inset-0"
              />
              <p className="text-xs font-bold mt-2">
                Starting at{" "}
                <span className="text-shop_dark_green">${category?.range}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default FeaturedCategory;
