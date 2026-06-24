/**
 * @file _document.tsx
 * @description This is the document component. It is used to wrap the document with the providers.
 * @module base
 * @author [Fikri Haykal for DPTSI ITS]
 * @version 1.5.14
 **/

import theme from "@/theme/theme";
import { ColorModeScript } from "@chakra-ui/react";
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<link rel="preload" as="style" href="/styles/material_symbols_outlined.css" />
				<link rel="stylesheet" href="/styles/material_symbols_outlined.css" media="print" onLoad={(e: any) => { (e.target as HTMLLinkElement).media = 'all'; }} />
				<noscript>
					<link rel="stylesheet" href="/styles/material_symbols_outlined.css" />
				</noscript>

				<link rel="preload" as="style" href="/styles/material_symbols_sharp.css" />
				<link rel="stylesheet" href="/styles/material_symbols_sharp.css" media="print" onLoad={(e: any) => { (e.target as HTMLLinkElement).media = 'all'; }} />
				<noscript>
					<link rel="stylesheet" href="/styles/material_symbols_sharp.css" />
				</noscript>

				<link rel="preload" as="style" href="/styles/material_symbols_rounded.css" />
				<link rel="stylesheet" href="/styles/material_symbols_rounded.css" media="print" onLoad={(e: any) => { (e.target as HTMLLinkElement).media = 'all'; }} />
				<noscript>
					<link rel="stylesheet" href="/styles/material_symbols_rounded.css" />
				</noscript>
			</Head>
			<body>
				<script dangerouslySetInnerHTML={{ __html: `try{localStorage.setItem('chakra-ui-color-mode','light')}catch(e){}` }} />
				<ColorModeScript initialColorMode={theme.config.initialColorMode} />
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
