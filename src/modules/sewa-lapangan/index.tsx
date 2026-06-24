import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import {
  Box,
  Text,
  Button,
  Grid,
  Flex,
  VStack,
  HStack,
  Icon,
  Divider,
  Spinner,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
} from "@chakra-ui/react";
import Image from "next/image";
import { GiShuttlecock, GiBasketballBall, GiSoccerBall } from "react-icons/gi";
import { MdSportsTennis, MdSportsVolleyball, MdDirectionsRun } from "react-icons/md";
import { FaWhatsapp, FaHiking, FaPen } from "react-icons/fa";
import type { ElementType } from "react";
import FasorNavbar from "@/components/organisms/FasorNavbar";
import FasorFooter from "@/components/organisms/FasorFooter";


type SportKey = "bulutangkis" | "tenis" | "basket" | "futsal" | "sepakbola" | "voli" | "lari" | "panjattebing"

interface SportIconConfig {
  key: SportKey
  label: string
  image: string
  circleBg: string
  iconColor: string
  tagIcon: ElementType
}

const SPORT_ICONS: SportIconConfig[] = [
  { key: "bulutangkis", label: "Bulutangkis",  image: "/images/badminton.png",    circleBg: "#CFFAFE", iconColor: "#0891B2", tagIcon: GiShuttlecock },
  { key: "tenis",       label: "Tenis",        image: "/images/tennis.png",       circleBg: "#DCFCE7", iconColor: "#16A34A", tagIcon: MdSportsTennis },
  { key: "basket",      label: "Basket",       image: "/images/basket.png",       circleBg: "#FED7AA", iconColor: "#EA580C", tagIcon: GiBasketballBall },
  { key: "futsal",      label: "Futsal",       image: "/images/futsal.png",       circleBg: "#F8E3E3FF", iconColor: "#2563EB", tagIcon: GiSoccerBall },
  { key: "sepakbola",   label: "Sepak Bola",   image: "/images/sepak bola.png",   circleBg: "#DCFCE7", iconColor: "#15803D", tagIcon: GiSoccerBall },
  { key: "voli",        label: "Voli",         image: "/images/voli.png",         circleBg: "#FCE7F3", iconColor: "#BE185D", tagIcon: MdSportsVolleyball },
  { key: "lari",        label: "Lari/Atletik", image: "/images/lari.png",         circleBg: "#EDE9FE", iconColor: "#7C3AED", tagIcon: MdDirectionsRun },
  { key: "panjattebing",label: "Panjat Tebing",image: "/images/panjat tebing.png",circleBg: "#FEF08A", iconColor: "#CA8A04", tagIcon: FaHiking },
];

interface Venue {
  id: string
  name: string
  sport: SportKey
  image: string
  href?: string
}

const mapFacilityToSport = (name: string): SportKey => {
  const n = name.toLowerCase();
  if (n.includes("bulutangkis") || n.includes("badminton")) return "bulutangkis";
  if (n.includes("tennis") || n.includes("tenis")) return "tenis";
  if (n.includes("basket")) return "basket";
  if (n.includes("futsal")) return "futsal";
  if (n.includes("sepakbola") || n.includes("soccer") || n.includes("stadion")) return "sepakbola";
  if (n.includes("volly") || n.includes("voli")) return "voli";
  if (n.includes("lari") || n.includes("atletik")) return "lari";
  if (n.includes("panjat tebing")) return "panjattebing";
  return "sepakbola"; // default
};

const mapFacilityToImage = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("bulutangkis") || n.includes("badminton")) return "/images/gor badminton its.png";
  if (n.includes("tennis") || n.includes("tenis")) return "/images/lapangan tennis its.png";
  if (n.includes("basket semi indoor")) return "/images/lapangan basket semi indoor.png";
  if (n.includes("basket")) return "/images/lapangan basket flexy.png";
  if (n.includes("futsal indoor") || n.includes("gor futsal")) return "/images/gor futsal its.png";
  if (n.includes("futsal")) return "/images/lapangan futsal pln.png";
  if (n.includes("stadion")) return "/images/stadion its.png";
  if (n.includes("mini soccer")) return "/images/lapangan mini soccer.png";
  if (n.includes("volly") || n.includes("voli")) return "/images/lapangan voli its.png";
  return "/images/stadion its.png";
};

