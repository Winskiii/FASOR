import { useRouter } from "next/router"
import {
	Box,
	Flex,
	VStack,
	HStack,
	Text,
	Icon,
} from "@chakra-ui/react"
import { FaBullhorn, FaCalendarAlt, FaArrowRight } from "react-icons/fa"
import FasorNavbar from "@/components/organisms/FasorNavbar"
import FasorFooter from "@/components/organisms/FasorFooter"
import { useAnnouncements, CATEGORY_COLORS, type Announcement } from "@/data/pengumuman"


const CategoryBadge = ({ category }: { category: Announcement["category"] }) => {
	const colors = CATEGORY_COLORS[category]
	return (
		<Box
			as="span"
			px={3}
			py={0.5}
			bg={colors.bg}
			color={colors.color}
			border="1px solid"
			borderColor={colors.border}
			borderRadius="full"
			fontSize="xs"
			fontWeight="600"
			whiteSpace="nowrap"
		>
			{category}
		</Box>
	)
}


const AnnouncementCard = ({ item }: { item: Announcement }) => {
	const router = useRouter()

	return (
		<Box
			bg="white"
			border="1px solid"
			borderColor="gray.200"
			borderRadius="xl"
			px={6}
			py={5}
			cursor="pointer"
			transition="box-shadow 0.15s, border-color 0.15s"
			_hover={{ boxShadow: "md", borderColor: "blue.200" }}
			onClick={() => router.push(`/pengumuman/${item.id}`)}
		>
			<Flex justify="space-between" align="flex-start" gap={4}>
				<HStack align="flex-start" spacing={4} flex={1} minW={0}>
					<Flex
						flexShrink={0}
						w="38px"
						h="38px"
						borderRadius="full"
						bg="blue.50"
						align="center"
						justify="center"
						mt={0.5}
					>
						<Icon as={FaBullhorn} color="#008FFF" boxSize={4} />
					</Flex>
					<VStack align="start" spacing={1} flex={1} minW={0}>
						<Text fontWeight="700" fontSize="sm" color="gray.800" lineHeight="1.4">
							{item.title}
						</Text>
						<Text fontSize="sm" color="gray.500" noOfLines={2} lineHeight="1.5">
							{item.preview}
						</Text>
					</VStack>
				</HStack>

				<Box flexShrink={0} mt={0.5}>
					<CategoryBadge category={item.category} />
				</Box>
			</Flex>

			<Flex justify="space-between" align="center" mt={4} ml="54px">
				<HStack spacing={1.5} color="gray.400">
					<Icon as={FaCalendarAlt} boxSize={3} />
					<Text fontSize="xs">{item.date}</Text>
				</HStack>
				<HStack
					spacing={1}
					color="#008FFF"
					fontWeight="600"
					fontSize="sm"
					_hover={{ textDecoration: "underline" }}
				>
					<Text>Baca Selengkapnya</Text>
					<Icon as={FaArrowRight} boxSize={3} />
				</HStack>
			</Flex>
		</Box>
	)
}


export default function PengumumanListPage() {
	const announcements = useAnnouncements()
	return (
		<Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
			<FasorNavbar />

			<Box flex={1} maxW="860px" mx="auto" w="full" px={{ base: 4, md: 8 }} py={10}>
				<Text fontSize="2xl" fontWeight="800" color="gray.800" mb={0.5}>
					Pengumuman
				</Text>
				<Text fontSize="sm" color="gray.500" mb={6}>
					Informasi terbaru seputar fasilitas dan layanan Fasor ITS
				</Text>

				<VStack spacing={3} align="stretch">
					{announcements.map((item: any) => (
						<AnnouncementCard key={item.id} item={item} />
					))}
				</VStack>
			</Box>

			<FasorFooter />
		</Box>
	)
}
