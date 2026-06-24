// DATA JADWAL LAPANGAN STATIS — Pengganti API /jadwal

export interface TimeSlot {
  id: string
  time: string
  status: "available" | "booked" | "closed"
}

export interface DaySchedule {
  date: string
  dayLabel: string
  slots: TimeSlot[]
}

// Helper: generate slot waktu jam 08:00 – 22:00
function generateSlots(bookedIndexes: number[] = []): TimeSlot[] {
  const hours = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00",
  ]
  return hours.map((h, i) => ({
    id: `slot-${i}`,
    time: `${h} - ${hours[i + 1] ?? "22:00"}`,
    status: bookedIndexes.includes(i) ? "booked" : "available",
  }))
}

export const JADWAL_DEFAULT: DaySchedule[] = [
  { date: "2026-06-24", dayLabel: "Sel, 24 Jun", slots: generateSlots([1, 2, 5]) },
  { date: "2026-06-25", dayLabel: "Rab, 25 Jun", slots: generateSlots([0, 3, 6, 7]) },
  { date: "2026-06-26", dayLabel: "Kam, 26 Jun", slots: generateSlots([2, 4]) },
  { date: "2026-06-27", dayLabel: "Jum, 27 Jun", slots: generateSlots([1, 8, 9]) },
  { date: "2026-06-28", dayLabel: "Sab, 28 Jun", slots: generateSlots([0, 1, 2]) },
  { date: "2026-06-29", dayLabel: "Min, 29 Jun", slots: generateSlots([3, 5, 10]) },
  { date: "2026-06-30", dayLabel: "Sen, 30 Jun", slots: generateSlots([]) },
]

export const JADWAL_LAPANGAN: Record<string, DaySchedule[]> = {
  "gor-futsal":                  JADWAL_DEFAULT,
  "lapangan-futsal-pln":         JADWAL_DEFAULT,
  "lapangan-basket-semi-indoor": JADWAL_DEFAULT,
  "lapangan-basket-flexy":       JADWAL_DEFAULT,
  "gor-bulutangkis":             JADWAL_DEFAULT,
  "lapangan-tenis":              JADWAL_DEFAULT,
  "stadion-its":                 JADWAL_DEFAULT,
  "lapangan-mini-soccer":        JADWAL_DEFAULT,
  "lapangan-voli":               JADWAL_DEFAULT,
}
