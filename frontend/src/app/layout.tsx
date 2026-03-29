import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Inbox Copilot - AI-Powered Email Management',
  description: 'Clean your inbox intelligently. Inbox Copilot uses AI to identify clutter, categorize emails, and help you achieve inbox zero.',
  keywords: ['email cleaner', 'inbox management', 'gmail cleaner', 'email organizer', 'ai email'],
  openGraph: {
    title: 'Inbox Copilot - AI-Powered Email Management',
    description: 'Declutter your inbox, manage subscriptions, and save time with Inbox Copilot.',
    type: 'website',
  },
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-dark-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
