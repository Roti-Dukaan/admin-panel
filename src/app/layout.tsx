import type { Metadata } from "next"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { ToasterProvider } from "@/components/providers/toaster-provider"
import QueryProvider from "@/components/providers/query-provider"
import { WorkspaceProvider } from "@/contexts/WorkspaceContext"
import { AppShell } from "./app-shell"
import { DocumentsProvider } from "@/features/documents"
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
          <QueryProvider>
            <WorkspaceProvider>
              <DocumentsProvider>
                <AppShell>{children}</AppShell>
              </DocumentsProvider>
            </WorkspaceProvider>
          </QueryProvider>
          <ToasterProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
