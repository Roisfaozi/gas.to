'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { generateShortCode, isValidUrl } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export async function createSingleLink(formData: FormData) {
  const url = formData.get('url') as string
  const title = formData.get('title') as string

  if (!isValidUrl(url)) {
    return { error: 'Invalid URL' }
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie errors
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie errors
          }
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'Not authenticated' }
  }

  const shortCode = generateShortCode()
  const { error } = await supabase
    .from('links')
    .insert([
      {
        short_code: shortCode,
        original_url: url,
        title: title || url,
        user_id: session.user.id,
        type: 'shortlink',
        status: 'active',
        visibility: 'public',
      },
    ])

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, shortCode }
}

export async function createMultipleLinks(formData: FormData) {
  const urls = (formData.get('urls') as string).split('\n').filter(url => url.trim())

  if (urls.length === 0) {
    return { error: 'No URLs provided' }
  }

  const invalidUrls = urls.filter(url => !isValidUrl(url.trim()))
  if (invalidUrls.length > 0) {
    return { error: `Invalid URLs: ${invalidUrls.join(', ')}` }
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie errors
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie errors
          }
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'Not authenticated' }
  }

  const links = urls.map(url => ({
    short_code: generateShortCode(),
    original_url: url.trim(),
    title: url.trim(),
    user_id: session.user.id,
    type: 'shortlink',
    status: 'active',
    visibility: 'public',
  }))

  const { error } = await supabase
    .from('links')
    .insert(links)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, count: links.length }
}