const STATIC_VENUES: Venue[] = [
  { id: "static-1", name: "GOR Futsal Indoor",           sport: "futsal",      image: "/images/gor futsal its.png",              href: "/gor-futsal" },
  { id: "static-2", name: "Lapangan Futsal Outdoor",     sport: "futsal",      image: "/images/lapangan futsal pln.png",         href: "/lapangan-futsal-pln" },
  { id: "static-3", name: "Lapangan Basket Semi Indoor", sport: "basket",      image: "/images/lapangan basket semi indoor.png", href: "/lapangan-basket-semi-indoor" },
  { id: "static-4", name: "Lapangan Basket Outdoor",     sport: "basket",      image: "/images/lapangan basket flexy.png",       href: "/lapangan-basket-flexy" },
  { id: "static-5", name: "GOR Badminton",               sport: "bulutangkis", image: "/images/gor badminton its.png",           href: "/gor-bulutangkis" },
  { id: "static-6", name: "Lapangan Tenis",              sport: "tenis",       image: "/images/lapangan tennis its.png",         href: "/lapangan-tenis" },
  { id: "static-7", name: "Stadion Sepak Bola",          sport: "sepakbola",   image: "/images/stadion its.png",                 href: "/stadion-its" },
  { id: "static-8", name: "Mini Soccer",                 sport: "sepakbola",   image: "/images/lapangan mini soccer.png",        href: "/lapangan-mini-soccer" },
  { id: "static-9", name: "Lapangan Voli Outdoor",       sport: "voli",        image: "/images/lapangan voli its.png",           href: "/lapangan-voli" },
];


const GridIconSemua = () => (
  <Grid templateColumns="repeat(2, 1fr)" gap="3px" w="28px" h="28px">
    {[0, 1, 2, 3].map(i => (
      <Box key={i} borderRadius="2px" bg="gray.400" />
    ))}
  </Grid>
);


