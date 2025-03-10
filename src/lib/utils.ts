import { type ClassValue, clsx } from 'clsx'
import { format, formatDistanceToNow } from 'date-fns'
import { customAlphabet } from 'nanoid'
import { twMerge } from 'tailwind-merge'
import UAParser from 'ua-parser-js'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseUserAgent(userAgent: string) {
  try {
    const parser = new UAParser(userAgent)
    const result = parser.getResult()

    return {
      browser: result.browser.name || 'Unknown',
      os: result.os.name || 'Unknown',
      device: result.device.type || 'desktop',
    }
  } catch (error) {
    console.error('Error parsing user agent:', error)
    return {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'desktop',
    }
  }
}

export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return 100
  return ((current - previous) / previous) * 100
}

// Generate a short code for links
export function generateShortCode() {
  const nanoid = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    6
  )
  return nanoid()
}

// Validate URL
export function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Convert epoch timestamp (milliseconds) to Date object
export function epochToDate(epoch: number): Date {
  if (!epoch) return new Date()
  return new Date(epoch)
}

// Convert Date object to epoch timestamp (milliseconds)
export function dateToEpoch(date: Date): number {
  return date.getTime()
}

// Format epoch timestamp to readable date string
export function formatEpochDate(
  epoch: number,
  formatString: string = 'PPP'
): string {
  if (!epoch) return 'Unknown date'
  try {
    return format(epochToDate(epoch), formatString)
  } catch (error) {
    console.error('Error formatting epoch date:', error, epoch)
    return 'Invalid date'
  }
}

// Format epoch timestamp to relative time (e.g., "2 hours ago")
export function formatEpochRelative(epoch: number): string {
  if (!epoch) return 'Unknown time'
  try {
    return formatDistanceToNow(epochToDate(epoch), { addSuffix: true })
  } catch (error) {
    console.error('Error formatting relative epoch:', error, epoch)
    return 'Invalid time'
  }
}

// Get current time as epoch timestamp
export function getCurrentEpoch(): number {
  return Date.now()
}

// Check if an epoch timestamp is in the past
export function isEpochInPast(epoch: number): boolean {
  return epoch < getCurrentEpoch()
}

// Check if an epoch timestamp is in the future
export function isEpochInFuture(epoch: number): boolean {
  return epoch > getCurrentEpoch()
}

// Add days to an epoch timestamp
export function addDaysToEpoch(epoch: number, days: number): number {
  const date = epochToDate(epoch)
  date.setDate(date.getDate() + days)
  return dateToEpoch(date)
}
