'use client'

import { initSession } from '@/lib/analytics/session'
import { trackClick } from '@/lib/analytics/track'
import { ExternalLink, Instagram, Linkedin, Moon, Sun, Twitter, Youtube } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface SocialLink {
  id?: string
  platform: string
  url: string
}

interface BioLink {
  id: string
  title: string
  url: string
  icon?: string
  sort_order: number
  is_active: boolean
}

interface BioPage {
  id: string
  title: string
  username: string
  description: string
  theme_config: {
    name: string
    colors: {
      primary: string
      text: string
      background: string
      darkPrimary: string
      darkText: string
      darkBackground: string
    }
  }
  visibility: 'public' | 'private'
  profile_image_url: string
  social_image_url: string
  bio_links: BioLink[]
  social_links: SocialLink[]
}

function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case 'twitter':
      return <Twitter className="h-5 w-5" />
    case 'instagram':
      return <Instagram className="h-5 w-5" />
    case 'youtube':
      return <Youtube className="h-5 w-5" />
    case 'linkedin':
      return <Linkedin className="h-5 w-5" />
    default:
      return <ExternalLink className="h-5 w-5" />
  }
}

export function BioPageDisplay({ bioPage }: { bioPage: BioPage }) {
  const [mounted, setMounted] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check system preference for dark mode
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true)
    }
    initSession()
  }, [])

  // Handle link click with tracking
  const handleLinkClick = (linkId: string, url: string) => {
    // Track the click
    trackClick(linkId)

    // Open the link
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Handle visibility
  if (bioPage.visibility === 'private') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            This bio page is private
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The owner has set this page to private.
          </p>
        </div>
      </div>
    )
  }

  if (!mounted) return null

  const theme = bioPage.theme_config
  const colors = isDarkMode ? {
    primary: theme.colors.darkPrimary || theme.colors.primary,
    text: theme.colors.darkText || '#FFFFFF',
    background: theme.colors.darkBackground || '#111827'
  } : theme.colors

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-opacity-10 hover:bg-white"
          style={{ color: colors.text }}
        >
          {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
        </button>

        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <Image
              src={bioPage.profile_image_url || '/placeholder-avatar.png'}
              alt={bioPage.title}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <h1 style={{ color: colors.text }} className="text-2xl font-bold">
            {bioPage.title}
          </h1>
          <p style={{ color: colors.text }} className="mt-2 opacity-80">
            {bioPage.description}
          </p>

          {/* Social Links */}
          <div className="flex justify-center space-x-4 mt-4">
            {bioPage.social_links.map((social, index) => (
              <a
                key={social.id || index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: colors.text }}
                className="p-2 rounded-full transition-colors hover:bg-opacity-10 hover:bg-white"
              >
                <SocialIcon platform={social.platform} />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="space-y-4">
          {bioPage.bio_links
            .filter(link => link.is_active)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.text
                }}
                className="bio-link block w-full p-4 rounded-lg text-center transition-all hover:opacity-90"
              >
                {link.title}
              </a>
            ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p style={{ color: colors.text }} className="text-sm opacity-60">
            © {new Date().getFullYear()} {bioPage.title}
          </p>
        </div>
      </div>
    </div>
  )
}