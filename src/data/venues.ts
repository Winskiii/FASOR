// DATA LAPANGAN STATIS — Pengganti API /fasilitas

export type SportKey =
  | "bulutangkis"
  | "tenis"
  | "basket"
  | "futsal"
  | "sepakbola"
  | "voli"
  | "lari"
  | "panjattebing"

export interface Venue {
  id: string
  name: string
  sport: SportKey
  image: string
  href: string
}

export const ALL_VENUES: Venue[] = [
  {
    id: "1",
    name: "GOR Futsal Indoor",
    sport: "futsal",
    image: "/images/gor futsal its.png",
    href: "/gor-futsal",
  },
  {
    id: "2",
    name: "Lapangan Futsal Outdoor",
    sport: "futsal",
    image: "/images/lapangan futsal pln.png",
    href: "/lapangan-futsal-pln",
  },
  {
    id: "3",
    name: "Lapangan Basket Semi Indoor",
    sport: "basket",
    image: "/images/lapangan basket semi indoor.png",
    href: "/lapangan-basket-semi-indoor",
  },
  {
    id: "4",
    name: "Lapangan Basket Outdoor",
    sport: "basket",
    image: "/images/lapangan basket flexy.png",
    href: "/lapangan-basket-flexy",
  },
  {
    id: "5",
    name: "GOR Badminton",
    sport: "bulutangkis",
    image: "/images/gor badminton its.png",
    href: "/gor-bulutangkis",
  },
  {
    id: "6",
    name: "Lapangan Tenis",
    sport: "tenis",
    image: "/images/lapangan tennis its.png",
    href: "/lapangan-tenis",
  },
  {
    id: "7",
    name: "Stadion Sepak Bola",
    sport: "sepakbola",
    image: "/images/stadion its.png",
    href: "/stadion-its",
  },
  {
    id: "8",
    name: "Mini Soccer",
    sport: "sepakbola",
    image: "/images/lapangan mini soccer.png",
    href: "/lapangan-mini-soccer",
  },
  {
    id: "9",
    name: "Lapangan Voli Outdoor",
    sport: "voli",
    image: "/images/lapangan voli its.png",
    href: "/lapangan-voli",
  },
]
