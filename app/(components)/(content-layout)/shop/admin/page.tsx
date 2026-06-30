"use client";

import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { shopLogout } from "../lib/actions";

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
  active: boolean;
}

interface ShopOrder {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  city: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  status: string;
  paymentMethod: string;
  trackingNumber?: string | null;
  cargoCompany?: string | null;
  createdAt: string;
  product?: { name: string } | null;
}

interface ShopMessage {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

const STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

// Sipariş durumu Türkçe etiketleri (ürün sahibi bunları değiştirir)
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Sipariş Alındı",
  PAID: "Ödendi",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
};

// Ödeme yöntemi Türkçe etiketleri
const PAYMENT_LABEL: Record<string, string> = {
  stripe: "Online Kart",
  paypal: "PayPal",
  cod_cash: "Kapıda Nakit",
  cod_card: "Kapıda Kart",
};

const statusBadge: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning",
  PAID: "bg-success/10 text-success",
  PROCESSING: "bg-secondary/10 text-secondary",
  SHIPPED: "bg-info/10 text-info",
  DELIVERED: "bg-primary/10 text-primary",
  CANCELLED: "bg-danger/10 text-danger",
};

const emptyProduct = {
  id: "",
  name: "",
  slug: "",
  description: "",
  price: "" as number | string,
  oldPrice: "" as number | string,
  currency: "TRY",
  stock: "" as number | string,
  images: [] as string[],
  features: "",
};

