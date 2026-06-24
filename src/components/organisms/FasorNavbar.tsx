import { Box, Flex, Text, Button, HStack, Icon, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Avatar, useToast, IconButton } from "@chakra-ui/react"
import Image from "next/image"
import NextLink from "next/link"
import { useRouter } from "next/router"
import { useSignInAction } from "@/utils/auth/SignInAction"
import { useSignOutAction } from "@/utils/auth/SignOutAction"
import { useCallback, useEffect, useState } from "react"
import { useIdleTimeout } from "@/hooks/useIdleTimeout"
import useSWRImmutable from 'swr/immutable'
import { useAuth } from '@/services/useAuth'

import { ListOutlineIconMade, UserOutlineIconMade, LogoutOutlineIconMade } from "@/components/atoms/IconsMade"

const NAV_LINKS = [
	{ label: "Beranda", href: "/" },
	{ label: "Sewa Lapangan", href: "/sewa-lapangan" },
	{ label: "Cek Pemesanan", href: "/cek-pemesanan" },
	{ label: "Riwayat Pemesanan", href: "/riwayat-pemesanan" },
	{ label: "Pengumuman", href: "/pengumuman" },
]

const FasorNavbar = () => {
	const { signIn } = useSignInAction()
	const { signOut } = useSignOutAction()
	const router = useRouter()
	const toast = useToast()
	const { pathname } = router
	const [isLoggedIn, setIsLoggedIn] = useState(false)

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

	const handleIdleWarning = useCallback(() => {
		toast({
			title: "Sesi hampir berakhir",
			description: "Anda akan otomatis keluar dalam 2 menit karena tidak aktif.",
			status: "warning",
			duration: 10000,
			isClosable: true,
			position: "top",
		})
	}, [toast])

	useIdleTimeout(isLoggedIn, 25, 2, handleIdleWarning)

	useEffect(() => {
		const sessionLogged = sessionStorage.getItem("fasor_logged_in") === "true"
		const authLogged = auth?.status === "authenticated"
		setIsLoggedIn(sessionLogged || authLogged)
		if (authLogged && !sessionLogged) {
			sessionStorage.setItem("fasor_logged_in", "true")
		}
	}, [pathname, auth?.status])

	const handleLogout = async () => {
		setIsLoggedIn(false)
		setCachedAuth(null)

		// Determine user type from auth data (real or cached)
		const userType = displayAuth?.user_type as "internal" | "external" | undefined

		// Always call signOut — it handles clearing all frontend state
		// and calling the correct backend logout endpoint
		await signOut(userType)
	}

	const isActive = (href: string) =>
		href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/")

	return (
		<Box
			as="nav"
			bg="rgba(255, 255, 255, 0.85)"
			backdropFilter="blur(8px)"
			boxShadow="sm"
			position="sticky"
			top={0}
			zIndex={100}
		>
			<Flex
				w="full"
				mx="auto"
				h="64px"
				alignItems="center"
				justifyContent="space-between"
				px={{ base: 4, md: 8 }}
				gap={8}
			>
				<HStack spacing={4}>
					<Box display={{ base: "block", lg: "none" }}>
						<Menu>
							<MenuButton
								as={IconButton}
								icon={<Icon as={ListOutlineIconMade} boxSize={7} color="black" />}
								variant="unstyled"
								size="sm"
								aria-label="Navigation menu"
								display="flex"
							/>
							<MenuList shadow="md" borderColor="gray.200" borderRadius="xl" py={2}>
								{NAV_LINKS.map((link) => (
									<MenuItem
										key={link.href}
										onClick={() => router.push(link.href)}
										fontWeight={isActive(link.href) ? "700" : "500"}
										color={isActive(link.href) ? "blue.600" : "gray.700"}
									>
										{link.label}
									</MenuItem>
								))}
							</MenuList>
						</Menu>
					</Box>

					<NextLink href="/" passHref legacyBehavior>
						<HStack
							as="a"
							spacing={2}
							flexShrink={0}
							alignItems="center"
							_hover={{ opacity: 0.85 }}
						>
							<Box position="relative" w="80px" h="32px">
								<Image
									src="/images/app/logo-myits-blue.svg"
									alt="myITS"
									fill
									sizes="80px"
									style={{ objectFit: "contain" }}
								/>
							</Box>
							<Text
								fontSize="lg"
								color="#013880"
								fontWeight="700"
								textTransform="uppercase"
							>
								FASOR
							</Text>
						</HStack>
					</NextLink>
				</HStack>

				<HStack spacing={7} flex={1} display={{ base: "none", lg: "flex" }}>
					{NAV_LINKS.map((link) => (
						<NextLink key={link.href} href={link.href} passHref legacyBehavior>
							<Text
								as="a"
								fontSize="sm"
								fontWeight={isActive(link.href) ? "700" : "500"}
								color={isActive(link.href) ? "blue.600" : "gray.700"}
								borderBottom={isActive(link.href) ? "2px solid" : "none"}
								borderColor="blue.600"
								pb={isActive(link.href) ? "2px" : "0"}
								_hover={{ color: "blue.600", textDecoration: "none" }}
								transition="color 0.15s"
							>
								{link.label}
							</Text>
						</NextLink>
					))}
				</HStack>

				<HStack spacing={3} flexShrink={0}>


					{isLoggedIn ? (
						<Menu>
							<MenuButton aria-label="Profile menu">
								<Avatar
									size="sm"
									bg="#008FFF"
									src={displayAuth?.picture || "/images/app/profile-default.jpg"}
									name={displayAuth?.name || "Profile"}
									cursor="pointer"
									_hover={{ opacity: 0.85 }}
								/>
							</MenuButton>
							<MenuList minW="180px" shadow="md" borderColor="gray.200" borderRadius="xl" py={2}>

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
					) : (
						<>
							<Button
								variant="ghost"
								size="sm"
								fontWeight="500"
								color="gray.700"
								_hover={{ color: "blue.600", bg: "transparent" }}
								onClick={() => router.push("/admin")}
							>
								Admin
							</Button>
							<Button
								variant="ghost"
								size="sm"
								fontWeight="500"
								color="gray.700"
								_hover={{ color: "blue.600", bg: "transparent" }}
								onClick={() => router.push("/login")}
							>
								Masuk
							</Button>
							<Button
								size="sm"
								borderRadius="lg"
								fontWeight="600"
								bg="#008FFF"
								color="white"
								_hover={{ bg: "#0070CC" }}
								onClick={() => router.push("/daftar")}
							>
								Daftar
							</Button>
						</>
					)}
				</HStack>
			</Flex>
		</Box>
	)
}

export default FasorNavbar
