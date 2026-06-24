import { ThemeConfig, extendTheme } from "@chakra-ui/react";
import { Inter } from "next/font/google";
import ButtonStyles from "./Button";
import { cardTheme } from "./Card";
import Color from "./Color";
import Heading from "./Heading";
import Link from "./Link";
import { menuTheme } from "./Menu";
import { modalTheme } from "./Modal";
import Skeleton from "./Skeleton";
import Text from "./Text";
import { tooltipTheme } from "./Tooltip";

const inter = Inter({ subsets: ["latin"] });

const config: ThemeConfig = {
	initialColorMode: "light",
	useSystemColorMode: false,
};

const breakpoints = {
	s: "474px",
	a: "639px",
	m: "767px",
	t: "1023px",
	d: "1179px",
	x: "1339px",
	w: "1419px",
};

const semanticTokens = {
	colors: {
		purple: "purple.500",
		orange: "orange.500",
		red: "red.500",
		gray: "gray.500",
		teal: "teal.500",
		yellow: "yellow.500",
		pink: "pink.500",
		blue: "blue.500",
		green: "green.500",
		cyan: "cyan.500",
	},
};

const theme = extendTheme({
	breakpoints,
	semanticTokens,
	config,
	fonts: {
		heading: inter.style.fontFamily,
		body: inter.style.fontFamily,
	},
	styles: {
		global: () => ({
			body: {
				bg: "white",
				color: "gray.800",
			},
		}),
	},
	components: {
		Card: cardTheme,
		Link,
		Text,
		Heading,
		ButtonStyles,
		Skeleton,
		Modal: modalTheme,
		Menu: menuTheme,
		Tooltip: tooltipTheme,
		Input: {
			variants: {
				outline: {
					field: {
						bg: "white",
						color: "gray.800",
						borderColor: "gray.300",
						_placeholder: { color: "gray.400" },
						_focus: { borderColor: "#008FFF", boxShadow: "0 0 0 1px #008FFF" },
					},
				},
			},
			defaultProps: {
				variant: "outline",
			},
		},
		Textarea: {
			variants: {
				outline: {
					bg: "white",
					color: "gray.800",
					borderColor: "gray.300",
					_placeholder: { color: "gray.400" },
				},
			},
			defaultProps: {
				variant: "outline",
			},
		},
	},
	colors: Color,
});

export default theme;
