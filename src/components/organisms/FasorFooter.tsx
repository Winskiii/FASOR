import { Box, Divider, Grid, HStack, Icon, Text, VStack } from "@chakra-ui/react"
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa"
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi"
import Image from "next/image"

const FasorFooter = () => (
	<Box as="footer" bg="#EBEBEB" color="gray.800">
		<Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={6}>
			<Grid
				templateColumns={{ base: "1fr", md: "2fr 2fr 2fr 1.5fr" }}
				gap={6}
				mb={4}
			>
				<VStack align="start" spacing={3}>
					<Text fontWeight="800" fontSize="lg" color="gray.800">
						Fasor ITS
					</Text>
					<Text fontSize="sm" color="gray.600" lineHeight="1.7">
						Sistem Reservasi Fasilitas Olahraga Institut Teknologi Sepuluh
						Nopember
					</Text>
				</VStack>

				<VStack align="start" spacing={3}>
					<Text fontWeight="700" color="gray.800">
						Kontak
					</Text>
					<HStack spacing={2}>
						<Icon as={FiPhone} color="gray.600" />
						<Text fontSize="sm" color="gray.600">
							(031) 812912
						</Text>
					</HStack>
					<HStack spacing={2}>
						<Icon as={FiMail} color="gray.600" />
						<Text fontSize="sm" color="gray.600">
							fasor@its.ac.id
						</Text>
					</HStack>
					<HStack spacing={2} alignItems="flex-start">
						<Icon as={FiMapPin} color="gray.600" mt="2px" />
						<Text fontSize="sm" color="gray.600">
							Kampus ITS Sukolilo, Surabaya
						</Text>
					</HStack>
				</VStack>

				<VStack align="start" spacing={3}>
					<Text fontWeight="700" color="gray.800">
						Jam Operasional
					</Text>
					<Text fontSize="sm" color="gray.600">
						Senin - Jumat
					</Text>
					<Text fontSize="sm" color="gray.600">
						08:00 - 16:00 WIB
					</Text>
					<HStack spacing={4} pt={1}>
						<Icon
							as={FaFacebook}
							w={5}
							h={5}
							color="gray.600"
							cursor="pointer"
							_hover={{ color: "blue.500" }}
							transition="color 0.15s"
						/>
						<Icon
							as={FaInstagram}
							w={5}
							h={5}
							color="gray.600"
							cursor="pointer"
							_hover={{ color: "pink.500" }}
							transition="color 0.15s"
						/>
						<Icon
							as={FaTwitter}
							w={5}
							h={5}
							color="gray.600"
							cursor="pointer"
							_hover={{ color: "blue.400" }}
							transition="color 0.15s"
						/>
					</HStack>
				</VStack>

				<VStack align={{ base: "start", md: "flex-end" }} justify="center">
					<Box position="relative" w="200px" h="65px">
						<Image
							src="/images/app/advhum-blue.png"
							alt="Logo ITS"
							fill
							sizes="200px"
							style={{ objectFit: "contain" }}
						/>
					</Box>
				</VStack>
			</Grid>

			<Divider borderColor="gray.300" />
			<Text textAlign="center" pt={3} fontSize="sm" color="gray.600">
				&copy; {new Date().getFullYear()} Fasor ITS. All rights reserved.
			</Text>
		</Box>
	</Box>
)

export default FasorFooter
