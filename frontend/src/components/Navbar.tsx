'use client'

import Link from 'next/link'
import { Mail, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface NavbarProps {
  isLoggedIn?: boolean
  userName?: string
  userPicture?: string
}

export default function Navbar({ isLoggedIn, userName, userPicture }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-orange-500/20">
              <Mail size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">Inbox Copilot</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Dashboard
                </Link>
                <Link href="/dashboard/scan" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Scan
                </Link>
                <Link href="/dashboard/insights" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Insights
                </Link>
                <Link href="/dashboard/settings" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Settings
                </Link>
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
                  {userPicture ? (
                    <img src={userPicture} alt={userName} className="w-8 h-8 rounded-full ring-2 ring-white/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {userName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Features
                </Link>
                <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Pricing
                </Link>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                  FAQs
                </Link>
                <Link href="/login">
                  <button className="glass-card text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-white/10 transition-all">
                    Log in
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-950/95 backdrop-blur-xl border-t border-white/5">
          <div className="px-4 py-4 space-y-3">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="block text-gray-300 hover:text-white py-2">Dashboard</Link>
                <Link href="/dashboard/scan" className="block text-gray-300 hover:text-white py-2">Scan</Link>
                <Link href="/dashboard/settings" className="block text-gray-300 hover:text-white py-2">Settings</Link>
              </>
            ) : (
              <>
                <Link href="#features" className="block text-gray-300 hover:text-white py-2">Features</Link>
                <Link href="#pricing" className="block text-gray-300 hover:text-white py-2">Pricing</Link>
                <Link href="/about" className="block text-gray-300 hover:text-white py-2">About Us</Link>
                <Link href="/faq" className="block text-gray-300 hover:text-white py-2">FAQs</Link>
                <Link href="/login">
                  <button className="w-full btn-orange text-white font-medium py-3 rounded-lg mt-4">
                    Log in
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
