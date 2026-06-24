import { useRouter } from "next/router"
import Image from "next/image"
import {
	Box,
	Flex,
	HStack,
	VStack,
	Text,
	Icon,
	Divider,
	UnorderedList,
	ListItem,
} from "@chakra-ui/react"
import { FaCalendarAlt, FaChevronLeft } from "react-icons/fa"
import FasorNavbar from "@/components/organisms/FasorNavbar"
import FasorFooter from "@/components/organisms/FasorFooter"
import {
	CATEGORY_COLORS,
	type Announcement,
	type AnnouncementContent,
} from "@/data/pengumuman"


const CategoryBadge = ({ category }: { category: Announcement["category"] }) => {
	const colors = CATEGORY_COLORS[category]
	return (
		<Box
			as="span"
			px={3}
			py={1}
			bg={colors.bg}
			color={colors.color}
			border="1px solid"
			borderColor={colors.border}
			borderRadius="full"
			fontSize="xs"
			fontWeight="600"
		>
			{category}
		</Box>
	)
}


const ContentBlock = ({ block }: { block: AnnouncementContent }) => {
	if (block.type === "paragraph") {
		return (
			<Text fontSize="sm" color="gray.700" lineHeight="1.8">
				{block.text}
			</Text>
		)
	}
	if (block.type === "heading") {
		return (
			<Text fontSize="sm" fontWeight="700" color="gray.800" mt={2}>
				{block.text}
			</Text>
		)
	}
	if (block.type === "list") {
		return (
			<UnorderedList pl={4} spacing={1}>
				{block.items.map((item, i) => (
					<ListItem key={i} fontSize="sm" color="gray.700" lineHeight="1.8">
						{item}
					</ListItem>
				))}
			</UnorderedList>
		)
	}
	if (block.type === "info") {
		return (
			<VStack align="start" spacing={0.5} mt={1}>
				{block.lines.map((line, i) => (
					<Text key={i} fontSize="sm" color="gray.700">
						{line}
					</Text>
				))}
			</VStack>
		)
	}
	return null
}


interface Props {
	announcement: Announcement
}

export default function PengumumanDetailPage({ announcement }: Props) {
	const router = useRouter()

	return (
		<Box minH="100vh" bg="white" display="flex" flexDirection="column">
			<FasorNavbar />

			<Box flex={1} maxW="900px" mx="auto" w="full" px={{ base: 4, md: 8 }} py={10}>
				<HStack
					spacing={1.5}
					color="#008FFF"
					fontWeight="600"
					fontSize="sm"
					cursor="pointer"
					mb={6}
					width="fit-content"
					_hover={{ opacity: 0.8 }}
					onClick={() => router.push("/pengumuman")}
				>
					<Icon as={FaChevronLeft} boxSize={3} />
					<Text>Kembali ke Pengumuman</Text>
				</HStack>

				{announcement.image && (
					<Box
						position="relative"
						w="full"
						h={{ base: "200px", md: "380px" }}
						borderRadius="2xl"
						overflow="hidden"
						mb={6}
					>
						<Image
							src={announcement.image}
							alt={announcement.title}
							fill
							style={{ objectFit: "cover" }}
						/>
					</Box>
				)}

				<Box mb={3}>
					<CategoryBadge category={announcement.category} />
				</Box>

				<Text
					fontSize={{ base: "xl", md: "3xl" }}
					fontWeight="800"
					color="gray.800"
					lineHeight="1.3"
					mb={3}
				>
					{announcement.title}
				</Text>

				<HStack spacing={1.5} color="gray.400" mb={5}>
					<Icon as={FaCalendarAlt} boxSize={3.5} />
					<Text fontSize="sm">{announcement.date}</Text>
				</HStack>

				<Divider borderColor="gray.200" mb={6} />

				<VStack align="start" spacing={4}>
					{announcement.content.map((block, i) => (
						<ContentBlock key={i} block={block} />
					))}
				</VStack>
			</Box>

			<FasorFooter />
		</Box>
	)
}
