'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import 'swiper/css'
import 'swiper/css/effect-cards'
import { Autoplay, EffectCards } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

const testimonials = [
  {
    id: 1,
    name: 'Sarah, 28',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    text: 'Found my perfect match on Tinder! The app made dating fun and easy.',
  },
  {
    id: 2,
    name: 'Mike, 32',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    text: 'Great experience using Tinder. Met amazing people and had meaningful connections.',
  },
  {
    id: 3,
    name: 'Emily, 26',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    text: 'Tinder helped me find love when I least expected it. So grateful!',
  },
]

export default function TinderLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Image
                src="/tinder-logo.png"
                alt="Tinder"
                width={100}
                height={40}
                className="w-auto h-8"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/tinder/auth/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Log in
              </Link>
              <Link
                href="/tinder/auth/signup"
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-pink-600 hover:to-rose-600"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Swipe Right®
                <br />
                <span className="text-rose-500">Find Your Match</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Match. Chat. Date. Join millions of people discovering new connections on Tinder every day.
              </p>
              <Link
                href="/tinder/auth/signup"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                Create account
              </Link>
            </motion.div>

            <div className="relative h-[600px]">
              <Swiper
                effect="cards"
                grabCursor={true}
                modules={[EffectCards, Autoplay]}
                autoplay={{
                  delay: 2500,
                  disableOnInteraction: false,
                }}
                className="w-[280px] h-[400px]"
              >
                {testimonials.map((testimonial) => (
                  <SwiperSlide key={testimonial.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="relative h-full">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                        <h3 className="text-white text-xl font-semibold">{testimonial.name}</h3>
                        <p className="text-white/90 text-sm mt-2">{testimonial.text}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Tinder?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Meaningful Connections</h3>
              <p className="text-gray-600">Find matches based on what matters to you</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Safe & Secure</h3>
              <p className="text-gray-600">Your privacy and safety are our top priority</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Community</h3>
              <p className="text-gray-600">Connect with people from around the world</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Cookie Policy</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Careers</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Jobs</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Team</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Social</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Instagram</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">TikTok</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">YouTube</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Help</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">FAQ</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Safety Tips</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Contact Us</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              © {new Date().getFullYear()} Tinder Clone. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}