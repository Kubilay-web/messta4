"use client";

import Link from "next/link";
import React, { Fragment, useState } from "react";
import { Toaster, toast } from "sonner";
import { useShopSettings } from "../lib/shop-settings";

interface ContactForm {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const emptyForm: ContactForm = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const ShopContact = () => {
  const { t } = useShopSettings();
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/shop/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gönderilemedi");
      toast.success(t("contactSuccess"));
      setForm(emptyForm);
      setSent(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Fragment>
      <Toaster richColors position="top-right" />
      <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-[800px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold mb-0">
            {t("contactTitle")}
          </h1>
          <nav className="flex items-center gap-2 text-sm text-muted">
            <Link href="/shop" className="hover:text-primary">
              {t("store")}
            </Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-primary">{t("contactUs")}</span>
          </nav>
        </div>

        <div className="box">
          <div className="box-body flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="w-11 h-11 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <i className="ri-customer-service-2-line text-xl"></i>
              </span>
              <p className="text-muted mb-0">{t("contactSubtitle")}</p>
            </div>

            {sent && (
              <div className="bg-success/10 text-success border border-success/20 rounded-md p-3 flex items-center gap-2">
                <i className="ri-checkbox-circle-line text-lg"></i>
                <span>{t("contactSuccess")}</span>
              </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="form-label mb-0">{t("fullName")} *</label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="form-label mb-0">{t("email")} *</label>
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
                  <label className="form-label mb-0">{t("phone")}</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="05XX XXX XX XX"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="form-label mb-0">{t("subject")} *</label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder={t("subjectPlaceholder")}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="form-label mb-0">{t("message")} *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="form-control"
                  placeholder={t("messagePlaceholder")}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={sending}
                  className="ti-btn ti-btn-primary w-full sm:w-auto"
                >
                  <i className="ri-send-plane-line me-1"></i>
                  {sending ? t("sending") : t("send")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default ShopContact;
