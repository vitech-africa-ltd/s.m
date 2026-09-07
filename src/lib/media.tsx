import { useEffect, useState } from "react";
import QRCode from "qrcode";

export const PHOTOS = [
  "https://image.qwenlm.ai/generated-images/25138a51-2482-4c24-99d4-fd9f04a8f68e/_result.png",
  "https://image.qwenlm.ai/generated-images/364b1141-245a-454b-9fee-89476d717481/_result.png",
  "https://image.qwenlm.ai/generated-images/db882df6-fa78-47b1-9ea7-605f2ab456c1/_result.png",
  "https://image.qwenlm.ai/generated-images/c09317da-c904-4596-81c5-2974bd7e9509/_result.png",
  "https://image.qwenlm.ai/generated-images/44e606bb-4729-4e5f-8468-5ab0d72beee4/_result.png",
  "https://image.qwenlm.ai/generated-images/6f646c9d-8bb9-4428-b9d6-0bbe185f6449/_result.png",
  "https://image.qwenlm.ai/generated-images/ad683a43-a5a9-4993-b83a-ac973f89224d/_result.png",
  "https://image.qwenlm.ai/generated-images/2c8eb28d-5089-4b5f-9135-8734e98ce023/_result.png",
];

let galleryAlive = false;
let galleryVersion = 0;
let probed = false;
const gSubs = new Set<() => void>();
const probeGallery = () => {
  if (probed || typeof window === "undefined") return;
  probed = true;
  const img = new Image();
  const settle = (ok: boolean) => {
    if (galleryAlive !== ok) { galleryAlive = ok; galleryVersion++; gSubs.forEach((f) => f()); }
  };
  img.onload = () => settle(true);
  img.onerror = () => settle(false);
  img.src = PHOTOS[0];
};
export const galleryStore = {
  subscribe: (f: () => void) => { gSubs.add(f); probeGallery(); return () => { gSubs.delete(f); }; },
  getVersion: () => galleryVersion,
  isAlive: () => galleryAlive,
};

const hashIdx = (id: string, mod: number) => { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return h % mod; };
export const photoFor = (id: string) => PHOTOS[hashIdx(id, PHOTOS.length)];

export const personPhoto = (p: { id: string; photo?: string }): string | undefined => {
  if (p.photo) return p.photo;
  if (!galleryAlive) return undefined;
  return photoFor(p.id);
};

export function QR({ value, size = 72, light = "#ffffff", dark = "#101d38" }: { value: string; size?: number; light?: string; dark?: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let on = true;
    QRCode.toDataURL(value, { width: Math.max(160, size * 2), margin: 1, errorCorrectionLevel: "M", color: { light, dark } })
      .then((u: string) => { if (on) setSrc(u); })
      .catch(() => {});
    return () => { on = false; };
  }, [value, size, light, dark]);
  return src
    ? <img src={src} width={size} height={size} alt="QR code" style={{ width: size, height: size }} className="shrink-0" />
    : <span aria-hidden="true" style={{ width: size, height: size }} className="inline-block shrink-0 rounded bg-ink-100 dark:bg-ink-800" />;
}
