/* Student portrait pool + real QR component */
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

const PHOTOS = [
  "https://image.qwenlm.ai/generated-images/25138a51-2482-4c24-99d4-fd9f04a8f68e/_result.png",
  "https://image.qwenlm.ai/generated-images/364b1141-245a-454b-9fee-89476d717481/_result.png",
  "https://image.qwenlm.ai/generated-images/db882df6-fa78-47b1-9ea7-605f2ab456c1/_result.png",
  "https://image.qwenlm.ai/generated-images/c09317da-c904-4596-81c5-2974bd7e9509/_result.png",
];
const hashIdx = (id: string, mod: number) => { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return h % mod; };
export const photoFor = (id: string) => PHOTOS[hashIdx(id, PHOTOS.length)];

export function QR({ value, size = 72, light = "#ffffff", dark = "#101d38" }: { value: string; size?: number; light?: string; dark?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    QRCode.toCanvas(cv, value, { width: size, margin: 1, color: { light, dark }, errorCorrectionLevel: "M" }).catch(() => {});
  }, [value, size, light, dark]);
  return <canvas ref={ref} width={size} height={size} style={{ width: size, height: size }} aria-label="QR code" />;
}

export function useTicker(intervalMs = 3000) {
  const [, setN] = useState(0);
  useEffect(() => { const id = setInterval(() => setN((x) => x + 1), intervalMs); return () => clearInterval(id); }, [intervalMs]);
}
