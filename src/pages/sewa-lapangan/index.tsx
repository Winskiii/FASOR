import Head from "next/head"
import { Box, Flex, HStack, Text, Button, Grid, Icon, Badge } from "@chakra-ui/react"
import Image from "next/image"
import { useRouter } from "next/router"
import { useState } from "react"
import { GiShuttlecock, GiBasketballBall, GiSoccerBall } from "react-icons/gi"
import { MdSportsTennis, MdSportsVolleyball, MdDirectionsRun } from "react-icons/md"
import { FaHiking, FiGrid, FaStar } from "react-icons/fa"
import { FiGrid as FiGridIcon } from "react-icons/fi"
import FasorNavbar from "@/components/organisms/FasorNavbar"
import { ALL_VENUES, type SportKey, type Venue } from "@/data/venues"

const SPORT_ICONS = [
  { key: "bulutangkis", label: "Bulutangkis",   image: "/images/badminton.png",      circleBg: "#CFFAFE", iconColor: "#0891B2", icon: GiShuttlecock, href: "/gor-bulutangkis" },
  { key: "tenis",       label: "Tenis",          image: "/images/tennis.png",          circleBg: "#D1FAE5", iconColor: "#059669", icon: MdSportsTennis, href: "/lapangan-tenis" },
  { key: "basket",      label: "Basket",         image: "/images/basket.png",         circleBg: "#FED7AA", iconColor: "#EA580C", icon: GiBasketballBall, href: "/lapangan-basket-semi-indoor" },
  { key: "futsal",      label: "Futsal",         image: "/images/futsal.png",         circleBg: "#FEE2E2", iconColor: "#DC2626", icon: GiSoccerBall, href: "/gor-futsal" },
  { key: "sepakbola",   label: "Sepak Bola",     image: "/images/sepak bola.png",     circleBg: "#D1FAE5", iconColor: "#16A34A", icon: GiSoccerBall, href: "/stadion-its" },
  { key: "voli",        label: "Voli",           image: "/images/voli.png",           circleBg: "#FCE7F3", iconColor: "#BE185D", icon: MdSportsVolleyball, href: "/lapangan-voli" },
  { key: "lari",        label: "Lari/Atletik",   image: "/images/lari.png",           circleBg: "#EDE9FE", iconColor: "#7C3AED", icon: MdDirectionsRun, href: "/sewa-lapangan" },
  { key: "panjattebing",label: "Panjat Tebing",  image: "/images/panjat tebing.png",  circleBg: "#FEF3C7", iconColor: "#D97706", icon: FaHiking, href: "/sewa-lapangan" },
]

const VenueCard = ({ venue }: { venue: Venue }) => {
  const router = useRouter()
  const sportCfg = SPORT_ICONS.find(s => s.key === venue.sport)
  return (
    <Box
      border="1px solid" borderColor="gray.200" borderRadius="xl" overflow="hidden"
      bg="white" boxShadow="sm"
      _hover={{ boxShadow: "md", transform: "translateY(-3px)" }} transition="all 0.2s"
      cursor="pointer" onClick={() => router.push(venue.href)}
    >
      <Box position="relative" h="180px" w="full">
        <Image src={venue.image} alt={venue.name} fill style={{ objectFit: "cover" }} />
      </Box>
      <Box p={4}>
        <Text fontSize="sm" fontWeight="700" color="gray.800" mb={1}>{venue.name}</Text>
        {sportCfg && (
          <HStack spacing={1.5} mb={3}>
            <Box w="18px" h="18px" borderRadius="full" bg={sportCfg.circleBg}
              display="flex" alignItems="center" justifyContent="center">
              <Icon as={sportCfg.icon} color={sportCfg.iconColor} boxSize={3} />
            </Box>
            <Text fontSize="xs" color="gray.500">{sportCfg.label}</Text>
          </HStack>
        )}
        <Button size="sm" variant="outline" color="#008FFF" borderColor="#008FFF" w="full"
          borderRadius="full" fontWeight="600" fontSize="xs" _hover={{ bg: "#008FFF", color: "white" }}>
          Lihat Jadwal
        </Button>
      </Box>
    </Box>
  )
}

