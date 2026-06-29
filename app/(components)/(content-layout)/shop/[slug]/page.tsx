"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";

type PaymentMethod = "stripe" | "paypal";

interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number | null;
  currency: string;
  images: string[];
  features: string[];
  stock: number;
  rating: number;
  numReviews: number;
}

interface OrderForm {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  note: string;
}

const emptyForm: OrderForm = {
  customerName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  note: "",
};

const ProductDetail = () => {
  const params = useParams();
  const slug = String(params?.slug || "");

  const [product, setProduct] = useState<ShopProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  const [form, setForm] = useState<OrderForm>(emptyForm);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fmt = (n: number, currency = "TRY") =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/shop/api/product?slug=${encodeURIComponent(slug)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ürün getirilemedi");
        setProduct(data.product);
      } catch (err: any) {
        setError(err.message);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  const total = useMemo(
    () => (product ? product.price * qty : 0),
    [product, qty]
  );

  const discountPct = useMemo(() => {
    if (!product?.oldPrice || product.oldPrice <= product.price) return 0;
    return Math.round(
      ((product.oldPrice - product.price) / product.oldPrice) * 100
    );
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/shop/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          productId: product.id,
          quantity: qty,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.paymentUrl)
        throw new Error(data.error || "Ödeme başlatılamadı");
      window.location.href = data.paymentUrl;
    } catch (err: any) {
      setFormError(err.message);
      toast.error(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Fragment>
      <Toaster richColors position="top-right" />

      <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-[1400px] mx-auto w-full">
        {/* Sayfa başlığı (Pageheader yerine) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold mb-0 truncate">
            {product?.name || "Ürün"}
          </h1>
          <nav className="flex items-center gap-2 text-sm text-muted">
            <span>E-Ticaret</span>
            <i className="ri-arrow-right-s-line"></i>
            <span>Mağaza</span>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-primary truncate max-w-[10rem]">
              {product?.name || "Ürün"}
            </span>
          </nav>
        </div>

        <div>
          <Link href="/shop" className="ti-btn ti-btn-light ti-btn-sm">
            <i className="ri-arrow-left-line me-1"></i> Mağazaya Dön
          </Link>
        </div>

        {loading && (
        <div className="flex items-center justify-center py-20">
          <span className="ti-spinner text-primary" role="status">
            <span className="sr-only">Yükleniyor...</span>
          </span>
          <span className="ms-3 text-muted">Ürün yükleniyor...</span>
        </div>
      )}

      {!loading && !product && (
        <div className="box">
          <div className="box-body flex flex-col items-center justify-center text-center gap-4 py-16">
            <i className="ri-error-warning-line text-[3rem] text-muted"></i>
            <p className="text-muted mb-0">{error || "Ürün bulunamadı"}</p>
            <Link href="/shop" className="ti-btn ti-btn-primary">
              Mağazaya Dön
            </Link>
          </div>
        </div>
      )}

      {!loading && product && (
        <div className="flex flex-col gap-y-6">
          <div className="box overflow-hidden">
            <div className="box-body !p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Galeri */}
                <div className="w-full lg:w-1/2 p-4 sm:p-6 flex flex-col gap-4">
                  <div className="relative flex items-center justify-center bg-gray-50 dark:bg-bodybg2 rounded-lg overflow-hidden aspect-square">
                    {discountPct > 0 && (
                      <span className="absolute top-3 start-3 z-10 badge bg-danger text-white text-sm px-2 py-1 rounded">
                        %{discountPct} İndirim
                      </span>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        product.images[activeImage] ||
                        "https://via.placeholder.com/600x600?text=Urun"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {product.images.length > 1 && (
                    <div className="flex flex-wrap gap-3">
                      {product.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            activeImage === i
                              ? "border-primary"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt={`${product.name} ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bilgi */}
                <div className="w-full lg:w-1/2 p-4 sm:p-6 flex flex-col gap-4 lg:border-s border-defaultborder dark:border-defaultborder/10">
                  <div>
                    <span className="badge bg-primary/10 text-primary mb-2 inline-block">
                      Mağaza
                    </span>
                    <h4 className="font-semibold text-[1.4rem] mb-2">
                      {product.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-warning">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <i
                            key={i}
                            className={
                              i < Math.round(product.rating)
                                ? "ri-star-fill"
                                : "ri-star-line"
                            }
                          ></i>
                        ))}
                      </span>
                      <span className="text-muted">
                        {product.rating.toFixed(1)} ({product.numReviews}{" "}
                        değerlendirme)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end gap-3">
                    <span className="text-[1.8rem] font-bold text-primary leading-none">
                      {fmt(product.price, product.currency)}
                    </span>
                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="text-muted line-through text-lg">
                        {fmt(product.oldPrice, product.currency)}
                      </span>
                    )}
                  </div>

                  <div>
                    {product.stock > 0 ? (
                      <span className="badge bg-success/10 text-success">
                        <i className="ri-checkbox-circle-line me-1"></i>
                        Stokta ({product.stock} adet)
                      </span>
                    ) : (
                      <span className="badge bg-danger/10 text-danger">
                        <i className="ri-close-circle-line me-1"></i>
                        Tükendi
                      </span>
                    )}
                  </div>

                  <p className="text-muted leading-relaxed mb-0">
                    {product.description}
                  </p>

                  {product.features.length > 0 && (
                    <ul className="flex flex-col gap-2">
                      {product.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <i className="ri-check-line text-success text-base"></i>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center border border-defaultborder dark:border-defaultborder/10 rounded-md overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-bodybg2"
                        aria-label="Azalt"
                      >
                        <i className="ri-subtract-line"></i>
                      </button>
                      <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQty((q) => Math.min(product.stock, q + 1))
                        }
                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-bodybg2"
                        aria-label="Arttır"
                      >
                        <i className="ri-add-line"></i>
                      </button>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted">Toplam</span>
                      <span className="font-semibold text-lg">
                        {fmt(total, product.currency)}
                      </span>
                    </div>
                    <a href="#siparis" className="ti-btn ti-btn-primary ms-auto">
                      <i className="ri-shopping-cart-2-line me-1"></i>
                      Hemen Satın Al
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sipariş formu */}
          <div id="siparis" className="box">
            <div className="box-header">
              <h5 className="box-title">Sipariş Bilgileri</h5>
            </div>
            <div className="box-body">
              {formError && (
                <div className="bg-danger/10 text-danger border border-danger/20 rounded-md p-3 mb-4 flex items-center gap-2">
                  <i className="ri-error-warning-line text-lg"></i>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={submitOrder} className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="form-label mb-0">Ad Soyad *</label>
                    <input
                      name="customerName"
                      value={form.customerName}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="form-label mb-0">E-posta *</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder="ornek@mail.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="form-label mb-0">Telefon *</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder="05XX XXX XX XX"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="form-label mb-0">Şehir *</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder="İstanbul"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label mb-0">Adres *</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="form-control"
                    placeholder="Teslimat adresi"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="form-label mb-0">Sipariş Notu</label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    rows={2}
                    className="form-control"
                    placeholder="(İsteğe bağlı)"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="form-label mb-0">Ödeme Yöntemi *</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {(
                      [
                        {
                          key: "stripe" as PaymentMethod,
                          label: "Kredi / Banka Kartı",
                          icon: "ri-bank-card-line",
                        },
                        {
                          key: "paypal" as PaymentMethod,
                          label: "PayPal",
                          icon: "ri-paypal-line",
                        },
                      ]
                    ).map((opt) => (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => setPaymentMethod(opt.key)}
                        className={`flex-1 flex items-center gap-2 border rounded-md px-4 py-3 transition-all ${
                          paymentMethod === opt.key
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-defaultborder dark:border-defaultborder/10 hover:border-primary/50"
                        }`}
                      >
                        <i className={`${opt.icon} text-xl`}></i>
                        <span className="font-medium">{opt.label}</span>
                        {paymentMethod === opt.key && (
                          <i className="ri-checkbox-circle-fill ms-auto text-primary"></i>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-defaultborder dark:border-defaultborder/10">
                  <div className="flex items-center gap-2">
                    <span className="text-muted">Ödenecek Tutar:</span>
                    <span className="font-bold text-xl text-primary">
                      {fmt(total, product.currency)}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || product.stock < 1}
                    className="ti-btn ti-btn-primary w-full sm:w-auto"
                  >
                    {submitting ? (
                      "Yönlendiriliyor..."
                    ) : (
                      <>
                        <i className="ri-secure-payment-line me-1"></i>
                        {paymentMethod === "paypal"
                          ? "PayPal ile Öde"
                          : "Kartla Öde"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </Fragment>
  );
};

export default ProductDetail;
