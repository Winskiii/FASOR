import {
	Box,
	Flex,
	Text,
	Icon,
	VStack,
	HStack,
	Avatar,
	Collapse,
	useDisclosure,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	MenuDivider,
	Spinner,
	Center,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import useSWRImmutable from 'swr/immutable'
import { useAuth } from '@/services/useAuth'
import { useSignOutAction } from "@/utils/auth/SignOutAction"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import {
	MdDashboard,
	MdEventNote,
	MdStorage,
	MdSettings,
	MdBarChart,
	MdApps,
	MdMenuOpen,
	MdMenu,
	MdKeyboardArrowDown,
} from "react-icons/md"
import { FaUserShield, FaSignOutAlt } from "react-icons/fa"
import { UserOutlineIconMade, LogoutOutlineIconMade } from "@/components/atoms/IconsMade"
import type { ReactNode } from "react"

interface NavChild {
	label: string
	href: string
}
interface NavItem {
	label: string
	icon: React.ElementType
	href?: string
	children?: NavChild[]
}

const NAV_ITEMS: NavItem[] = [
	{
		label: "Dashboard",
		icon: MdDashboard,
		href: "/admin",
	},
	{
		label: "Reservasi",
		icon: MdEventNote,
		children: [
			{ label: "Semua Reservasi", href: "/admin/reservasi" },
			{ label: "Detail Verifikasi", href: "/admin/reservasi/detail-verifikasi" },
			{ label: "Permintaan Reschedule", href: "/admin/reservasi/reschedule" },
		],
	},
	{
		label: "Data",
		icon: MdStorage,
		children: [
			{ label: "Harga Sewa", href: "/admin/data/harga" },
			{ label: "Jenis Olahraga", href: "/admin/data/jenis-olahraga" },
			{ label: "Fasilitas", href: "/admin/data/fasilitas" },
			{ label: "Sesi", href: "/admin/data/sesi" },
			{ label: "Penggunaan Harian", href: "/admin/data/penggunaan-harian" },
		],
	},
	{
		label: "Pengaturan",
		icon: MdSettings,
		children: [
			{ label: "Cara Pemesanan", href: "/admin/pengaturan/cara-pemesanan" },
			{ label: "Tata Tertib", href: "/admin/pengaturan/tata-tertib" },
			{ label: "TTD Kepala Fasor", href: "/admin/pengaturan/ttd-kepala" },
			{ label: "TTD Admin", href: "/admin/pengaturan/ttd-admin" },
		],
	},
	{
		label: "Konten",
		icon: MdApps,
		children: [
			{ label: "Slide Show", href: "/admin/konten/slideshow" },
			{ label: "Article", href: "/admin/konten/article" },
		],
	},
	{
		label: "Laporan",
		icon: MdBarChart,
		children: [
			{ label: "Laporan Keuangan", href: "/admin/laporan/keuangan" },
			{ label: "Laporan Pengguna", href: "/admin/laporan/pengguna" },
		],
	},
]

const SidebarItem = ({
	item,
	collapsed,
}: {
	item: NavItem
	collapsed: boolean
}) => {
	const router = useRouter()
	const { isOpen, onToggle } = useDisclosure()

	const isActive = item.href
		? router.pathname === item.href
		: item.children?.some((c) => router.pathname.startsWith(c.href)) ?? false

	if (item.children) {
		return (
			<Box w="full">
				<Flex
					align="center"
					justify="space-between"
					px={3}
					py={2.5}
					borderRadius="lg"
					cursor="pointer"
					bg={isActive ? "whiteAlpha.200" : "transparent"}
					color={isActive ? "white" : "whiteAlpha.700"}
					_hover={{ bg: "whiteAlpha.200", color: "white" }}
					transition="all 0.15s"
					onClick={onToggle}
				>
					<HStack spacing={3}>
						<Icon as={item.icon} boxSize={5} />
						{!collapsed && (
							<Text fontSize="sm" fontWeight={isActive ? "600" : "500"}>
								{item.label}
							</Text>
						)}
					</HStack>
					{!collapsed && (
						<Icon
							as={MdKeyboardArrowDown}
							boxSize={4}
							transition="transform 0.2s"
							transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
						/>
					)}
				</Flex>
				{!collapsed && (
					<Collapse in={isOpen || isActive} animateOpacity>
						<VStack spacing={0.5} pl={8} mt={1} align="stretch">
							{item.children.map((child) => {
								const childActive = router.pathname === child.href
								return (
									<NextLink key={child.href} href={child.href} passHref legacyBehavior>
										<Text
											as="a"
											fontSize="sm"
											fontWeight={childActive ? "600" : "400"}
											color={childActive ? "white" : "whiteAlpha.600"}
											py={2}
											px={3}
											borderRadius="md"
											bg={childActive ? "whiteAlpha.200" : "transparent"}
											_hover={{ color: "white", bg: "whiteAlpha.100", textDecoration: "none" }}
											transition="all 0.15s"
										>
											{child.label}
										</Text>
									</NextLink>
								)
							})}
						</VStack>
					</Collapse>
				)}
			</Box>
		)
	}

	return (
		<NextLink href={item.href!} passHref legacyBehavior>
			<Flex
				as="a"
				align="center"
				px={3}
				py={2.5}
				borderRadius="lg"
				cursor="pointer"
				bg={isActive ? "whiteAlpha.300" : "transparent"}
				color={isActive ? "white" : "whiteAlpha.700"}
				_hover={{ bg: "whiteAlpha.200", color: "white", textDecoration: "none" }}
				transition="all 0.15s"
			>
				<HStack spacing={3}>
					<Icon as={item.icon} boxSize={5} />
					{!collapsed && (
						<Text fontSize="sm" fontWeight={isActive ? "700" : "500"}>
							{item.label}
						</Text>
					)}
				</HStack>
			</Flex>
		</NextLink>
	)
}

const AdminLayout = ({ children }: { children: ReactNode }) => {
	const [collapsed, setCollapsed] = useState(false)
	const router = useRouter()
	const { signOut } = useSignOutAction()
	const sidebarW = collapsed ? "72px" : "240px"

	// Auth guard: redirect non-authenticated users to login
	const { isAuthorized, isLoading: authGuardLoading } = useAuthGuard({
		redirectTo: "/login",
		enabled: false, // Bypass auth for now
	})

	const { data: auth } = useSWRImmutable('auth', useAuth, {
		refreshInterval: 60000,
		revalidateIfStale: false,
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
	})

	const [cachedAuth, setCachedAuth] = useState<any>(null)

	useEffect(() => {
		try {
			const saved = localStorage.getItem("fasor_auth_cache")
			if (saved) setCachedAuth(JSON.parse(saved))
		} catch (e) {}
	}, [])

	useEffect(() => {
		if (auth?.status === "authenticated") {
			localStorage.setItem("fasor_auth_cache", JSON.stringify(auth))
			setCachedAuth(auth)
		} else if (auth?.status === "unauthenticated") {
			localStorage.removeItem("fasor_auth_cache")
			setCachedAuth(null)
		}
	}, [auth])

	const displayAuth = auth?.status === "authenticated" ? auth : (cachedAuth || auth)

	const handleLogout = async () => {
		setCachedAuth(null)

		// Determine user type from auth data (real or cached)
		const userType = displayAuth?.user_type as "internal" | "external" | undefined

		// Always call signOut — it handles clearing all frontend state
		// and calling the correct backend logout endpoint
		await signOut(userType)
	}

	// Show loading spinner while auth is being validated
	// Temporarily bypassed so it doesn't block rendering
	if (authGuardLoading && false) {
		return (
			<Center minH="100vh" bg="gray.50">
				<VStack spacing={4}>
					<Spinner size="lg" color="blue.500" thickness="3px" />
					<Text fontSize="sm" color="gray.500">Memverifikasi akses...</Text>
				</VStack>
			</Center>
		)
	}

	return (
		<Flex minH="100vh" bg="gray.50">
			<Box
				w={sidebarW}
				minH="100vh"
				bg="linear-gradient(180deg, #003A66 0%, #005799 60%, #0074CC 100%)"
				transition="width 0.25s"
				flexShrink={0}
				display="flex"
				flexDirection="column"
				overflow="hidden"
				position="sticky"
				top={0}
				h="100vh"
				zIndex={50}
			>
				<Flex
					align="center"
					justify={collapsed ? "center" : "space-between"}
					px={collapsed ? 0 : 4}
					py={4}
					borderBottom="1px solid"
					borderColor="whiteAlpha.200"
					h="64px"
					flexShrink={0}
				>
					{!collapsed && (
						<Text
							fontSize="lg"
							fontWeight="800"
							color="white"
							letterSpacing="-0.5px"
						>
							Fasor{" "}
							<Text as="span" color="#33A7FF">
								Admin
							</Text>
						</Text>
					)}
					<Box
						as="button"
						onClick={() => setCollapsed(!collapsed)}
						p={1.5}
						borderRadius="md"
						color="whiteAlpha.700"
						_hover={{ color: "white", bg: "whiteAlpha.200" }}
						transition="all 0.15s"
						ml={collapsed ? "auto" : 0}
						mr={collapsed ? "auto" : 0}
					>
						<Icon as={collapsed ? MdMenu : MdMenuOpen} boxSize={5} />
					</Box>
				</Flex>

				<VStack spacing={1} px={collapsed ? 2 : 3} py={4} flex={1} align="stretch" overflowY="auto">
					{NAV_ITEMS.map((item: any) => (
						<SidebarItem key={item.label} item={item} collapsed={collapsed} />
					))}
				</VStack>

				<Box
					px={collapsed ? 2 : 3}
					py={4}
					borderTop="1px solid"
					borderColor="whiteAlpha.200"
				>
					<Flex
						align="center"
						gap={3}
						px={3}
						py={2.5}
						borderRadius="lg"
						cursor="pointer"
						color="whiteAlpha.700"
						_hover={{ bg: "whiteAlpha.200", color: "white" }}
						transition="all 0.15s"
						onClick={handleLogout}
						justify={collapsed ? "center" : "flex-start"}
					>
						<Icon as={FaSignOutAlt} boxSize={4} />
						{!collapsed && (
							<Text fontSize="sm" fontWeight="500">
								Keluar
							</Text>
						)}
					</Flex>
				</Box>
			</Box>

			<Box flex={1} display="flex" flexDirection="column" minH="100vh" overflow="auto">
				<Flex
					as="header"
					bg="white"
					h="64px"
					align="center"
					px={6}
					justify="space-between"
					boxShadow="sm"
					flexShrink={0}
					position="sticky"
					top={0}
					zIndex={40}
				>
					<Text fontSize="sm" color="gray.500">
						Panel Admin — Fasilitas Olahraga ITS
					</Text>
					<Menu>
						<MenuButton aria-label="Profile menu">
							<HStack spacing={3} cursor="pointer" _hover={{ opacity: 0.85 }}>
								<Avatar
									size="sm"
									bg="#008FFF"
									src={displayAuth?.picture || "/images/app/profile-default.jpg"}
									name={displayAuth?.name || "Admin"}
									icon={!displayAuth?.picture ? <Icon as={FaUserShield} color="white" boxSize={3.5} /> : undefined}
								/>
								<Box textAlign="left">
									<Text fontSize="sm" fontWeight="600" color="gray.800" lineHeight={1.2}>
										{displayAuth?.name || "Admin"}
									</Text>
									<Text fontSize="xs" color="gray.500">
										{displayAuth?.preferred_username || displayAuth?.email || "admin@its.ac.id"}
									</Text>
								</Box>
							</HStack>
						</MenuButton>
						<MenuList minW="180px" shadow="md" borderColor="gray.200" borderRadius="xl" py={2}>
							<Box px={3} py={2} mb={1} borderBottom="1px solid" borderColor="gray.100">
								<Text fontSize="sm" fontWeight="700" color="gray.800" noOfLines={1}>
									{displayAuth?.name || "Admin"}
								</Text>
								<Text fontSize="xs" color="gray.500" noOfLines={1}>
									{displayAuth?.preferred_username || displayAuth?.email || "admin@its.ac.id"}
								</Text>
							</Box>
							<MenuItem
								icon={<Icon as={UserOutlineIconMade} color="#008FFF" boxSize={4} />}
								fontSize="sm"
								fontWeight="500"
								onClick={() => router.push("/profil")}
							>
								Profil Saya
							</MenuItem>
							<MenuDivider />
							<MenuItem
								icon={<Icon as={LogoutOutlineIconMade} color="red.400" boxSize={4} />}
								fontSize="sm"
								fontWeight="500"
								color="red.500"
								onClick={handleLogout}
							>
								Keluar
							</MenuItem>
						</MenuList>
					</Menu>
				</Flex>

				<Box flex={1} p={6}>
					{children}
				</Box>
			</Box>
		</Flex>
	)
}

export default AdminLayout