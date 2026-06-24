import {
	Box,
	Flex,
	Text,
	Icon,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableContainer,
	Button,
	HStack,
	Input,
	InputGroup,
	InputLeftElement,
	FormControl,
	FormLabel,
	Textarea,
	Select,
	VStack,
	IconButton,
} from "@chakra-ui/react"
import {
	MdSearch,
	MdAdd,
	MdEdit,
	MdDelete,
	MdFormatListBulleted,
	MdFormatListNumbered,
	MdFormatIndentDecrease,
	MdFormatIndentIncrease,
	MdInsertLink,
	MdImage,
} from "react-icons/md"
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa"
import { useState, useEffect, useMemo } from "react"
import AdminLayout from "./AdminLayout"
import { useAnnouncements, CATEGORY_COLORS, type Announcement, type AnnouncementCategory } from "@/data/pengumuman"

const Article = () => {
	const [data, setData] = useState<Announcement[]>([])
	const [search, setSearch] = useState("")
	const [mode, setMode] = useState<"list" | "form">("list")
	const [formData, setFormData] = useState<any>({ 
		id: 0, 
		title: "", 
		category: "Peraturan", 
		konten: "" 
	})

	const [tagFilter, setTagFilter] = useState("all")
	const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)

	const initialData = useAnnouncements()

	useEffect(() => {
		setData(initialData)
	}, [])

	const handleSort = (key: string) => {
		let direction: 'asc' | 'desc' = 'asc'
		if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
			direction = 'desc'
		}
		setSortConfig({ key, direction })
	}

	const filteredAndSortedData = useMemo(() => {
		let result = data.filter((item) =>
			(item.title.toLowerCase().includes(search.toLowerCase()) || 
			item.category.toLowerCase().includes(search.toLowerCase())) &&
			(tagFilter === "all" || item.category === tagFilter)
		)

		if (sortConfig !== null) {
			result.sort((a: any, b: any) => {
				const aValue = a[sortConfig.key]
				const bValue = b[sortConfig.key]
				
				if (aValue === undefined || aValue === null) return 1
				if (bValue === undefined || bValue === null) return -1
				
				if (typeof aValue === 'number' && typeof bValue === 'number') {
					return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
				}
				
				const aStr = String(aValue).toLowerCase()
				const bStr = String(bValue).toLowerCase()
				
				if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1
				if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1
				return 0
			})
		}

		return result
	}, [data, search, tagFilter, sortConfig])

	const SortIcon = ({ columnKey }: { columnKey: string }) => {
		if (sortConfig?.key === columnKey) {
			return sortConfig.direction === 'asc' ? <Icon as={FaSortUp} ml={1} /> : <Icon as={FaSortDown} ml={1} />
		}
		return <Icon as={FaSort} ml={1} color="gray.300" />
	}

	const handleOpenForm = (item?: Announcement) => {
		if (item) {
			// Convert content blocks to raw string for simple textarea editing
			const rawContent = item.content.map(c => {
				if (c.type === "paragraph") return c.text
				if (c.type === "heading") return "## " + c.text
				if (c.type === "list") return c.items.map(i => "- " + i).join("\n")
				if (c.type === "info") return c.lines.join("\n")
				return ""
			}).join("\n\n")

			setFormData({ 
				id: item.id, 
				title: item.title, 
				category: item.category, 
				konten: rawContent 
			})
		} else {
			setFormData({ id: 0, title: "", category: "Peraturan", konten: "" })
		}
		setMode("form")
	}

	const handleSubmit = () => {
		if (formData.title) {
			const rawLines = formData.konten.split("\n\n")
			const newContentBlocks = rawLines.map((block: string) => {
				if (block.startsWith("## ")) return { type: "heading", text: block.replace("## ", "") }
				if (block.startsWith("- ")) return { type: "list", items: block.split("\n").map(l => l.replace("- ", "")) }
				return { type: "paragraph", text: block }
			})

			let newData = [...data]

			if (formData.id === 0) {
				const newItem: Announcement = {
					id: Date.now(),
					title: formData.title,
					category: formData.category as AnnouncementCategory,
					date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
					preview: formData.konten.substring(0, 100) + "...",
					content: newContentBlocks as any
				}
				newData = [newItem, ...newData]
			} else {
				newData = newData.map(d => d.id === formData.id ? { 
					...d, 
					title: formData.title, 
					category: formData.category as AnnouncementCategory, 
					preview: formData.konten.substring(0, 100) + "...",
					content: newContentBlocks as any 
				} : d)
			}
			
			setData(newData)
			localStorage.setItem("fasor_announcements", JSON.stringify(newData))
			setMode("list")
		}
	}

	const handleDelete = (id: number) => {
		const newData = data.filter((item) => item.id !== id)
		setData(newData)
		localStorage.setItem("fasor_announcements", JSON.stringify(newData))
	}

	if (mode === "form") {
		return (
			<AdminLayout>
				<Box bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100" p={8} minH="calc(100vh - 120px)">
					<Flex justify="space-between" align="center" mb={8}>
						<Text fontSize="lg" fontWeight="700" color="gray.800" textTransform="uppercase">
							BUAT DATA ARTIKEL
						</Text>
						<HStack>
							<Button size="sm" variant="ghost" onClick={() => setMode("list")}>Batal</Button>
							<Button size="sm" bg="blue.500" color="white" _hover={{ bg: "blue.600" }} onClick={handleSubmit}>Simpan</Button>
						</HStack>
					</Flex>

					<VStack spacing={6} align="stretch">
						<FormControl>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Judul Artikel</FormLabel>
							<Input 
								size="md" 
								borderRadius="md" 
								value={formData.title}
								onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							/>
						</FormControl>

						<FormControl>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Tag</FormLabel>
							<Select 
								size="md" 
								borderRadius="md"
								value={formData.category}
								onChange={(e) => setFormData({ ...formData, category: e.target.value })}
							>
								<option value="Peraturan">Peraturan</option>
								<option value="Pemeliharaan">Pemeliharaan</option>
								<option value="Info Harga">Info Harga</option>
								<option value="Promo">Promo</option>
							</Select>
						</FormControl>

						<FormControl>
							<FormLabel fontSize="sm" fontWeight="600" color="gray.700">Isi</FormLabel>
							<Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
								{/* Toolbar */}
								<Flex bg="white" borderBottom="1px solid" borderColor="gray.200" px={4} py={2} align="center" flexWrap="wrap" gap={2}>
									<HStack spacing={1}>
										<Button size="sm" variant="ghost" fontSize="13px" fontWeight="500" color="gray.700">
											<Text as="span" mr={1} fontWeight="700">A</Text> Normal text ▼
										</Button>
									</HStack>
									<HStack spacing={1} ml={2}>
										<Button size="sm" variant="ghost" fontWeight="700">Bold</Button>
										<Button size="sm" variant="ghost" fontStyle="italic">Italic</Button>
										<Button size="sm" variant="ghost" textDecoration="underline">Underline</Button>
									</HStack>
									<HStack spacing={1} ml={4} color="gray.600">
										<IconButton aria-label="Bulleted list" icon={<Icon as={MdFormatListBulleted} boxSize={5} />} size="sm" variant="ghost" />
										<IconButton aria-label="Numbered list" icon={<Icon as={MdFormatListNumbered} boxSize={5} />} size="sm" variant="ghost" />
										<IconButton aria-label="Decrease indent" icon={<Icon as={MdFormatIndentDecrease} boxSize={5} />} size="sm" variant="ghost" />
										<IconButton aria-label="Increase indent" icon={<Icon as={MdFormatIndentIncrease} boxSize={5} />} size="sm" variant="ghost" />
									</HStack>
									<HStack spacing={1} ml={4} color="gray.600">
										<IconButton aria-label="Insert link" icon={<Icon as={MdInsertLink} boxSize={5} />} size="sm" variant="ghost" />
										<IconButton aria-label="Insert image" icon={<Icon as={MdImage} boxSize={5} />} size="sm" variant="ghost" />
									</HStack>
								</Flex>
								{/* Editor Area */}
								<Textarea
									variant="unstyled"
									p={4}
									minH="400px"
									borderRadius="none"
									placeholder="Tulis artikel di sini..."
									value={formData.konten}
									onChange={(e) => setFormData({ ...formData, konten: e.target.value })}
								/>
							</Box>
						</FormControl>
					</VStack>
				</Box>
			</AdminLayout>
		)
	}

	return (
		<AdminLayout>
			<Flex align="center" justify="space-between" mb={6}>
				<Box>
					<Text fontSize="2xl" fontWeight="800" color="gray.800" letterSpacing="-0.5px">
						Pengumuman & Artikel
					</Text>
					<Text fontSize="sm" color="gray.500" mt={0.5}>
						Kelola informasi, berita, dan pengumuman untuk ditampilkan ke user
					</Text>
				</Box>
				<Button
					size="sm"
					bg="blue.500"
					color="white"
					leftIcon={<Icon as={MdAdd} />}
					borderRadius="lg"
					_hover={{ bg: "blue.600" }}
					onClick={() => handleOpenForm()}
				>
					Tulis Pengumuman Baru
				</Button>
			</Flex>

			<Box bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
				<Flex
					align="center"
					justify="space-between"
					px={6}
					py={4}
					borderBottom="1px solid"
					borderColor="gray.100"
					bg="white"
				>
					<HStack spacing={3}>
						<InputGroup size="sm" w="300px">
							<InputLeftElement pointerEvents="none">
								<Icon as={MdSearch} color="gray.400" />
							</InputLeftElement>
							<Input
								placeholder="Cari judul atau tag..."
								borderRadius="lg"
								bg="gray.50"
								border="1px solid"
								borderColor="gray.200"
								_focus={{ borderColor: "blue.400", bg: "white" }}
								value={search}
								onChange={(e: any) => setSearch(e.target.value)}
							/>
						</InputGroup>
						<Select 
							size="sm" 
							borderRadius="lg" 
							w="150px" 
							value={tagFilter} 
							onChange={(e) => setTagFilter(e.target.value)} 
							bg="gray.50"
						>
							<option value="all">Semua Tag</option>
							<option value="Peraturan">Peraturan</option>
							<option value="Pemeliharaan">Pemeliharaan</option>
							<option value="Info Harga">Info Harga</option>
							<option value="Promo">Promo</option>
						</Select>
					</HStack>
				</Flex>

				<Box p={4}>
					<TableContainer>
						<Table size="sm" variant="simple">
							<Thead>
								<Tr>
									<Th color="gray.500" fontSize="xs" py={3}>No</Th>
									<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('title')}>
										<Flex align="center">Judul Artikel <SortIcon columnKey="title" /></Flex>
									</Th>
									<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('category')}>
										<Flex align="center">Tag <SortIcon columnKey="category" /></Flex>
									</Th>
									<Th color="gray.500" fontSize="xs" cursor="pointer" onClick={() => handleSort('date')}>
										<Flex align="center">Tanggal <SortIcon columnKey="date" /></Flex>
									</Th>
									<Th color="gray.500" fontSize="xs" textAlign="center">Aksi</Th>
								</Tr>
							</Thead>
							<Tbody>
								{filteredAndSortedData.map((row: Announcement, i: number) => {
									const colors = CATEGORY_COLORS[row.category] || CATEGORY_COLORS["Peraturan"]
									return (
										<Tr key={row.id} _hover={{ bg: "gray.50" }}>
											<Td color="gray.500" fontSize="sm">{i + 1}</Td>
											<Td fontSize="sm" fontWeight="600" color="gray.800" maxW="300px" isTruncated>{row.title}</Td>
											<Td>
												<Box
													display="inline-flex"
													alignItems="center"
													px={2.5}
													py={0.5}
													borderRadius="full"
													bg={colors.bg}
													color={colors.color}
													fontSize="xs"
													fontWeight="600"
												>
													{row.category}
												</Box>
											</Td>
											<Td fontSize="sm" color="gray.700">{row.date}</Td>
											<Td textAlign="center">
												<HStack spacing={2} justify="center">
													<Button size="xs" variant="ghost" colorScheme="blue" onClick={() => handleOpenForm(row)}>
														<Icon as={MdEdit} boxSize={4} />
													</Button>
													<Button size="xs" variant="ghost" colorScheme="red" onClick={() => handleDelete(row.id)}>
														<Icon as={MdDelete} boxSize={4} />
													</Button>
												</HStack>
											</Td>
										</Tr>
									)
								})}
								{filteredAndSortedData.length === 0 && (
									<Tr>
										<Td colSpan={5} textAlign="center" py={6} color="gray.500">
											Data tidak ditemukan.
										</Td>
									</Tr>
								)}
							</Tbody>
						</Table>
					</TableContainer>
				</Box>
			</Box>
		</AdminLayout>
	)
}

export default Article
