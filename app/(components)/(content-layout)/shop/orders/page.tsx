"use client";

import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { useShopSettings } from "../lib/shop-settings";
import { DictKey } from "../lib/dictionary";

interface MyOrder {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  status: string;
  paymentMethod: string;
  trackingNumber?: string | null;
  cargoCompany?: string | null;
  createdAt: string;
  product?: { name: string; slug: string; images: string[] } | null;
}

// Takip adımları (sırasıyla). CANCELLED ayrı gösterilir.
const STEPS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
const STEP_ICON: Record<string, string> = {
  PENDING: "ri-shopping-bag-3-line",
  PROCESSING: "ri-archive-line",
  SHIPPED: "ri-truck-line",
  DELIVERED: "ri-checkbox-circle-line",
};

const MyOrders = () => {
  const { t, money, lang } = useShopSettings();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("order_success")) {
      toast.success(t("orderPlacedCod"));
      window.history.replaceState({}, "", "/shop/orders");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/shop/api/me/orders", { cache: "no-store" });
        const data = await res.json();
        setOrders(data.orders || []);
      } catch {
        toast.error("Siparişler getirilemedi");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusLabel = (s: string) => t(`status_${s}` as DictKey);
  const localeDate = (d: string) =>
    new Date(d).toLocaleDateString(
      lang === "tr" ? "tr-TR" : lang === "de" ? "de-DE" : "en-US",
      { day: "2-digit", month: "long", year: "numeric" }
    );

  return (
    <Fragment>
      <Toaster richColors position="top-right" />
      <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold mb-0">
            {t("myOrdersTitle")}
          </h1>
          <nav className="flex items-center gap-2 text-sm text-muted">
            <Link href="/shop" className="hover:text-primary">
              {t("store")}
            </Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-primary">{t("myOrders")}</span>
          </nav>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <span className="ti-spinner text-primary" role="status"></span>
            <span className="ms-3 text-muted">{t("ordersLoading")}</span>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="box">
            <div className="box-body flex flex-col items-center justify-center text-center gap-4 py-16">
              <i className="ri-shopping-bag-3-line text-[3rem] text-muted"></i>
              <div>
                <h5 className="font-semibold mb-1">{t("noOrdersTitle")}</h5>
                <p className="text-muted mb-0">{t("noOrdersDesc")}</p>
              </div>
              <Link href="/shop" className="ti-btn ti-btn-primary">
                {t("backToStore")}
              </Link>
            </div>
          </div>
        )}

        {!loading &&
          orders.map((o) => {
            const cancelled = o.status === "CANCELLED";
            const currentIdx = STEPS.indexOf(o.status);
            return (
              <div key={o.id} className="box !mb-0">
                <div className="box-body flex flex-col gap-4">
                  {/* Üst satır */}
                  <div className="flex flex-wrap items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        o.product?.images?.[0] ||
                        "https://via.placeholder.com/80?text=-"
                      }
                      alt={o.product?.name || "-"}
                      className="w-16 h-16 rounded-md object-cover shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      {o.product?.slug ? (
                        <Link
                          href={`/shop/${o.product.slug}`}
                          className="font-semibold truncate hover:text-primary"
                        >
                          {o.product?.name || "-"}
                        </Link>
                      ) : (
                        <span className="font-semibold truncate">
                          {o.product?.name || "-"}
                        </span>
                      )}
                      <span className="text-muted text-xs">
                        {t("orderNo")}: #{o.id.slice(-8).toUpperCase()} ·{" "}
                        {t("orderDate")}: {localeDate(o.createdAt)}
                      </span>
                      <span className="text-muted text-xs">
                        {t("qtyShort")}: {o.quantity} ·{" "}
                        <span className="font-medium text-default">
                          {money(o.totalPrice, o.currency)}
                        </span>
                      </span>
                    </div>
                    <span
                      className={`badge ms-auto ${
                        cancelled
                          ? "bg-danger/10 text-danger"
                          : o.status === "DELIVERED"
                          ? "bg-success/10 text-success"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {statusLabel(o.status)}
                    </span>
                  </div>

                  {/* Durum adımları */}
                  {cancelled ? (
                    <div className="bg-danger/10 text-danger rounded-md p-3 text-sm flex items-center gap-2">
                      <i className="ri-close-circle-line text-lg"></i>
                      {statusLabel("CANCELLED")}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {STEPS.map((s, i) => {
                        const done = i <= currentIdx;
                        return (
                          <React.Fragment key={s}>
                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <span
                                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                                  done
                                    ? "bg-primary border-primary text-white"
                                    : "border-defaultborder text-muted"
                                }`}
                              >
                                <i className={STEP_ICON[s]}></i>
                              </span>
                              <span
                                className={`text-[0.7rem] text-center max-w-[5rem] ${
                                  done ? "text-primary font-medium" : "text-muted"
                                }`}
                              >
                                {statusLabel(s)}
                              </span>
                            </div>
                            {i < STEPS.length - 1 && (
                              <div
                                className={`flex-1 h-0.5 mx-1 mb-5 ${
                                  i < currentIdx ? "bg-primary" : "bg-defaultborder"
                                }`}
                              ></div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}

                  {/* Kargo takip bilgisi */}
                  <div className="border-t border-defaultborder dark:border-defaultborder/10 pt-3">
                    <p className="text-sm font-medium mb-1 flex items-center gap-1">
                      <i className="ri-truck-line text-primary"></i>
                      {t("trackingInfo")}
                    </p>
                    {o.trackingNumber || o.cargoCompany ? (
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
                        {o.cargoCompany && (
                          <span>
                            {t("cargoCompany")}:{" "}
                            <span className="text-default font-medium">
                              {o.cargoCompany}
                            </span>
                          </span>
                        )}
                        {o.trackingNumber && (
                          <span>
                            {t("trackingNumber")}:{" "}
                            <span className="text-default font-medium">
                              {o.trackingNumber}
                            </span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted mb-0">{t("noTrackingYet")}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </Fragment>
  );
};

export default MyOrders;
