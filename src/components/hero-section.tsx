'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

function fadeUp(i = 1): Variants {
  return {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.7,
        ease: 'easeOut',
      },
    },
  };
}

export default function HeroSection() {
  return (
    <section className="relative flex flex-col-reverse lg:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 sm:pb-24 gap-8 w-full">
      <div className="flex-1 flex flex-col items-start justify-center z-10">
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900"
          initial="hidden"
          animate="visible"
          variants={fadeUp(1)}
        >
          <span className="block bg-gradient-to-tr from-blue-700 to-indigo-700 bg-clip-text text-transparent">Connecting Urology Professionals</span>
          <span className="block text-blue-600">Across the Globe</span>
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl"
          initial="hidden"
          animate="visible"
          variants={fadeUp(2)}
        >
          UroCareerz is the trusted network for collaboration, learning, and career growth in urology. Join a global community of verified professionals and advance your career with confidence.
        </motion.p>
        <motion.div
          className="flex gap-4 mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeUp(3)}
        >
          <Link href="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all">Join Now</Link>
          <Link href="#features" className="px-6 py-3 rounded-xl font-semibold border border-blue-600 text-blue-700 bg-white hover:bg-blue-50 transition-all">Learn More</Link>
        </motion.div>
        <motion.div
          className="flex gap-8 mt-4"
          initial="hidden"
          animate="visible"
          variants={fadeUp(4)}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">100+</div>
            <div className="text-xs text-gray-500">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">5,000+</div>
            <div className="text-xs text-gray-500">Professionals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">Verified</div>
            <div className="text-xs text-gray-500">Medical Network</div>
          </div>
        </motion.div>
      </div>
      <motion.div
        className="flex-1 flex items-center justify-center relative w-full h-80 lg:h-[32rem]"
        initial="hidden"
        animate="visible"
        variants={fadeUp(5)}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Inline SVG: Premium medical cross with network motif */}
          <svg
            width="360"
            height="360"
            viewBox="0 0 360 360"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Premium Medical Network"
            role="img"
          >
            <title>Premium Medical Network</title>
            <defs>
              <radialGradient id="outerRing" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#2563eb" />
              </radialGradient>
              <linearGradient id="crossGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
              <linearGradient id="goldAccent" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e42" />
              </linearGradient>
            </defs>
            <circle cx="180" cy="180" r="150" stroke="url(#outerRing)" strokeWidth="8" fill="#f8fafc" filter="url(#shadow1)" />
            <path d="M60 180a120 120 0 0 1 240 0" stroke="#38bdf8" strokeWidth="3" fill="none" opacity="0.7" />
            <path d="M300 180a120 120 0 0 1 -240 0" stroke="#0ea5e9" strokeWidth="3" fill="none" opacity="0.7" />
            <circle cx="60" cy="180" r="10" fill="url(#goldAccent)" filter="url(#shadow2)" />
            <circle cx="300" cy="180" r="10" fill="url(#goldAccent)" filter="url(#shadow2)" />
            <circle cx="180" cy="60" r="10" fill="#2563eb" filter="url(#shadow2)" />
            <circle cx="180" cy="300" r="10" fill="#0ea5e9" filter="url(#shadow2)" />
            <g filter="url(#shadow3)">
              <rect x="155" y="120" width="50" height="120" rx="12" fill="url(#crossGradient)" />
              <rect x="120" y="155" width="120" height="50" rx="12" fill="url(#crossGradient)" />
              <rect x="155" y="120" width="50" height="120" rx="12" fill="none" stroke="url(#goldAccent)" strokeWidth="3" />
              <rect x="120" y="155" width="120" height="50" rx="12" fill="none" stroke="url(#goldAccent)" strokeWidth="3" />
            </g>
            <filter id="shadow1" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#2563eb" floodOpacity="0.08" />
            </filter>
            <filter id="shadow2" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0ea5e9" floodOpacity="0.12" />
            </filter>
            <filter id="shadow3" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#fbbf24" floodOpacity="0.10" />
            </filter>
          </svg>
        </div>
      </motion.div>
    </section>
  );
} 