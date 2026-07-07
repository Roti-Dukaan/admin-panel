import type { Metadata } from "next"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { ToasterProvider } from "@/components/providers/toaster-provider"
import { SidebarProvider } from "@/components/layout/sidebar-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Roti Dukaan Admin",
  description: "Admin panel for Roti Dukaan",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SidebarProvider>
            {children}
          </SidebarProvider>
          <ToasterProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
