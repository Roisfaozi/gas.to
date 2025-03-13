'use client'

import { updateBioPage } from '@/app/actions/bio'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const THEMES = [
  {
    name: 'default',
    label: 'default',
    colors: {
      primary: '#4F46E5',
      text: '#111827',
      background: '#FFFFFF',
      darkPrimary: '#7A7CEB',
      darkText: '#FFFFFF',
      darkBackground: '#1A202C',
    },
  },
  {
    name: 'aqua',
    label: 'Aqua',
    colors: {
      primary: '#06B6D4',
      text: '#FFFFFF',
      background: '#0891B2',
      darkPrimary: '#0E7490',
      darkText: '#FFFFFF',
      darkBackground: '#164E63',
    },
  },
  {
    name: 'minimal-light',
    label: 'Minimal Light',
    colors: {
      primary: '#000000',
      text: '#000000',
      background: '#FFFFFF',
      darkPrimary: '#FFFFFF',
      darkText: '#FFFFFF',
      darkBackground: '#1A202C',
    },
  },
  {
    name: 'coral',
    label: 'Coral',
    colors: {
      primary: '#F43F5E',
      text: '#FFFFFF',
      background: '#E11D48',
      darkPrimary: '#FF5252',
      darkText: '#FFFFFF',
      darkBackground: '#B91C1C',
    },
  },
  {
    name: 'pattern-light',
    label: 'Pattern Light',
    colors: {
      primary: '#1F2937',
      text: '#1F2937',
      background: '#F3F4F6',
      darkPrimary: '#1F2937',
      darkText: '#1F2937',
      darkBackground: '#1A202C',
    },
  },
  {
    name: 'yellow-line',
    label: 'Yellow Line',
    colors: {
      primary: '#EAB308',
      text: '#000000',
      background: '#FFFFFF',
      darkPrimary: '#F59E0B',
      darkText: '#000000',
      darkBackground: '#1A202C',
    },
  },
  {
    name: 'mint',
    label: 'Mint',
    colors: {
      primary: '#10B981',
      text: '#FFFFFF',
      background: '#059669',
      darkPrimary: '#34C759',
      darkText: '#FFFFFF',
      darkBackground: '#047857',
    },
  },
  {
    name: 'wave-pink',
    label: 'Wave Pink',
    colors: {
      primary: '#EC4899',
      text: '#FFFFFF',
      background: '#DB2777',
      darkPrimary: '#FF69B4',
      darkText: '#FFFFFF',
      darkBackground: '#B91C1C',
    },
  },
  {
    name: 'navy-gradient',
    label: 'Navy Gradient',
    colors: {
      primary: '#1E40AF',
      text: '#FFFFFF',
      background: 'linear-gradient(to right, #1E3A8A, #1E40AF)',
      darkPrimary: '#1E40AF',
      darkText: '#FFFFFF',
      darkBackground: 'linear-gradient(to right, #1A202C, #1A202C)',
    },
  },
  {
    name: 'purple-gradient',
    label: 'Purple Gradient',
    colors: {
      primary: '#7C3AED',
      text: '#FFFFFF',
      background: 'linear-gradient(to right, #6D28D9, #7C3AED)',
      darkPrimary: '#7C3AED',
      darkText: '#FFFFFF',
      darkBackground: 'linear-gradient(to right, #1A202C, #1A202C)',
    },
  },
  {
    name: 'mint-gradient',
    label: 'Mint Gradient',
    colors: {
      primary: '#059669',
      text: '#FFFFFF',
      background: 'linear-gradient(to right, #047857, #059669)',
      darkPrimary: '#059669',
      darkText: '#FFFFFF',
      darkBackground: 'linear-gradient(to right, #1A202C, #1A202C)',
    },
  },
  {
    name: 'blue-solid',
    label: 'Blue Solid',
    colors: {
      primary: '#2563EB',
      text: '#FFFFFF',
      background: '#1D4ED8',
      darkPrimary: '#2563EB',
      darkText: '#FFFFFF',
      darkBackground: '#1A202C',
    },
  },
  {
    name: 'orange-gradient',
    label: 'Orange Gradient',
    colors: {
      primary: '#EA580C',
      text: '#FFFFFF',
      background: 'linear-gradient(to right, #C2410C, #EA580C)',
      darkPrimary: '#EA580C',
      darkText: '#FFFFFF',
      darkBackground: 'linear-gradient(to right, #1A202C, #1A202C)',
    },
  },
  {
    name: 'peach-gradient',
    label: 'Peach Gradient',
    colors: {
      primary: '#FB7185',
      text: '#FFFFFF',
      background: 'linear-gradient(to right, #F43F5E, #FB7185)',
      darkPrimary: '#FB7185',
      darkText: '#FFFFFF',
      darkBackground: 'linear-gradient(to right, #1A202C, #1A202C)',
    },
  },
  {
    name: 'gray',
    label: 'Gray',
    colors: {
      primary: '#4B5563',
      text: '#FFFFFF',
      background: '#374151',
      darkPrimary: '#4B5563',
      darkText: '#FFFFFF',
      darkBackground: '#1A202C',
    },
  },
  {
    name: 'dark',
    label: 'Dark',
    colors: {
      primary: '#FFFFFF',
      text: '#FFFFFF',
      background: '#111827',
      darkPrimary: '#FFFFFF',
      darkText: '#FFFFFF',
      darkBackground: '#111827',
    },
  },
]

