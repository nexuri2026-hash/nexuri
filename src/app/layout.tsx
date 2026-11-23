import type { Metadata } from "next";
import "./globals.css";
import { CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    default: `${CONFIG.SYSTEM_NAME} — Cotizaciones, Compras y Entregas`,
    template: `%s | ${CONFIG.SYSTEM_NAME}`,
  },
  description:
    "Plataforma de gestión de pedidos, cotizaciones de productos, compras y coordinación de entregas.",
  icons: {
    icon: CONFIG.LOGO_PATH,
    shortcut: CONFIG.LOGO_PATH,
    apple: CONFIG.LOGO_PATH,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
