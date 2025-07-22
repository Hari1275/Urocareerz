'use client';

import Link from "next/link";
import HeroSection from "../components/hero-section";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

function fadeUp(i = 1): Variants {
  return {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.12,
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl font-extrabold bg-gradient-to-tr from-blue-700 to-indigo-600 bg-clip-text text-transparent tracking-tight">UroCareerz</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-gray-700 hover:text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all">Log in</Link>
            <Link href="/register" className="premium-button bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white shadow-md shadow-blue-500/10 text-sm">Get Started</Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section (Animated) */}
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="premium-section bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 gradient-text-primary"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeUp(1)}
          >
            Why UroCareerz?
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="premium-card premium-card-hover p-4 sm:p-6 flex flex-col items-center text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp(i + 1)}
              >
                {i === 0 && (
                  <>
                    <div className="w-14 sm:w-16 h-14 sm:h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100 mb-4 sm:mb-5 shadow-md shadow-blue-100">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-gray-900">Verified Professionals</h3>
                    <p className="text-sm sm:text-base text-gray-600">All members are vetted to ensure a trusted, high-quality network.</p>
                  </>
                )}
                {i === 1 && (
                  <>
                    <div className="w-14 sm:w-16 h-14 sm:h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100 mb-4 sm:mb-5 shadow-md shadow-blue-100">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-gray-900">Global Community</h3>
                    <p className="text-sm sm:text-base text-gray-600">Connect with peers, mentors, and experts from over 100 countries.</p>
                  </>
                )}
                {i === 2 && (
                  <>
                    <div className="w-14 sm:w-16 h-14 sm:h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100 mb-4 sm:mb-5 shadow-md shadow-blue-100">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-gray-900">Career Opportunities</h3>
                    <p className="text-sm sm:text-base text-gray-600">Discover jobs, fellowships, and research collaborations tailored for urology.</p>
                  </>
                )}
                {i === 3 && (
                  <>
                    <div className="w-14 sm:w-16 h-14 sm:h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100 mb-4 sm:mb-5 shadow-md shadow-blue-100">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.105.895-2 2-2s2 .895 2 2-.895 2-2 2-2-.895-2-2zm0 0V7m0 4v4m0 0a4 4 0 100-8 4 4 0 000 8z" /></svg>
                    </div>
                    <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-gray-900">Secure & Private</h3>
                    <p className="text-sm sm:text-base text-gray-600">Your data and conversations are protected with industry-leading security.</p>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="premium-section bg-gradient-to-br from-blue-50 to-indigo-50 dot-pattern">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 gradient-text-blue"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeUp(1)}
          >
            How It Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center text-center premium-card p-6 sm:p-8 bg-white/80 backdrop-blur-sm"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp(i + 1)}
              >
                <div className="w-14 sm:w-16 h-14 sm:h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 mb-4 sm:mb-5 shadow-lg text-white">
                  <span className="text-xl sm:text-2xl font-bold">{i + 1}</span>
                </div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3 text-gray-900">
                  {i === 0 && 'Join the Network'}
                  {i === 1 && 'Connect & Collaborate'}
                  {i === 2 && 'Grow Your Career'}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {i === 0 && 'Sign up and create your professional profile. Verification ensures a trusted community.'}
                  {i === 1 && 'Find mentors, mentees, and peers. Engage in discussions, share knowledge, and build your network.'}
                  {i === 2 && 'Access exclusive opportunities, resources, and support to advance your career in urology.'}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials / Trust Signals */}
      <section className="premium-section bg-white/90">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 gradient-text-primary"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeUp(1)}
          >
            Trusted by Urology Professionals Worldwide
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                className="premium-card p-6 sm:p-8 relative"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp(i + 1)}
              >
                <div className="absolute top-0 right-0 w-10 sm:w-12 h-10 sm:h-12 -mt-3 sm:-mt-4 -mr-3 sm:-mr-4 bg-blue-50 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
                {i === 0 && (
                  <>
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center font-bold text-blue-700 text-base sm:text-lg shadow-md">JD</div>
                      <div>
                        <div className="font-semibold text-gray-900 text-base sm:text-lg">Dr. Jane Doe</div>
                        <div className="text-xs sm:text-sm text-blue-600">Urology Resident</div>
                      </div>
                    </div>
                    <blockquote className="italic text-gray-600 text-base sm:text-lg leading-relaxed">&ldquo;UroCareerz connected me with mentors who truly understand my field. The global reach and professionalism are unmatched.&rdquo;</blockquote>
                  </>
                )}
                {i === 1 && (
                  <>
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center font-bold text-blue-700 text-base sm:text-lg shadow-md">MS</div>
                      <div>
                        <div className="font-semibold text-gray-900 text-base sm:text-lg">Dr. Michael Smith</div>
                        <div className="text-xs sm:text-sm text-blue-600">Chief of Urology</div>
                      </div>
                    </div>
                    <blockquote className="italic text-gray-600 text-base sm:text-lg leading-relaxed">&ldquo;A secure, professional space for urologists to connect, collaborate, and grow. Highly recommended for anyone in the field.&rdquo;</blockquote>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 sm:py-20 lg:py-28 bg-gradient-to-br from-blue-700 to-indigo-700 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl"></div>
        </div>
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeUp(1)}
          >
            Ready to Join the Leading Urology Network?
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg text-blue-100 mb-8 sm:mb-10 max-w-2xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeUp(2)}
          >
            Sign up today and connect with professionals who share your passion for excellence in urology.
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeUp(3)}
          >
            <Link href="/register" className="premium-button bg-white text-blue-700 hover:bg-blue-50 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-xl shadow-blue-800/20 text-base sm:text-lg">
              Get Started
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white/90 border-t border-blue-100 py-8 sm:py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center gap-3">
            <span className="text-lg sm:text-xl font-extrabold bg-gradient-to-tr from-blue-700 to-indigo-600 bg-clip-text text-transparent tracking-tight">UroCareerz</span>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 my-3 sm:my-4">
              <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">About</a>
              <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Contact</a>
            </div>
            <span className="text-xs sm:text-sm text-gray-400">&copy; {new Date().getFullYear()} UroCareerz. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
