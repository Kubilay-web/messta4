"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "../(components)/(authentication-layout)/authentication/sign-in/actions";

export default function LoginForm({ redirect = "/shop" }: { redirect?: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Kullanıcı adı ve şifre zorunludur.");
      return;
    }
    start(async () => {
      try {
        const res = await login({ username: username.trim(), password });
        if (res?.error) setError(res.error);
        else router.push(redirect);
      } catch {
        setError("Beklenmeyen bir hata oluştu.");
      }
    });
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sol: marka paneli */}
      <div className="relative hidden lg:flex lg:w-1/2">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(49,46,129,.85), rgba(79,70,229,.7)), url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200')",
          }}
        />
        <div className="relative flex h-full w-full flex-col justify-between p-10 text-white">
          <Link href="/" className="inline-flex w-fit items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg font-extrabold text-indigo-600">
              S
            </span>
            <span className="text-lg font-extrabold">Shop</span>
          </Link>
          <div>
            <h2 className="text-4xl font-extrabold leading-tight">
              Tekrar hoş geldin, <br /> alışverişe devam et.
            </h2>
            <p className="mt-3 max-w-md text-indigo-100">
              Hesabına giriş yap; siparişlerini takip et, hızlı ödeme yap ve
              kampanyalardan ilk sen haberdar ol.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-indigo-100">
              <li>✓ Hızlı ve güvenli ödeme</li>
              <li>✓ Sipariş takibi</li>
              <li>✓ Özel kampanyalar</li>
            </ul>
          </div>
          <p className="text-xs text-indigo-200">© 2026 Shop</p>
        </div>
      </div>

      {/* Sağ: form */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-extrabold text-white">
              S
            </span>
            <span className="text-lg font-extrabold text-gray-900">Shop</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-800">Giriş Yap</h1>
          <p className="mt-1 text-sm text-gray-500">
            Hesabına erişmek için bilgilerini gir.
          </p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Kullanıcı Adı
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="kullanıcıadı"
                autoComplete="username"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600">Şifre</label>
                <Link
                  href="/authentication/reset-password/cover/"
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  Şifremi unuttum
                </Link>
              </div>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-16 text-sm outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  {show ? "Gizle" : "Göster"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Hesabın yok mu?{" "}
            <Link
              href={`/register?redirect=${encodeURIComponent(redirect)}`}
              className="font-semibold text-indigo-600 hover:underline"
            >
              Üye Ol
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-600">
              ← Anasayfaya dön
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
