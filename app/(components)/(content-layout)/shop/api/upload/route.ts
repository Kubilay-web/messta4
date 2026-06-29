// app/(components)/(content-layout)/shop/api/upload/route.ts
// Shop - ürün görsellerini Cloudinary'e yükler. Yalnızca admin/satıcı.
// Tek istekte birden fazla dosya kabul eder ("files" alanı), secure_url listesi döner.
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { requireShopAdmin } from "../../lib/auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET!,
});

const uploadBuffer = (buffer: Buffer) =>
  new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "shop/products" }, (error, res) => {
        if (error || !res) reject(error);
        else resolve(res as { secure_url: string });
      })
      .end(buffer);
  });

export async function POST(req: Request) {
  try {
    const guard = await requireShopAdmin();
    if (guard.error)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    const formData = await req.formData();
    // Hem "files" (çoklu) hem "file" (tekli) destekle
    const files = [
      ...formData.getAll("files"),
      ...formData.getAll("file"),
    ].filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0)
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });

    const urls = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await uploadBuffer(buffer);
        return result.secure_url;
      })
    );

    return NextResponse.json({ urls });
  } catch (err) {
    console.error("[shop/upload]", err);
    return NextResponse.json({ error: "Yükleme başarısız." }, { status: 500 });
  }
}