const ShopAdmin = () => {
  const [authState, setAuthState] = useState<"loading" | "ok" | "denied">(
    "loading"
  );
  const [canClaim, setCanClaim] = useState(false);
  const [tab, setTab] = useState<"products" | "orders" | "messages">("products");

  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [messages, setMessages] = useState<ShopMessage[]>([]);
  const [openMessage, setOpenMessage] = useState<ShopMessage | null>(null);
  const [form, setForm] = useState<typeof emptyProduct>(emptyProduct);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fmt = (n: number, currency = "TRY") =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);

  const loadAll = async () => {
    const [pRes, oRes, mRes] = await Promise.all([
      fetch("/shop/api/products?all=1", { cache: "no-store" }),
      fetch("/shop/api/order", { cache: "no-store" }),
      fetch("/shop/api/contact", { cache: "no-store" }),
    ]);
    const pData = await pRes.json();
    const oData = await oRes.json();
    const mData = await mRes.json();
    setProducts(pData.products || []);
    setOrders(oData.orders || []);
    setMessages(mData.messages || []);
  };

  const unreadCount = messages.filter((m) => m.status === "NEW").length;

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/shop/api/me", { cache: "no-store" });
        const data = await res.json();
        if (data.user?.isAdmin) {
          setAuthState("ok");
          loadAll();
        } else {
          setAuthState("denied");
          setCanClaim(!!data.canClaimAdmin);
        }
      } catch {
        setAuthState("denied");
      }
    };
    init();
  }, []);

  const claimAdmin = async () => {
    const res = await fetch("/shop/api/admin/claim", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message || "Yönetici oldunuz");
      setAuthState("ok");
      loadAll();
    } else toast.error(data.error || "İşlem başarısız");
  };

  const openNew = () => {
    setForm(emptyProduct);
    setHasDiscount(false);
    setShowForm(true);
  };

  const openEdit = (p: ShopProduct) => {
    setForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      oldPrice: p.oldPrice ?? "",
      currency: p.currency,
      stock: p.stock,
      images: p.images || [],
      features: (p.features || []).join("\n"),
    });
    setHasDiscount(!!p.oldPrice && p.oldPrice > p.price);
    setShowForm(true);
  };

  // Cloudinary'e görsel yükle (çoklu), dönen URL'leri forma ekle
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/shop/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yükleme başarısız");
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...(data.urls || [])],
      }));
      toast.success(`${(data.urls || []).length} görsel yüklendi`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = ""; // aynı dosyayı tekrar seçebilmek için
    }
  };

  const removeImage = (url: string) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((u) => u !== url),
    }));
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: form.price,
        // İndirim toggle kapalıysa eski fiyatı gönderme (boş -> null)
        oldPrice: hasDiscount ? form.oldPrice : "",
        currency: form.currency,
        stock: form.stock,
        images: form.images.map((s) => s.trim()).filter(Boolean),
        features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      const res = form.id
        ? await fetch(`/shop/api/products/${form.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/shop/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kaydedilemedi");
      toast.success(form.id ? "Ürün güncellendi" : "Ürün eklendi");
      setShowForm(false);
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (p: ShopProduct) => {
    if (!confirm(`"${p.name}" silinsin mi?`)) return;
    const res = await fetch(`/shop/api/products/${p.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || "Silinemedi");
    toast.success(data.softDeleted ? "Ürün pasife alındı" : "Ürün silindi");
    loadAll();
  };

  const toggleActive = async (p: ShopProduct) => {
    const res = await fetch(`/shop/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    if (res.ok) loadAll();
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/shop/api/order/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Durum güncellendi");
      loadAll();
    } else toast.error("Güncellenemedi");
  };

  // Kargo takip bilgisini kaydet (firma + takip no). Alıcı bunu takip eder.
  const saveTracking = async (
    id: string,
    cargoCompany: string,
    trackingNumber: string
  ) => {
    const res = await fetch(`/shop/api/order/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cargoCompany, trackingNumber }),
    });
    if (res.ok) {
      toast.success("Kargo bilgisi kaydedildi");
      loadAll();
    } else toast.error("Kaydedilemedi");
  };

  // --- Bize Ulaşın mesajları ---
  const openMessageDetail = async (m: ShopMessage) => {
    setOpenMessage(m);
    if (m.status === "NEW") {
      await fetch(`/shop/api/contact/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "READ" }),
      });
      setMessages((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, status: "READ" } : x))
      );
    }
  };

  const setMessageStatus = async (id: string, status: string) => {
    const res = await fetch(`/shop/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setMessages((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status } : x))
      );
      if (openMessage?.id === id) setOpenMessage({ ...openMessage, status });
    } else toast.error("Güncellenemedi");
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Bu mesaj silinsin mi?")) return;
    const res = await fetch(`/shop/api/contact/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessages((prev) => prev.filter((x) => x.id !== id));
      if (openMessage?.id === id) setOpenMessage(null);
      toast.success("Mesaj silindi");
    } else toast.error("Silinemedi");
  };

  const resendInvoice = async (id: string) => {
    const res = await fetch(`/shop/api/order/${id}/resend-invoice`, {
      method: "POST",
    });
    const data = await res.json();
    if (res.ok) toast.success(data.message || "Fatura gönderildi");
    else toast.error(data.error || "Gönderilemedi");
  };

  // --- Erişim durumları ---
  if (authState === "loading") {
    return (
      <Fragment>
        <div className="flex items-center justify-center py-20">
          <span className="ti-spinner text-primary" role="status"></span>
          <span className="ms-3 text-muted">Yükleniyor...</span>
        </div>
      </Fragment>
    );
  }

  if (authState === "denied") {
    return (
      <Fragment>
        <Toaster richColors position="top-right" />
        <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-[1400px] mx-auto w-full">
        {/* Sayfa başlığı (Pageheader yerine) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold mb-0">Admin Paneli</h1>
          <nav className="flex items-center gap-2 text-sm text-muted">
            <span>Mağaza</span>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-primary">Admin</span>
          </nav>
        </div>
        <div className="box">
          <div className="box-body flex flex-col items-center justify-center text-center gap-4 py-16">
            <i className="ri-lock-2-line text-[3rem] text-danger"></i>
            <div>
              <h5 className="font-semibold mb-1">Yetkiniz yok</h5>
              <p className="text-muted mb-0">
                Bu sayfa yalnızca mağaza yöneticileri içindir.
              </p>
            </div>
            {/* {canClaim ? (
              <button onClick={claimAdmin} className="ti-btn ti-btn-primary">
                <i className="ri-shield-user-line me-1"></i> İlk Yönetici Ol
              </button>
            ) : (
              <Link href="/shop" className="ti-btn ti-btn-light">
                Mağazaya Dön
              </Link>
            )} */}

              <Link href="/shop" className="ti-btn ti-btn-light">
                Mağazaya Dön
              </Link>
      
          </div>
        </div>
        </div>
      </Fragment>
    );
  }

  // --- Admin paneli ---
  const totalRevenue = orders
    .filter((o) => o.status === "PAID" || o.status === "SHIPPED" || o.status === "DELIVERED")
    .reduce((s, o) => s + o.totalPrice, 0);
  const lowStock = products.filter((p) => p.active && p.stock <= 5).length;

  return (
    <Fragment>
      <Toaster richColors position="top-right" />

      <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-[1400px] mx-auto w-full">
      {/* Sayfa başlığı (Pageheader yerine) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold mb-0">Admin Paneli</h1>
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-2 text-sm text-muted">
            <Link href="/shop" className="hover:text-primary">
              Mağaza
            </Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-primary">Admin</span>
          </nav>
          <form action={shopLogout}>
            <button
              type="submit"
              className="ti-btn ti-btn-danger-light ti-btn-sm whitespace-nowrap"
            >
              <i className="ri-logout-box-r-line me-1"></i> Çıkış Yap
            </button>
          </form>
        </div>
      </div>

      {/* Özet kartlar — flexbox responsive */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: "Ürün Sayısı", value: products.length, icon: "ri-box-3-line", cls: "bg-primary/10 text-primary" },
          { label: "Sipariş", value: orders.length, icon: "ri-shopping-bag-line", cls: "bg-info/10 text-info" },
          { label: "Ciro (ödenen)", value: fmt(totalRevenue), icon: "ri-money-dollar-circle-line", cls: "bg-success/10 text-success" },
          { label: "Düşük Stok (≤5)", value: lowStock, icon: "ri-alarm-warning-line", cls: "bg-warning/10 text-warning" },
        ].map((k) => (
          <div
            key={k.label}
            className="box !mb-0 basis-[calc(50%-0.5rem)] lg:basis-[calc(25%-0.75rem)]"
          >
            <div className="box-body flex items-center gap-3">
              <span className={`w-11 h-11 rounded-md flex items-center justify-center shrink-0 ${k.cls}`}>
                <i className={`${k.icon} text-xl`}></i>
              </span>
              <div>
                <p className="text-muted text-xs mb-0">{k.label}</p>
                <h5 className="font-semibold mb-0">{k.value}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sekmeler */}
      <div className="box">
        <div className="box-header flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("products")}
              className={`ti-btn ti-btn-sm ${tab === "products" ? "ti-btn-primary" : "ti-btn-light"}`}
            >
              <i className="ri-box-3-line me-1"></i> Ürünler
            </button>
            <button
              onClick={() => setTab("orders")}
              className={`ti-btn ti-btn-sm ${tab === "orders" ? "ti-btn-primary" : "ti-btn-light"}`}
            >
              <i className="ri-file-list-3-line me-1"></i> Siparişler
            </button>
            <button
              onClick={() => setTab("messages")}
              className={`ti-btn ti-btn-sm relative ${tab === "messages" ? "ti-btn-primary" : "ti-btn-light"}`}
            >
              <i className="ri-mail-line me-1"></i> Mesajlar
              {unreadCount > 0 && (
                <span className="absolute -top-2 -end-2 bg-danger text-white text-[0.65rem] min-w-[1.1rem] h-[1.1rem] px-1 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          {tab === "products" && (
            <button onClick={openNew} className="ti-btn ti-btn-primary ti-btn-sm">
              <i className="ri-add-line me-1"></i> Yeni Ürün
            </button>
          )}
        </div>

        <div className="box-body">
          {/* ÜRÜN FORMU */}
          {tab === "products" && showForm && (
            <form
              onSubmit={saveProduct}
              className="border border-defaultborder dark:border-defaultborder/10 rounded-lg p-4 mb-5 flex flex-col gap-4 bg-gray-50/50 dark:bg-bodybg2/30"
            >
              <div className="flex items-center justify-between">
                <h6 className="font-semibold mb-0">
                  {form.id ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
                </h6>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-muted hover:text-danger"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-1 basis-full md:basis-[calc(50%-0.5rem)]">
                  <label className="form-label mb-0">Ürün Adı *</label>
                  <input
                    required
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1 basis-full md:basis-[calc(50%-0.5rem)]">
                  <label className="form-label mb-0">Para Birimi</label>
                  <select
                    className="form-control"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    <option value="TRY">TRY ₺</option>
                    <option value="USD">USD $</option>
                    <option value="EUR">EUR €</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1 basis-full md:basis-[calc(50%-0.5rem)]">
                  <label className="form-label mb-0">Fiyat *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1 basis-full md:basis-[calc(50%-0.5rem)]">
                  <label className="form-label mb-0 flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="form-check-input m-0"
                      checked={hasDiscount}
                      onChange={(e) => {
                        setHasDiscount(e.target.checked);
                        if (!e.target.checked) setForm({ ...form, oldPrice: "" });
                      }}
                    />
                    İndirimli fiyat ekle
                  </label>
                  {hasDiscount ? (
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="Eski (üstü çizili) fiyat"
                      value={form.oldPrice}
                      onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                    />
                  ) : (
                    <span className="text-muted text-xs">
                      İndirim göstermek istemiyorsanız boş bırakın.
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 basis-full md:basis-[calc(50%-0.5rem)]">
                  <label className="form-label mb-0">Stok Adedi *</label>
                  <input
                    required
                    type="number"
                    className="form-control"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="form-label mb-0">Açıklama</label>
                <textarea
                  rows={2}
                  className="form-control"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-2 basis-full md:basis-[calc(50%-0.5rem)]">
                  <label className="form-label mb-0">Ürün Görselleri</label>

                  {/* Yükleme butonu (Cloudinary) */}
                  <label
                    className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
                      uploading
                        ? "opacity-60 pointer-events-none"
                        : "border-defaultborder dark:border-defaultborder/10 hover:border-primary/50"
                    }`}
                  >
                    <i className="ri-upload-cloud-2-line text-2xl text-primary"></i>
                    <span className="text-sm text-muted">
                      {uploading
                        ? "Yükleniyor..."
                        : "Görsel seçin (birden fazla olabilir)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      disabled={uploading}
                      onChange={handleImageUpload}
                    />
                  </label>

                  {/* Yüklenen görsel önizlemeleri */}
                  {form.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.images.map((url) => (
                        <div
                          key={url}
                          className="relative w-16 h-16 rounded-md overflow-hidden border border-defaultborder dark:border-defaultborder/10 group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt="Ürün görseli"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(url)}
                            className="absolute top-0.5 end-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-danger text-white text-xs opacity-90 hover:opacity-100"
                            title="Kaldır"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 basis-full md:basis-[calc(50%-0.5rem)]">
                  <label className="form-label mb-0">
                    Özellikler (her satıra bir tane)
                  </label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Ücretsiz kargo"
                    value={form.features}
                    onChange={(e) => setForm({ ...form, features: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="ti-btn ti-btn-primary">
                  {saving ? "Kaydediliyor..." : form.id ? "Güncelle" : "Ekle"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="ti-btn ti-btn-light"
                >
                  İptal
                </button>
              </div>
            </form>
          )}

          {/* ÜRÜN TABLOSU */}
          {tab === "products" && (
            <div className="overflow-x-auto">
              <table className="table table-hover whitespace-nowrap min-w-full">
                <thead>
                  <tr className="border-b border-defaultborder">
                    <th>Ürün</th>
                    <th>Fiyat</th>
                    <th>Stok</th>
                    <th>Durum</th>
                    <th className="text-end">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-6">
                        Henüz ürün yok. &quot;Yeni Ürün&quot; ile ekleyin.
                      </td>
                    </tr>
                  )}
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-defaultborder/50">
                      <td>
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.images[0] || "https://via.placeholder.com/60?text=-"}
                            alt={p.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td>{fmt(p.price, p.currency)}</td>
                      <td>
                        <span
                          className={`badge ${
                            p.stock <= 5 ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                          }`}
                        >
                          {p.stock} adet
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleActive(p)}
                          className={`badge ${p.active ? "bg-success/10 text-success" : "bg-secondary/10 text-secondary"}`}
                        >
                          {p.active ? "Aktif" : "Pasif"}
                        </button>
                      </td>
                      <td className="text-end">
                        <div className="flex gap-1 justify-end">
                          <Link
                            href={`/shop/${p.slug}`}
                            className="ti-btn ti-btn-light ti-btn-sm"
                            title="Görüntüle"
                          >
                            <i className="ri-eye-line"></i>
                          </Link>
                          <button
                            onClick={() => openEdit(p)}
                            className="ti-btn ti-btn-info ti-btn-sm"
                            title="Düzenle"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => deleteProduct(p)}
                            className="ti-btn ti-btn-danger ti-btn-sm"
                            title="Sil"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SİPARİŞ TABLOSU */}
          {tab === "orders" && (
            <div className="overflow-x-auto">
              <table className="table table-hover whitespace-nowrap min-w-full">
                <thead>
                  <tr className="border-b border-defaultborder">
                    <th>Müşteri</th>
                    <th>Ürün</th>
                    <th>Adet</th>
                    <th>Tutar</th>
                    <th>Ödeme</th>
                    <th>Durum</th>
                    <th>Kargo Takip</th>
                    <th>Tarih</th>
                    <th className="text-end">Fatura</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center text-muted py-6">
                        Henüz sipariş yok.
                      </td>
                    </tr>
                  )}
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-defaultborder/50">
                      <td>
                        <div className="flex flex-col">
                          <span className="font-medium">{o.customerName}</span>
                          <span className="text-muted text-xs">{o.email}</span>
                        </div>
                      </td>
                      <td>{o.product?.name || "-"}</td>
                      <td>{o.quantity}</td>
                      <td className="font-medium">
                        {fmt(o.totalPrice, o.currency || "TRY")}
                      </td>
                      <td>
                        <span className="badge bg-light text-default">
                          {PAYMENT_LABEL[o.paymentMethod] || o.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          className={`badge border-0 cursor-pointer ${statusBadge[o.status] || ""}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s] || s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <TrackingCell
                          cargoCompany={o.cargoCompany || ""}
                          trackingNumber={o.trackingNumber || ""}
                          onSave={(c, tn) => saveTracking(o.id, c, tn)}
                        />
                      </td>
                      <td className="text-muted text-xs">
                        {new Date(o.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="text-end">
                        <div className="flex gap-1 justify-end">
                          <a
                            href={`/shop/api/invoice/${o.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ti-btn ti-btn-light ti-btn-sm"
                            title="Fatura (PDF)"
                          >
                            <i className="ri-file-pdf-2-line"></i>
                          </a>
                          <button
                            onClick={() => resendInvoice(o.id)}
                            className="ti-btn ti-btn-primary ti-btn-sm"
                            title="Faturayı e-posta ile gönder"
                          >
                            <i className="ri-mail-send-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* MESAJLAR TABLOSU (Bize Ulaşın) */}
          {tab === "messages" && (
            <div className="overflow-x-auto">
              <table className="table table-hover whitespace-nowrap min-w-full">
                <thead>
                  <tr className="border-b border-defaultborder">
                    <th>Durum</th>
                    <th>Gönderen</th>
                    <th>Konu</th>
                    <th>Tarih</th>
                    <th className="text-end">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-6">
                        Henüz mesaj yok.
                      </td>
                    </tr>
                  )}
                  {messages.map((m) => (
                    <tr
                      key={m.id}
                      className={`border-b border-defaultborder/50 ${
                        m.status === "NEW" ? "font-semibold" : ""
                      }`}
                    >
                      <td>
                        {m.status === "NEW" && (
                          <span className="badge bg-danger/10 text-danger">Yeni</span>
                        )}
                        {m.status === "READ" && (
                          <span className="badge bg-info/10 text-info">Okundu</span>
                        )}
                        {m.status === "REPLIED" && (
                          <span className="badge bg-success/10 text-success">
                            Yanıtlandı
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span>{m.fullName}</span>
                          <span className="text-muted text-xs font-normal">
                            {m.email}
                            {m.phone ? ` · ${m.phone}` : ""}
                          </span>
                        </div>
                      </td>
                      <td className="max-w-[16rem] truncate">{m.subject}</td>
                      <td className="text-muted text-xs font-normal">
                        {new Date(m.createdAt).toLocaleString("tr-TR")}
                      </td>
                      <td className="text-end">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => openMessageDetail(m)}
                            className="ti-btn ti-btn-light ti-btn-sm"
                            title="Görüntüle"
                          >
                            <i className="ri-eye-line"></i>
                          </button>
                          <a
                            href={`mailto:${m.email}?subject=${encodeURIComponent(
                              "Re: " + m.subject
                            )}`}
                            onClick={() => setMessageStatus(m.id, "REPLIED")}
                            className="ti-btn ti-btn-primary ti-btn-sm"
                            title="E-posta ile yanıtla"
                          >
                            <i className="ri-reply-line"></i>
                          </a>
                          <button
                            onClick={() => deleteMessage(m.id)}
                            className="ti-btn ti-btn-danger ti-btn-sm"
                            title="Sil"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* MESAJ DETAY MODALI */}
      {openMessage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpenMessage(null)}
        >
          <div
            className="bg-white dark:bg-bodybg rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-defaultborder dark:border-defaultborder/10">
              <h6 className="font-semibold mb-0">{openMessage.subject}</h6>
              <button
                onClick={() => setOpenMessage(null)}
                className="text-muted hover:text-danger"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div className="text-sm">
                <span className="text-muted">Gönderen: </span>
                <span className="font-medium">{openMessage.fullName}</span>
              </div>
              <div className="text-sm flex flex-wrap gap-x-4">
                <span>
                  <span className="text-muted">E-posta: </span>
                  {openMessage.email}
                </span>
                {openMessage.phone && (
                  <span>
                    <span className="text-muted">Telefon: </span>
                    {openMessage.phone}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted">
                {new Date(openMessage.createdAt).toLocaleString("tr-TR")}
              </div>
              <div className="bg-gray-50 dark:bg-bodybg2/40 rounded-md p-3 text-sm whitespace-pre-wrap">
                {openMessage.message}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-end p-4 border-t border-defaultborder dark:border-defaultborder/10">
              <a
                href={`mailto:${openMessage.email}?subject=${encodeURIComponent(
                  "Re: " + openMessage.subject
                )}`}
                onClick={() => setMessageStatus(openMessage.id, "REPLIED")}
                className="ti-btn ti-btn-primary ti-btn-sm"
              >
                <i className="ri-reply-line me-1"></i> E-posta ile Yanıtla
              </a>
              <button
                onClick={() => deleteMessage(openMessage.id)}
                className="ti-btn ti-btn-danger-light ti-btn-sm"
              >
                <i className="ri-delete-bin-line me-1"></i> Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

// Kargo takip hücresi — firma ve takip no için satır içi düzenleme.
function TrackingCell({
  cargoCompany,
  trackingNumber,
  onSave,
}: {
  cargoCompany: string;
  trackingNumber: string;
  onSave: (cargoCompany: string, trackingNumber: string) => void;
}) {
  const [company, setCompany] = useState(cargoCompany);
  const [tracking, setTracking] = useState(trackingNumber);
  const dirty = company !== cargoCompany || tracking !== trackingNumber;

  return (
    <div className="flex items-center gap-1">
      <div className="flex flex-col gap-1">
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Kargo firması"
          className="form-control form-control-sm !py-1 !text-xs w-32"
        />
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Takip no"
          className="form-control form-control-sm !py-1 !text-xs w-32"
        />
      </div>
      <button
        onClick={() => onSave(company.trim(), tracking.trim())}
        disabled={!dirty}
        className={`ti-btn ti-btn-sm ${
          dirty ? "ti-btn-success" : "ti-btn-light"
        }`}
        title="Kargo bilgisini kaydet"
      >
        <i className="ri-save-line"></i>
      </button>
    </div>
  );
}

export default ShopAdmin;
