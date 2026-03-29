'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Inbox, Trash2, HardDrive, Users, TrendingUp, Settings, LogOut, Zap, Crown } from 'lucide-react'
import Link from 'next/link'
import api, { UserProfile, ScanResponse, InboxHealth, UserQuota, SenderInfo } from '@/lib/api'
import { formatBytes, formatNumber } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import StatsCard from '@/components/ui/StatsCard'
import CircularProgress from '@/components/ui/CircularProgress'

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null)
  const [inboxHealth, setInboxHealth] = useState<InboxHealth | null>(null)
  const [quota, setQuota] = useState<UserQuota | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [selectedSenders, setSelectedSenders] = useState<string[]>([])

  useEffect(() => {
    // Handle tokens from URL
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (accessToken) {
      api.setTokens(accessToken, refreshToken || undefined)
      // Clear URL params
      window.history.replaceState({}, '', '/dashboard')
    }
    
    initializeDashboard()
  }, [searchParams])

  const initializeDashboard = async () => {
    const hasTokens = api.loadTokens()
    
    if (!hasTokens) {
      router.push('/login')
      return
    }

    try {
      const profile = await api.getProfile()
      if (!profile) {
        api.clearTokens()
        router.push('/login')
        return
      }
      
      setUser(profile)
      
      // Fetch quota
      const userQuota = await api.getQuota(profile.email)
      setQuota(userQuota)
      
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      api.clearTokens()
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleScan = async (limit: number = 1000) => {
    setIsScanning(true)
    try {
      const result = await api.scanInbox(limit)
      setScanResult(result)
      
      // Calculate health
      if (result.success && result.senders.length > 0) {
        const health = await api.getInboxHealth(limit)
        setInboxHealth(health)
      }
    } catch (err) {
      console.error('Scan failed:', err)
    } finally {
      setIsScanning(false)
    }
  }

  const handleDelete = async () => {
    if (selectedSenders.length === 0) return
    
    try {
      const result = await api.deleteEmails(selectedSenders)
      if (result.success && user) {
        await api.updateQuota(user.email, result.deleted_count)
        const newQuota = await api.getQuota(user.email)
        setQuota(newQuota)
        
        // Refresh scan results
        await handleScan()
        setSelectedSenders([])
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleLogout = () => {
    api.clearTokens()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen pb-12">
      <Navbar isLoggedIn userName={user?.name} userPicture={user?.picture} />
      
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user?.name || user?.email}</p>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>

        {/* Quota Banner */}
        {quota && !quota.is_premium && (
          <Card variant="gradient" className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent-500/20">
                  <Zap size={24} className="text-accent-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Free Plan</h3>
                  <p className="text-sm text-gray-400">
                    {quota.remaining.toLocaleString()} / {quota.free_limit.toLocaleString()} cleanups remaining
                  </p>
                </div>
                <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden ml-4">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
                    style={{ width: `${quota.quota_percent}%` }}
                  />
                </div>
              </div>
              <Button variant="primary" size="sm">
                <Crown size={16} />
                Upgrade to Pro
              </Button>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Inbox Health & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Inbox Health */}
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Inbox Health</h3>
              <div className="flex items-center justify-center mb-4">
                <CircularProgress 
                  value={inboxHealth?.score || 0} 
                  size={140}
                  label="/100"
                />
              </div>
              <p className="text-center text-gray-400 mb-4">
                {inboxHealth?.status || 'Scan to check health'}
              </p>
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => handleScan(1000)}
                isLoading={isScanning}
              >
                {isScanning ? 'Scanning...' : 'Scan My Inbox'}
              </Button>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <StatsCard 
                icon={Mail} 
                label="Emails Analyzed" 
                value={inboxHealth?.emails_analyzed || 0} 
              />
              <StatsCard 
                icon={Users} 
                label="Active Senders" 
                value={inboxHealth?.active_senders || 0} 
              />
              <StatsCard 
                icon={Trash2} 
                label="Clutter Removed" 
                value={quota?.lifetime_deleted || 0} 
              />
              <StatsCard 
                icon={HardDrive} 
                label="Storage Saved" 
                value={`${((quota?.lifetime_deleted || 0) * 0.05).toFixed(1)}`}
                suffix="MB"
              />
            </div>
          </div>

          {/* Right Column - Senders List */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Top Senders
                  {scanResult && (
                    <span className="ml-2 px-2 py-0.5 bg-primary-500/20 text-primary-400 text-sm rounded-full">
                      {scanResult.total_senders}
                    </span>
                  )}
                </h3>
                {selectedSenders.length > 0 && (
                  <Button variant="danger" size="sm" onClick={handleDelete}>
                    <Trash2 size={16} />
                    Delete Selected ({selectedSenders.length})
                  </Button>
                )}
              </div>

              {!scanResult ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📬</div>
                  <h4 className="text-lg font-semibold text-white mb-2">Ready to Scan</h4>
                  <p className="text-gray-400 mb-6">Click "Scan My Inbox" to analyze your emails</p>
                </div>
              ) : scanResult.senders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✨</div>
                  <h4 className="text-lg font-semibold text-white mb-2">Inbox is Clean!</h4>
                  <p className="text-gray-400">No bulk senders found. Your inbox is in great shape!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {scanResult.senders.map((sender) => (
                    <SenderRow 
                      key={sender.email}
                      sender={sender}
                      isSelected={selectedSenders.includes(sender.email)}
                      onSelect={(selected) => {
                        if (selected) {
                          setSelectedSenders([...selectedSenders, sender.email])
                        } else {
                          setSelectedSenders(selectedSenders.filter(e => e !== sender.email))
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

// Sender Row Component
function SenderRow({ 
  sender, 
  isSelected, 
  onSelect 
}: { 
  sender: SenderInfo
  isSelected: boolean
  onSelect: (selected: boolean) => void
}) {
  return (
    <div 
      className={`flex items-center gap-4 p-4 rounded-lg transition-all cursor-pointer ${
        isSelected 
          ? 'bg-primary-500/20 border border-primary-500/30' 
          : 'glass hover:bg-white/5'
      }`}
      onClick={() => onSelect(!isSelected)}
    >
      <input 
        type="checkbox" 
        checked={isSelected}
        onChange={(e) => onSelect(e.target.checked)}
        className="w-5 h-5 rounded border-gray-600 text-primary-500 focus:ring-primary-500"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{sender.category_info.icon}</span>
          <span className="font-medium text-white truncate">{sender.email}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="text-primary-400 font-medium">{sender.count} emails</span>
          <span>{formatBytes(sender.size_kb)}</span>
          <span>{sender.date_range}</span>
        </div>
      </div>
      
      <div 
        className="px-3 py-1 rounded-full text-xs font-medium"
        style={{ 
          backgroundColor: `${sender.category_info.color}20`,
          color: sender.category_info.color 
        }}
      >
        {sender.category_info.name}
      </div>
    </div>
  )
}
