import { useMemo, useState } from "react";

export const DURATION_OPTIONS = [
  { id: 0, label: "1 saat", endTime: "13:00", minutes: 60 },
  { id: 1, label: "1.5 saat", endTime: "13:30", minutes: 90 },
  { id: 2, label: "2 saat", endTime: "14:00", minutes: 120 },
  { id: 3, label: "3 saat", endTime: "15:00", minutes: 180 },
  { id: 4, label: "4 saat", endTime: "16:00", minutes: 240 },
  { id: 5, label: "5 saat", endTime: "17:00", minutes: 300 },
  { id: 6, label: "Tam gun", endTime: "21:00", minutes: 600 }
] as const;

export function useDuration(defaultIndex = 3) {
  const [index, setIndex] = useState(defaultIndex);
  const selectedDuration = useMemo(() => DURATION_OPTIONS[index], [index]);

  return {
    index,
    setIndex,
    selectedDuration
  };
}
