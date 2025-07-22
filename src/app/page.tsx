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
      <nav className="w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl font-extrabold bg-gradient-to-tr from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">UroCareerz</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all">Log in</Link>
            <Link href="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg transition-all">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section (Animated) */}
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="w-full py-16 sm:py-24 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeUp(1)}
          >
            Why UroCareerz?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-blue-100"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp(i + 1)}
              >
                {i === 0 && (
                  <>
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-50 mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Verified Professionals</h3>
                    <p className="text-gray-600 text-sm">All members are vetted to ensure a trusted, high-quality network.</p>
                  </>
                )}
                {i === 1 && (
                  <>
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-50 mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Global Community</h3>
                    <p className="text-gray-600 text-sm">Connect with peers, mentors, and experts from over 100 countries.</p>
                  </>
                )}
                {i === 2 && (
                  <>
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-50 mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Career Opportunities</h3>
                    <p className="text-gray-600 text-sm">Discover jobs, fellowships, and research collaborations tailored for urology.</p>
                  </>
                )}
                {i === 3 && (
                  <>
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-50 mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.105.895-2 2-2s2 .895 2 2-.895 2-2 2-2-.895-2-2zm0 0V7m0 4v4m0 0a4 4 0 100-8 4 4 0 000 8z" /></svg>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
                    <p className="text-gray-600 text-sm">Your data and conversations are protected with industry-leading security.</p>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 sm:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeUp(1)}
          >
            How It Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp(i + 1)}
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                  <span className="text-2xl font-bold text-blue-700">{i + 1}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {i === 0 && 'Join the Network'}
                  {i === 1 && 'Connect & Collaborate'}
                  {i === 2 && 'Grow Your Career'}
                </h3>
                <p className="text-gray-600 text-sm">
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
      <section className="w-full py-16 sm:py-24 bg-white/90">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeUp(1)}
          >
            Trusted by Urology Professionals Worldwide
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp(i + 1)}
              >
                {i === 0 && (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg">JD</div>
                      <div>
                        <div className="font-semibold text-gray-900">Dr. Jane Doe</div>
                        <div className="text-xs text-blue-600">Urology Resident</div>
                      </div>
                    </div>
                    <blockquote className="italic text-gray-600">&ldquo;UroCareerz connected me with mentors who truly understand my field. The global reach and professionalism are unmatched.&rdquo;</blockquote>
                  </>
                )}
                {i === 1 && (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg">MS</div>
                      <div>
                        <div className="font-semibold text-gray-900">Dr. Michael Smith</div>
                        <div className="text-xs text-blue-600">Chief of Urology</div>
                      </div>
                    </div>
                    <blockquote className="italic text-gray-600">&ldquo;A secure, professional space for urologists to connect, collaborate, and grow. Highly recommended for anyone in the field.&rdquo;</blockquote>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 sm:py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-white mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeUp(1)}
          >
            Ready to Join the Leading Urology Network?
          </motion.h2>
          <motion.p
            className="text-lg text-blue-100 mb-8"
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
            <Link href="/register" className="inline-block bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-blue-50 transition-all text-lg">Get Started</Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white/80 border-t border-blue-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-lg font-extrabold bg-gradient-to-tr from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">UroCareerz</span>
            <span className="text-xs text-gray-400">&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
