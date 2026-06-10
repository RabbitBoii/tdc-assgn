import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/app/lib/auth-context"

export const metadata: Metadata = {
  title: "TDC Matchmaker",
  description: "Internal matchmaking dashboard — The Date Crew",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
