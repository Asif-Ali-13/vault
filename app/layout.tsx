import "./globals.css";
import type { Metadata } from "next";

import { Footer } from "@/components/Footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: 'Vault',
  description: 'Your Personal Web3 Wallet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster/>
            {children}
            <Footer/>
          </ThemeProvider>
        </body>
    </html>
  )
}