const SOCIAL_PLATFORMS = [
  { id: 'twitter', name: 'Twitter', icon: 'twitter' },
  { id: 'instagram', name: 'Instagram', icon: 'instagram' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin' },
  { id: 'youtube', name: 'YouTube', icon: 'youtube' },
  { id: 'github', name: 'GitHub', icon: 'github' },
  { id: 'tiktok', name: 'TikTok', icon: 'tiktok' },
]

const bioPageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  username: z.string().min(1, 'Username is required')
    .regex(/^[a-z0-9-]+$/, 'Username can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  visibility: z.enum(['public', 'private']),
  profile_image_url: z.string().url().optional().or(z.literal('')),
  theme_config: z.object({
    name: z.string(),
    colors: z.object({
      primary: z.string(),
      text: z.string(),
      background: z.string(),
    }),
  }),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  social_image_url: z.string().url().optional().or(z.literal('')),
})

type BioPageFormData = z.infer<typeof bioPageSchema>

interface SocialLink {
  id: string
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
  description: string | null
  visibility: 'public' | 'private'
  profile_image_url: string | null
  theme_config: {
    name: string
    colors: {
      primary: string
      text: string
      background: string
    }
  }
  seo_title: string | null
  seo_description: string | null
  social_image_url: string | null
  social_links: SocialLink[]
  bio_links: BioLink[]
}

