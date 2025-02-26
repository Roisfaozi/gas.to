'use server'

import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function createBioPage(formData: FormData) {
  const title = formData.get('title') as string
  const username = formData.get('username') as string

  if (!title || !username) {
    return { error: 'Title and username are required' }
  }

  // Validate username format
  const usernameRegex = /^[a-z0-9-]+$/
  if (!usernameRegex.test(username)) {
    return {
      error:
        'Username can only contain lowercase letters, numbers, and hyphens',
    }
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

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'Not authenticated' }
  }

  // Check if username is already taken
  const { data: existingPage } = await supabase
    .from('bio_pages')
    .select('id')
    .eq('username', username)
    .single()

  if (existingPage) {
    return { error: 'Username is already taken' }
  }

  const { data, error } = await supabase
    .from('bio_pages')
    .insert([
      {
        title,
        username,
        user_id: session.user.id,
        theme_config: {
          name: 'default',
          colors: {
            primary: '#4F46E5',
            text: '#111827',
            background: '#FFFFFF',
          },
        },
      },
    ])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/bio')
  return { id: data.id }
}

export async function updateBioPage(formData: FormData) {
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const username = formData.get('username') as string
  const description = formData.get('description') as string
  const visibility = formData.get('visibility') as string
  const profile_image_url = formData.get('profile_image_url') as string
  const theme_config = JSON.parse(formData.get('theme_config') as string)
  const seo_title = formData.get('seo_title') as string
  const seo_description = formData.get('seo_description') as string
  const social_image_url = formData.get('social_image_url') as string
  const social_links = JSON.parse(formData.get('social_links') as string)
  const bio_links = JSON.parse(formData.get('bio_links') as string)

  if (!id || !title || !username) {
    return { error: 'Required fields are missing' }
  }

  // Validate username format
  const usernameRegex = /^[a-z0-9-]+$/
  if (!usernameRegex.test(username)) {
    return {
      error:
        'Username can only contain lowercase letters, numbers, and hyphens',
    }
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

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'Not authenticated' }
  }

  // Check if username is already taken by another bio page
  const { data: existingPage } = await supabase
    .from('bio_pages')
    .select('id')
    .eq('username', username)
    .neq('id', id)
    .single()

  if (existingPage) {
    return { error: 'Username is already taken' }
  }

  // Start a transaction
  const { error: bioPageError } = await supabase
    .from('bio_pages')
    .update({
      title,
      username,
      description,
      visibility,
      profile_image_url,
      theme_config,
      seo_title,
      seo_description,
      social_image_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (bioPageError) {
    return { error: bioPageError.message }
  }

  // Update social links
  await supabase.from('social_links').delete().eq('bio_page_id', id)

  if (social_links.length > 0) {
    const { error: socialLinksError } = await supabase
      .from('social_links')
      .insert(
        social_links.map((link: any) => ({
          bio_page_id: id,
          platform: link.platform,
          url: link.url,
        }))
      )

    if (socialLinksError) {
      return { error: socialLinksError.message }
    }
  }

  // Update bio links
  await supabase.from('bio_links').delete().eq('bio_page_id', id)

  if (bio_links.length > 0) {
    const { error: bioLinksError } = await supabase.from('bio_links').insert(
      bio_links.map((link: any, index: number) => ({
        bio_page_id: id,
        title: link.title,
        url: link.url,
        icon: link.icon,
        sort_order: index,
        is_active: true,
      }))
    )

    if (bioLinksError) {
      return { error: bioLinksError.message }
    }
  }

  revalidatePath('/dashboard/bio')
  revalidatePath(`/dashboard/bio/${id}/edit`)
  return { success: true }
}

export async function deleteBioPage(id: string) {
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

  const { error } = await supabase.from('bio_pages').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/bio')
  return { success: true }
}
