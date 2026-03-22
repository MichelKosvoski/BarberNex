import Banercard1 from "../assets/Banercard1.png";
import Degrade from "../assets/Degrade.png";
import Lowfade from "../assets/Lowfade.png";
import Barbermodel from "../assets/Barbermodel.png";

export const SERVICE_IMAGE_OPTIONS = [
  { key: "banercard1", label: "Banner card", src: Banercard1 },
  { key: "degrade", label: "Degrade", src: Degrade },
  { key: "lowfade", label: "Low fade", src: Lowfade },
  { key: "barbermodel", label: "Barber model", src: Barbermodel },
];

export function resolveServiceImage(imageKey) {
  if (!imageKey) return Banercard1;
  if (String(imageKey).startsWith("data:") || String(imageKey).startsWith("http")) {
    return imageKey;
  }
  const match = SERVICE_IMAGE_OPTIONS.find((item) => item.key === imageKey);
  return match?.src || Banercard1;
}
