'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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

// Subtle floating animation for decorative elements
function floatingAnimation(delay = 0): Variants {
  return {
    initial: { y: 0 },
    animate: {
      y: [0, -10, 0],
      transition: {
        delay,
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Static content that will be rendered on both server and client
  const staticContent = (
    <section 
      className="relative flex flex-col-reverse lg:flex-row items-center justify-center lg:justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-h-screen"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-indigo-100/20 blur-3xl" />
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col items-start justify-center z-10 w-full max-w-2xl lg:max-w-none py-8 sm:py-12 lg:py-16">
        <div className="mb-6 inline-block">
          <span className="px-4 py-2 text-xs font-semibold tracking-wider uppercase bg-blue-50 text-blue-700 rounded-full border border-blue-100">
            Global Medical Network
          </span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight mb-8">
          <span className="block bg-gradient-to-tr from-blue-800 to-indigo-600 bg-clip-text text-transparent mb-2 leading-[1.3] sm:leading-[1.35] md:leading-[1.3] lg:leading-[1.25]">Connecting Urology</span>
          <span className="block bg-gradient-to-tr from-blue-700 to-indigo-500 bg-clip-text text-transparent mb-2 leading-[1.3] sm:leading-[1.35] md:leading-[1.3] lg:leading-[1.25]">Professionals</span>
          <span className="block text-blue-700 leading-[1.3] sm:leading-[1.35] md:leading-[1.3] lg:leading-[1.25]">Across the Globe</span>
        </h1>
        
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 max-w-xl leading-relaxed">
          UroCareerz is the trusted network for collaboration, learning, and career growth in urology. Join a global community of verified professionals and advance your career with confidence.
        </p>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <Link 
            href="/register" 
            className="premium-button bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 text-sm sm:text-base"
          >
            Join Now
          </Link>
          <Link 
            href="#features" 
            className="premium-button border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-300 text-sm sm:text-base"
          >
            Learn More
          </Link>
        </div>
      </div>
      
      {/* SVG illustration area */}
      <div className="flex-1 flex items-center justify-center relative w-full h-60 sm:h-72 md:h-80 lg:h-[32rem] mt-8 lg:mt-0">
        {/* Static SVG placeholder */}
        <div className="w-64 h-64 bg-blue-100/20 rounded-full flex items-center justify-center">
          <div className="text-blue-600 text-lg">Medical Network</div>
        </div>
      </div>
    </section>
  );

  // If not mounted, return static content
  if (!mounted) {
    return staticContent;
  }

  // Return animated content after mounting
  return (
    <section 
      className="relative flex flex-col-reverse lg:flex-row items-center justify-center lg:justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-h-screen"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div 
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-100/30 blur-3xl"
          initial={{ scale: 1, opacity: 0.3 }}
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-indigo-100/20 blur-3xl"
          initial={{ scale: 1, opacity: 0.2 }}
          animate={{ 
            scale: [1, 1.08, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col items-start justify-center z-10 w-full max-w-2xl lg:max-w-none py-8 sm:py-12 lg:py-16">
        <motion.div
          className="mb-6 inline-block"
          initial="hidden"
          animate="visible"
          variants={fadeUp(0.5)}
        >
          <span className="px-4 py-2 text-xs font-semibold tracking-wider uppercase bg-blue-50 text-blue-700 rounded-full border border-blue-100">
            Global Medical Network
          </span>
        </motion.div>
        
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeUp(1)}
        >
          <span className="block bg-gradient-to-tr from-blue-800 to-indigo-600 bg-clip-text text-transparent mb-2 leading-[1.3] sm:leading-[1.35] md:leading-[1.3] lg:leading-[1.25]">Connecting Urology</span>
          <span className="block bg-gradient-to-tr from-blue-700 to-indigo-500 bg-clip-text text-transparent mb-2 leading-[1.3] sm:leading-[1.35] md:leading-[1.3] lg:leading-[1.25]">Professionals</span>
          <span className="block text-blue-700 leading-[1.3] sm:leading-[1.35] md:leading-[1.3] lg:leading-[1.25]">Across the Globe</span>
        </motion.h1>
        
        <motion.p
          className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 max-w-xl leading-relaxed"
          initial="hidden"
          animate="visible"
          variants={fadeUp(2)}
        >
          UroCareerz is the trusted network for collaboration, learning, and career growth in urology. Join a global community of verified professionals and advance your career with confidence.
        </motion.p>
        
        <motion.div
          className="flex flex-wrap gap-4 mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeUp(3)}
        >
          <Link 
            href="/register" 
            className="premium-button bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 text-sm sm:text-base"
          >
            Join Now
          </Link>
          <Link 
            href="#features" 
            className="premium-button border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-300 text-sm sm:text-base"
          >
            Learn More
          </Link>
        </motion.div>
      </div>
      
      {/* SVG illustration area - responsive sizing */}
      <motion.div
        className="flex-1 flex items-center justify-center relative w-full h-60 sm:h-72 md:h-80 lg:h-[32rem] mt-8 lg:mt-0"
        initial="hidden"
        animate="visible"
        variants={fadeUp(5)}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Inline SVG: Premium medical cross with network motif */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 360 360"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Premium Medical Network"
            role="img"
            className="drop-shadow-xl max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px]"
            preserveAspectRatio="xMidYMid meet"
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
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            {/* Main circle with glow */}
            <motion.circle 
              cx="180" 
              cy="180" 
              r="150" 
              stroke="url(#outerRing)" 
              strokeWidth="8" 
              fill="#f8fafc" 
              filter="url(#shadow1)" 
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ 
                scale: [0.98, 1.02, 0.98],
                opacity: [0.9, 1, 0.9]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
            
            {/* Network paths */}
            <motion.path 
              d="M60 180a120 120 0 0 1 240 0" 
              stroke="#38bdf8" 
              strokeWidth="3" 
              fill="none" 
              opacity="0.7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
            />
            <motion.path 
              d="M300 180a120 120 0 0 1 -240 0" 
              stroke="#0ea5e9" 
              strokeWidth="3" 
              fill="none" 
              opacity="0.7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.8 }}
            />
            
            {/* Connection points with subtle animation */}
            <motion.circle 
              cx="60" 
              cy="180" 
              r="10" 
              fill="url(#goldAccent)" 
              filter="url(#shadow2)"
              initial="initial"
              animate="animate"
              variants={floatingAnimation(0)}
            />
            <motion.circle 
              cx="300" 
              cy="180" 
              r="10" 
              fill="url(#goldAccent)" 
              filter="url(#shadow2)"
              initial="initial"
              animate="animate"
              variants={floatingAnimation(1)}
            />
            <motion.circle 
              cx="180" 
              cy="60" 
              r="10" 
              fill="#2563eb" 
              filter="url(#shadow2)"
              initial="initial"
              animate="animate"
              variants={floatingAnimation(0.5)}
            />
            <motion.circle 
              cx="180" 
              cy="300" 
              r="10" 
              fill="#0ea5e9" 
              filter="url(#shadow2)"
              initial="initial"
              animate="animate"
              variants={floatingAnimation(1.5)}
            />
            
            {/* Medical cross symbol */}
            <g filter="url(#shadow3)">
              <motion.rect 
                x="155" 
                y="120" 
                width="50" 
                height="120" 
                rx="12" 
                fill="url(#crossGradient)"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
              />
              <motion.rect 
                x="120" 
                y="155" 
                width="120" 
                height="50" 
                rx="12" 
                fill="url(#crossGradient)"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
              />
              <motion.rect 
                x="155" 
                y="120" 
                width="50" 
                height="120" 
                rx="12" 
                fill="none" 
                stroke="url(#goldAccent)" 
                strokeWidth="3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 2 }}
              />
              <motion.rect 
                x="120" 
                y="155" 
                width="120" 
                height="50" 
                rx="12" 
                fill="none" 
                stroke="url(#goldAccent)" 
                strokeWidth="3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 2 }}
              />
            </g>
            
            {/* Filters for shadow effects */}
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
        
        {/* Decorative floating elements - responsive positioning */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-200"
          initial="initial"
          animate="animate"
          variants={floatingAnimation(0.2)}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/3 w-4 sm:w-6 h-4 sm:h-6 rounded-full bg-indigo-500/10 backdrop-blur-md border border-indigo-200"
          initial="initial"
          animate="animate"
          variants={floatingAnimation(1.2)}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-200"
          initial="initial"
          animate="animate"
          variants={floatingAnimation(0.7)}
        />
      </motion.div>
    </section>
  );
} 