export default function SewaLapanganPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<SportKey | null>(null)
  const filtered = selected ? ALL_VENUES.filter(v => v.sport === selected) : ALL_VENUES

  return (
    <>
      <Head>
        <title>Sewa Lapangan — Fasor ITS</title>
        <meta name="description" content="Daftar semua fasilitas lapangan olahraga yang tersedia untuk disewa di ITS" />
      </Head>
      <Box minH="100vh" bg="gray.50">
        <FasorNavbar />
        <Box maxW="1280px" mx="auto" px={{ base: 4, md: 8 }} py={8}>
          {/* Sport Filter */}
          <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} mb={6} boxShadow="sm" border="1px solid" borderColor="gray.200">
            <Text fontSize="lg" fontWeight="700" mb={0.5}>Pilih Jenis Olahraga</Text>
            <Text fontSize="sm" color="gray.500" mb={5}>Klik kategori untuk memfilter lapangan</Text>
            <Grid templateColumns={{ base: "repeat(3, 1fr)", sm: "repeat(4, 1fr)", md: "repeat(5, 1fr)" }} gap={2}>
              {SPORT_ICONS.map((sport) => {
                const isSelected = selected === sport.key as SportKey
                return (
                  <Box key={sport.key} as="button" textAlign="center" py={3} px={2} borderRadius="xl"
                    bg={isSelected ? "blue.50" : "transparent"} border="2px solid"
                    borderColor={isSelected ? "blue.200" : "transparent"}
                    _hover={{ bg: "gray.50" }} transition="all 0.15s" cursor="pointer" outline="none"
                    onClick={() => setSelected(isSelected ? null : sport.key as SportKey)}>
                    <Flex justify="center" mb={2}>
                      <Box w="64px" h="64px" borderRadius="full" bg={sport.circleBg}
                        display="flex" alignItems="center" justifyContent="center"
                        position="relative" overflow="hidden">
                        <Image src={sport.image} alt={sport.label} fill style={{ objectFit: "contain", padding: "10px" }} />
                      </Box>
                    </Flex>
                    <Text fontSize="xs" fontWeight={isSelected ? "700" : "500"}
                      color={isSelected ? "blue.600" : "gray.700"}>{sport.label}</Text>
                  </Box>
                )
              })}
              <Box as="button" textAlign="center" py={3} px={2} borderRadius="xl"
                bg={!selected ? "blue.50" : "transparent"} border="2px solid"
                borderColor={!selected ? "blue.200" : "transparent"}
                _hover={{ bg: "gray.50" }} transition="all 0.15s" cursor="pointer" outline="none"
                onClick={() => setSelected(null)}>
                <Flex justify="center" mb={2}>
                  <Box w="64px" h="64px" borderRadius="full" bg="gray.100"
                    display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiGridIcon} boxSize={6} color="gray.400" />
                  </Box>
                </Flex>
                <Text fontSize="xs" fontWeight="500" color="gray.700">Tampilkan Semua</Text>
              </Box>
            </Grid>
          </Box>

          {/* Venue List */}
          <Box bg="white" borderRadius="xl" p={{ base: 4, md: 6 }} boxShadow="sm" border="1px solid" borderColor="gray.200">
            <Flex justifyContent="space-between" alignItems="center" mb={5}>
              <Text fontSize="md" fontWeight="700">
                Menampilkan <Box as="span" color="blue.600">{filtered.length}</Box> lapangan
                {selected && <Badge ml={2} colorScheme="blue" borderRadius="full">{SPORT_ICONS.find(s=>s.key===selected)?.label}</Badge>}
              </Text>
              {selected && (
                <Button size="xs" variant="ghost" color="gray.500" onClick={() => setSelected(null)}>✕ Reset</Button>
              )}
            </Flex>
            <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={5}>
              {filtered.map(venue => <VenueCard key={venue.id} venue={venue} />)}
            </Grid>
          </Box>
        </Box>
      </Box>
    </>
  )
}
