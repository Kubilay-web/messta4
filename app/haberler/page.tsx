"use server";

import Header from "@/app/projects/components/newsportal/Header";
import Footer from "@/app/projects/components/newsportal/Footer";

export default async function HaberlerPage() {
  return (
    <>
      <div>
        <Header />
        {/* <News /> */}
        <Footer />
      </div>
    </>
  );
}