const SportFilterSection = () => {
  const router = useRouter();
  const [selected, setSelected] = useState<SportKey | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWaModal, setShowWaModal] = useState(false);
  const [showFavoritModal, setShowFavoritModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favorites, setFavorites] = useState<SportKey[]>(SPORT_ICONS.map(s => s.key as SportKey));
  const [tempFavorites, setTempFavorites] = useState<SportKey[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://amu-fasor.local";
      try {
        const res = await axios.get(`${baseUrl}/auth/user`, {
          withCredentials: true,
          headers: { Accept: "application/json" },
        });
        if (res.data?.data) {
          setIsAuthenticated(true);
          const saved = localStorage.getItem("fasor_favorites");
          if (saved) {
            setFavorites(JSON.parse(saved));
          }
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();

    const fetchVenues = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://amu-fasor.local";
        const response = await axios.get(`${baseUrl}/fasilitas`);
        
        console.log("Venues API Response:", response.data);

        const rawData = response.data.data || response.data;
        if (Array.isArray(rawData)) {
          const mappedVenues = rawData.map((f: any) => ({
            id: f.id_fasilitas,
            name: f.nama,
            sport: mapFacilityToSport(f.nama),
            image: mapFacilityToImage(f.nama),
            href: (() => {
              const n = String(f.nama || "").toLowerCase()
              const id = f.id_fasilitas

              if (n.includes("bulutangkis")) return `/gor-bulutangkis?id=${id}`
              if (n.includes("mini soccer")) return `/lapangan-mini-soccer?id=${id}`
              if (n.includes("stadion") || n.includes("sepakbola") || n.includes("soccer")) return `/stadion-its?id=${id}`
              if (n.includes("gor futsal") || (n.includes("futsal") && n.includes("indoor"))) return `/gor-futsal?id=${id}`
              if (n.includes("futsal")) return `/lapangan-futsal-pln?id=${id}`
              if (n.includes("basket semi indoor")) return `/lapangan-basket-semi-indoor?id=${id}`
              if (n.includes("basket")) return `/lapangan-basket-flexy?id=${id}`
              if (n.includes("tennis") || n.includes("tenis")) return `/lapangan-tenis?id=${id}`
              if (n.includes("voli") || n.includes("volly")) return `/lapangan-voli?id=${id}`

              return `/gor-bulutangkis?id=${id}`
            })()
          }));
          setVenues(mappedVenues);
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') console.error("Failed to fetch venues:", error);
        setVenues(STATIC_VENUES);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const handleOpenFavoritModal = () => {
    setTempFavorites([...favorites]);
    setShowFavoritModal(true);
  };

  const handleSaveFavorit = () => {
    setFavorites(tempFavorites);
    localStorage.setItem("fasor_favorites", JSON.stringify(tempFavorites));
    setShowFavoritModal(false);
  };

  const displaySports = isAuthenticated ? SPORT_ICONS.filter(s => favorites.includes(s.key as SportKey)) : SPORT_ICONS;

  const filtered = selected
    ? venues.filter(v => v.sport === selected)
    : venues;

  const selectedConfig = selected
    ? SPORT_ICONS.find(s => s.key === selected) ?? null
    : null;

  if (loading) {
    return (
      <Center flex={1} py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="#008FFF" thickness="4px" />
          <Text color="gray.600">Memuat daftar lapangan...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <>
    <Box flex={1}>
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={8}>
      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="2xl"
        boxShadow="sm"
        px={6}
        py={6}
        mb={6}
      >
        <Text fontSize="xl" fontWeight="700" color="gray.800" mb={0.5}>
          Pilih Jenis Olahraga
        </Text>
        <Text fontSize="sm" color="gray.600" mb={5}>
          Klik kategori untuk melihat lapangan yang tersedia
        </Text>

      <Grid templateColumns={{ base: "repeat(3, 1fr)", sm: "repeat(4, 1fr)", md: "repeat(5, 1fr)" }} gap={1}>
        {displaySports.map(sport => {
          const isSelected = selected === sport.key;
          return (
            <Box
              key={sport.key}
              as="button"
              onClick={() => {
                if (sport.key === "lari" || sport.key === "panjattebing") { setShowWaModal(true); return; }
                setSelected(isSelected ? null : sport.key);
              }}
              textAlign="center"
              py={3}
              px={2}
              borderRadius="xl"
              bg={isSelected ? "gray.100" : "transparent"}
              _hover={{ bg: "gray.100" }}
              transition="all 0.15s"
              cursor="pointer"
              outline="none"
            >
              <Flex justify="center" mb={2}>
                <Box
                  w="72px"
                  h="72px"
                  borderRadius="full"
                  bg={sport.circleBg}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  position="relative"
                  overflow="hidden"
                  flexShrink={0}
                >
                  {sport.image ? (
                    <Image
                      src={sport.image}
                      alt={sport.label}
                      fill
                      style={{ objectFit: "contain", padding: "12px" }}
                    />
                  ) : (
                    <Icon as={sport.tagIcon} color={sport.iconColor} boxSize={5} />
                  )}
                </Box>
              </Flex>
              <Text
                fontSize="xs"
                fontWeight={isSelected ? "700" : "500"}
                color={isSelected ? "gray.800" : "gray.600"}
              >
                {sport.label}
              </Text>
            </Box>
          );
        })}

        <Box
          as="button"
          onClick={() => setSelected(null)}
          textAlign="center"
          py={3}
          px={2}
          borderRadius="xl"
          bg={selected === null ? "gray.100" : "transparent"}
          _hover={{ bg: "gray.100" }}
          transition="all 0.15s"
          cursor="pointer"
          outline="none"
        >
          <Flex justify="center" mb={2}>
            <Box
              w="72px"
              h="72px"
              borderRadius="full"
              bg="gray.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <GridIconSemua />
            </Box>
          </Flex>
          <Text fontSize="xs" fontWeight={selected === null ? "700" : "500"} color="gray.600">
            Tampilkan Semua
          </Text>
        </Box>

        {isAuthenticated && (
          <Box
            as="button"
            onClick={handleOpenFavoritModal}
            textAlign="center"
            py={3}
            px={2}
            borderRadius="xl"
            bg="transparent"
            _hover={{ bg: "gray.100" }}
            transition="all 0.15s"
            cursor="pointer"
            outline="none"
          >
            <Flex justify="center" mb={2}>
              <Box
                w="72px"
                h="72px"
                borderRadius="full"
                bg="gray.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Icon as={FaPen} color="gray.600" boxSize={6} />
              </Box>
            </Flex>
            <Text
              fontSize="xs"
              fontWeight="500"
              color="gray.600"
            >
              Edit Favorit
            </Text>
          </Box>
        )}
      </Grid>
      </Box>

      <Divider borderColor="gray.200" mb={4} />
      <Text fontSize="sm" color="gray.600" mb={5}>
        Menampilkan {filtered.length} lapangan tersedia
      </Text>

      <Grid
        templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
        gap={5}
      >
        {filtered.map((venue, i) => {
          const sportCfg = selectedConfig ?? SPORT_ICONS.find(s => s.key === venue.sport);
          return (
            <Box
              key={`${venue.name}-${i}`}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="xl"
              bg="white"
              boxShadow="sm"
              overflow="hidden"
              _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
              transition="all 0.15s"
            >
              <Box position="relative" h="150px" w="full">
                <Image
                  src={venue.image}
                  alt={venue.name}
                  fill
                  style={{ objectFit: "cover" }}
                  priority={i < 6}
                />
              </Box>

              <Box p={4}>
                <Text fontSize="sm" fontWeight="700" color="gray.800" mb={1.5}>
                  {venue.name}
                </Text>
                <HStack spacing={1.5} mb={4}>
                  {sportCfg && (
                    <Icon as={sportCfg.tagIcon} color={sportCfg.iconColor} boxSize={3.5} />
                  )}
                  <Text fontSize="xs" color="gray.600">
                    {sportCfg?.label ?? venue.sport}
                  </Text>
                </HStack>
                <Button
                  size="sm"
                  variant="outline"
                  color="#008FFF"
                  borderColor="#008FFF"
                  w="full"
                  borderRadius="full"
                  fontWeight="600"
                  fontSize="xs"
                  _hover={{ bg: "#008FFF", color: "white" }}
                  onClick={() => router.push(venue.href ?? "/sewa-lapangan")}
                >
                  Lihat Jadwal
                </Button>
              </Box>
            </Box>
          );
        })}
      </Grid>
    </Box>

    <Modal isOpen={showWaModal} onClose={() => setShowWaModal(false)} isCentered>
      <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(2px)" />
      <ModalContent borderRadius="xl" mx={4} maxW="380px">
        <ModalBody p={6}>
          <VStack spacing={5} textAlign="center">
            <Box w="56px" h="56px" borderRadius="full" bg="#25D366" display="flex" alignItems="center" justifyContent="center">
              <Icon as={FaWhatsapp} color="white" boxSize={7} />
            </Box>
            <Text fontSize="sm" color="gray.600" lineHeight="1.6">
              Untuk pemesanan lapangan/event ini hubungi nomor whatsapp admin fasor berikut
            </Text>
            <Button
              as="a"
              href="https://wa.me/6281139187999"
              target="_blank"
              rel="noopener noreferrer"
              bg="#25D366"
              color="white"
              borderRadius="full"
              fontWeight="600"
              leftIcon={<Icon as={FaWhatsapp} />}
              _hover={{ bg: "#1DB954" }}
              w="full"
            >
              0811-3918-7999
            </Button>
            <Button variant="ghost" size="sm" color="gray.600" onClick={() => setShowWaModal(false)}>
              Tutup
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>

    <Modal isOpen={showFavoritModal} onClose={() => setShowFavoritModal(false)} isCentered size="md">
      <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(2px)" />
      <ModalContent borderRadius="xl" mx={4}>
        <Box p={4} display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid" borderColor="gray.100">
          <Text fontSize="lg" fontWeight="700" color="gray.800">
            Edit Olahraga Favorit
          </Text>
          <Button size="sm" variant="ghost" onClick={() => setShowFavoritModal(false)}>
            ✕
          </Button>
        </Box>
        <ModalBody p={4} maxH="60vh" overflowY="auto">
          <VStack spacing={3} align="stretch">
            {SPORT_ICONS.map(sport => {
              const isSelected = tempFavorites.includes(sport.key as SportKey);
              return (
                <Flex
                  key={sport.key}
                  p={3}
                  borderRadius="lg"
                  border="2px solid"
                  borderColor={isSelected ? "#008FFF" : "gray.100"}
                  bg={isSelected ? "blue.50" : "gray.50"}
                  alignItems="center"
                  cursor="pointer"
                  onClick={() => {
                    if (isSelected) {
                      setTempFavorites(prev => prev.filter(k => k !== sport.key));
                    } else {
                      setTempFavorites(prev => [...prev, sport.key as SportKey]);
                    }
                  }}
                >
                  <Box
                    w="40px"
                    h="40px"
                    borderRadius="full"
                    bg={sport.circleBg}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mr={4}
                  >
                    {sport.image ? (
                      <Image src={sport.image} alt={sport.label} width={24} height={24} style={{ objectFit: "contain" }} />
                    ) : (
                      <Icon as={sport.tagIcon} color={sport.iconColor} boxSize={5} />
                    )}
                  </Box>
                  <Text fontSize="sm" fontWeight="600" color="gray.800">
                    {sport.label}
                  </Text>
                </Flex>
              );
            })}
          </VStack>
        </ModalBody>
        <Box p={4} borderTop="1px solid" borderColor="gray.100">
          <Button
            w="full"
            bg="#008FFF"
            color="white"
            _hover={{ bg: "#0070CC" }}
            borderRadius="lg"
            onClick={handleSaveFavorit}
          >
            Simpan
          </Button>
        </Box>
      </ModalContent>
    </Modal>
    </Box>
    <FasorFooter />
    </>
  );
};


const SewaLapanganPage = () => (
  <Box minH="100vh" bg="white" display="flex" flexDir="column">
    <FasorNavbar />
    <Box as="main" flex={1} display="flex" flexDir="column">
      <SportFilterSection />
    </Box>
  </Box>
);

export default SewaLapanganPage;