export function EditBioForm({ bioPage }: { bioPage: BioPage }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(bioPage.social_links || [])
  const [bioLinks, setBioLinks] = useState<BioLink[]>(bioPage.bio_links || [])
  const router = useRouter()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BioPageFormData>({
    resolver: zodResolver(bioPageSchema),
    defaultValues: {
      title: bioPage.title,
      username: bioPage.username,
      description: bioPage.description || '',
      visibility: bioPage.visibility,
      profile_image_url: bioPage.profile_image_url || '',
      theme_config: bioPage.theme_config,
      seo_title: bioPage.seo_title || '',
      seo_description: bioPage.seo_description || '',
      social_image_url: bioPage.social_image_url || '',
    },
  })

  const selectedTheme = watch('theme_config.name')

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // TODO: Implement image upload to storage
    // For now, we'll just use a placeholder URL
    setValue('profile_image_url', URL.createObjectURL(file))
  }

  const handleSocialImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    console.log(file)
    // TODO: Implement image upload to storage
    // For now, we'll just use a placeholder URL
    setValue('social_image_url', URL.createObjectURL(file))
  }
  console.log(bioPage.profile_image_url)

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { id: crypto.randomUUID(), platform: '', url: '' }])
  }

  const removeSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id))
  }

  const addBioLink = () => {
    setBioLinks([
      ...bioLinks,
      {
        id: crypto.randomUUID(),
        title: '',
        url: '',
        sort_order: bioLinks.length,
        is_active: true,
      }
    ])
  }

  const removeBioLink = (id: string) => {
    setBioLinks(bioLinks.filter(link => link.id !== id))
  }

  const onSubmit = async (data: BioPageFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(false)

      const formData = new FormData()
      formData.append('id', bioPage.id)
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'theme_config') {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value as string)
        }
      })

      // Add social links and bio links
      formData.append('social_links', JSON.stringify(socialLinks))
      formData.append('bio_links', JSON.stringify(bioLinks))

      const result = await updateBioPage(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </div>

        {error && (
          <div className="px-6">
            <div className="bg-red-50 text-red-500 p-3 rounded">
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="px-6">
            <div className="bg-green-50 text-green-500 p-3 rounded">
              Changes saved successfully!
            </div>
          </div>
        )}

        <div className="p-6">
          <TabsContent value="general" className="space-y-6">
            {/* Profile Image */}
            <div className="flex items-center space-x-6">
              <div className="relative w-24 h-24">
                <Image
                  src={watch('profile_image_url') || '/placeholder-avatar.png'}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profile Image
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="sr-only"
                    id="profile-image"
                  />
                  <label
                    htmlFor="profile-image"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </label>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                {...register('title')}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                {...register('username')}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Your bio page URL: {process.env.NEXT_PUBLIC_APP_URL}/bio/{watch('username')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Visibility
              </label>
              <select
                {...register('visibility')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Social Links</h3>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Social Link
                </button>
              </div>

              {socialLinks.map((link, index) => (
                <div key={link.id} className="flex items-center space-x-4">
                  <select
                    value={link.platform}
                    onChange={(e) => {
                      const newLinks = [...socialLinks]
                      newLinks[index].platform = e.target.value
                      console.log(newLinks)
                      setSocialLinks(newLinks)
                    }}
                    className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Platform</option>
                    {SOCIAL_PLATFORMS.map(platform => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...socialLinks]
                      newLinks[index].url = e.target.value
                      setSocialLinks(newLinks)
                    }}
                    placeholder="https://"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(link.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Bio Links */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Links</h3>
                <button
                  type="button"
                  onClick={addBioLink}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </button>
              </div>

              {bioLinks.map((link, index) => (
                <div key={link.id} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => {
                      const newLinks = [...bioLinks]
                      newLinks[index].title = e.target.value
                      setBioLinks(newLinks)
                    }}
                    placeholder="Link Title"
                    className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...bioLinks]
                      newLinks[index].url = e.target.value
                      setBioLinks(newLinks)
                    }}
                    placeholder="https://"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeBioLink(link.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-4">
                Choose a Theme
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {THEMES.map((theme) => (
                  <div
                    key={theme.name}
                    className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${selectedTheme === theme.name ? 'ring-2 ring-indigo-500' : ''
                      }`}
                    onClick={() => {
                      setValue('theme_config', {
                        name: theme.name,
                        colors: theme.colors,
                      }, { shouldValidate: true })

                    }}
                  >
                    <div
                      className="aspect-[4/3]"
                      style={{
                        background: theme.colors.background,
                      }}
                    >
                      <div className="p-4 flex flex-col items-center">
                        <span className="text-sm" style={{ color: theme.colors.text }}>
                          {theme.label}
                        </span>
                        <div
                          className="mt-2 w-full rounded-md py-2 text-center text-sm"
                          style={{
                            background: theme.colors.primary,
                            color: theme.colors.text,
                          }}
                        >
                          Link
                        </div>
                      </div>
                      <p>{selectedTheme}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                SEO Title
              </label>
              <input
                {...register('seo_title')}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                SEO Description
              </label>
              <textarea
                {...register('seo_description')}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Social Image
              </label>
              <div className="mt-1 flex items-center space-x-4">
                {watch('social_image_url') && (
                  <div className="relative w-32 h-32">
                    <Image
                      src={watch('social_image_url')}
                      alt="Social"
                      fill
                      className="rounded object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSocialImageUpload}
                    className="sr-only"
                    id="social-image"
                  />
                  <label
                    htmlFor="social-image"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </label>
                  <p className="text-sm text-gray-500">or</p>
                  <input
                    {...register('social_image_url')}
                    type="url"
                    placeholder="Enter image URL"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Custom Domain
              </label>
              <input
                type="text"
                placeholder="bio.example.com"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter your custom domain to use instead of the default URL
              </p>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
              <p className="mt-1 text-sm text-gray-500">
                Permanently delete this bio page and all its data
              </p>
              <button
                type="button"
                onClick={() => {/* Delete page handler */ }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Bio Page
              </button>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  )
}