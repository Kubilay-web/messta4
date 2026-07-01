import React from "react";
import CategorySelector from "./ui/category-selector";

// TODO: Prisma karşılığı yok, placeholder
type Category = {
  _id?: string;
  title?: string;
  slug?: { current?: string };
  image?: string;
};

interface Props {
  categories: Category[];
}

const Categories = ({ categories }: Props) => {
  return (
    <div className="py-5">
      <CategorySelector categories={categories} />
    </div>
  );
};

export default Categories;
