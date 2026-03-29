'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, ArrowLeft, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle OAuth callback
  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const code = searchParams.get('code')

    if (accessToken) {
      api.setTokens(accessToken, refreshToken || undefined)
      router.push('/dashboard')
    } else if (code) {
      handleCodeExchange(code)
    }
  }, [searchParams, router])

  const handleCodeExchange = async (code: string) => {
    setIsLoading(true)
    try {
      const redirectUri = `${window.location.origin}/login`
      const tokens = await api.exchangeToken(code, redirectUri)
      api.setTokens(tokens.access_token, tokens.refresh_token)
      router.push('/dashboard')
    } catch (err) {
      setError('Failed to authenticate. Please try again.')
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const authUrl = await api.getAuthUrl()
      window.location.href = authUrl
    } catch (err) {
      setError('Failed to initiate login. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Cosmic Background */}
      <div className="cosmic-bg">
        <div className="stars" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 mb-4 shadow-lg shadow-orange-500/30">
              <Mail size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to Inbox Copilot</h1>
            <p className="text-gray-400">Sign in to start cleaning your inbox</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full glass-card hover:bg-white/10 text-white font-medium px-6 py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {isLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-orange-400 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-orange-400 hover:underline">Privacy Policy</Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Shield size={16} className="text-green-400" />
                </div>
                <span>Secure OAuth</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Zap size={16} className="text-cyan-400" />
                </div>
                <span>Quick setup</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          🔒 We never store your password. Authentication is handled securely by Google.
        </p>
      </div>
    </main>
  )
}
