import type { Metadata } from "next"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { ToasterProvider } from "@/components/providers/toaster-provider"
import { SidebarProvider } from "@/components/layout/sidebar-provider"
import QueryProvider from "@/components/providers/query-provider"
import { AdminAuthGuard } from "@/features/admin-auth/components/AdminAuthGuard"
import { WorkspaceProvider } from "@/contexts/WorkspaceContext"
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
<body suppressHydrationWarning>
         <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryProvider>
            <WorkspaceProvider>
              <SidebarProvider>
                <AdminAuthGuard>{children}</AdminAuthGuard>
              </SidebarProvider>
            </WorkspaceProvider>
          </QueryProvider>
          <ToasterProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
