import Link from "next/link";
import Image from "next/image";

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

      {/* Hero Section */}
      <section className="relative flex flex-col-reverse lg:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 sm:pb-24 gap-8 w-full">
        <div className="flex-1 flex flex-col items-start justify-center z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900">
            <span className="block bg-gradient-to-tr from-blue-700 to-indigo-700 bg-clip-text text-transparent">Connecting Urology Professionals</span>
            <span className="block text-blue-600">Across the Globe</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl">
            UroCareerz is the trusted network for collaboration, learning, and career growth in urology. Join a global community of verified professionals and advance your career with confidence.
          </p>
          <div className="flex gap-4 mb-8">
            <Link href="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all">Join Now</Link>
            <Link href="#features" className="px-6 py-3 rounded-xl font-semibold border border-blue-600 text-blue-700 bg-white hover:bg-blue-50 transition-all">Learn More</Link>
          </div>
          <div className="flex gap-8 mt-4">
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
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center relative w-full h-80 lg:h-[32rem]">
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
              {/* Outer network ring with gradient and shadow */}
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
              {/* Network arcs */}
              <path d="M60 180a120 120 0 0 1 240 0" stroke="#38bdf8" strokeWidth="3" fill="none" opacity="0.7" />
              <path d="M300 180a120 120 0 0 1 -240 0" stroke="#0ea5e9" strokeWidth="3" fill="none" opacity="0.7" />
              {/* Network nodes */}
              <circle cx="60" cy="180" r="10" fill="url(#goldAccent)" filter="url(#shadow2)" />
              <circle cx="300" cy="180" r="10" fill="url(#goldAccent)" filter="url(#shadow2)" />
              <circle cx="180" cy="60" r="10" fill="#2563eb" filter="url(#shadow2)" />
              <circle cx="180" cy="300" r="10" fill="#0ea5e9" filter="url(#shadow2)" />
              {/* Medical cross (center) */}
              <g filter="url(#shadow3)">
                <rect x="155" y="120" width="50" height="120" rx="12" fill="url(#crossGradient)" />
                <rect x="120" y="155" width="120" height="50" rx="12" fill="url(#crossGradient)" />
                {/* Gold accent border */}
                <rect x="155" y="120" width="50" height="120" rx="12" fill="none" stroke="url(#goldAccent)" strokeWidth="3" />
                <rect x="120" y="155" width="120" height="50" rx="12" fill="none" stroke="url(#goldAccent)" strokeWidth="3" />
              </g>
              {/* SVG drop shadows */}
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
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-16 sm:py-24 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">Why UroCareerz?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-blue-100">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-50 mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Verified Professionals</h3>
              <p className="text-gray-600 text-sm">All members are vetted to ensure a trusted, high-quality network.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-blue-100">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-50 mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Global Community</h3>
              <p className="text-gray-600 text-sm">Connect with peers, mentors, and experts from over 100 countries.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-blue-100">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-50 mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Career Opportunities</h3>
              <p className="text-gray-600 text-sm">Discover jobs, fellowships, and research collaborations tailored for urology.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-blue-100">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-50 mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.105.895-2 2-2s2 .895 2 2-.895 2-2 2-2-.895-2-2zm0 0V7m0 4v4m0 0a4 4 0 100-8 4 4 0 000 8z" /></svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">Your data and conversations are protected with industry-leading security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 sm:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                <span className="text-2xl font-bold text-blue-700">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Join the Network</h3>
              <p className="text-gray-600 text-sm">Sign up and create your professional profile. Verification ensures a trusted community.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                <span className="text-2xl font-bold text-blue-700">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Connect & Collaborate</h3>
              <p className="text-gray-600 text-sm">Find mentors, mentees, and peers. Engage in discussions, share knowledge, and build your network.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                <span className="text-2xl font-bold text-blue-700">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Grow Your Career</h3>
              <p className="text-gray-600 text-sm">Access exclusive opportunities, resources, and support to advance your career in urology.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Trust Signals */}
      <section className="w-full py-16 sm:py-24 bg-white/90">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">Trusted by Urology Professionals Worldwide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg">JD</div>
                <div>
                  <div className="font-semibold text-gray-900">Dr. Jane Doe</div>
                  <div className="text-xs text-blue-600">Urology Resident</div>
                </div>
              </div>
              <blockquote className="italic text-gray-600">“UroCareerz connected me with mentors who truly understand my field. The global reach and professionalism are unmatched.”</blockquote>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg">MS</div>
                <div>
                  <div className="font-semibold text-gray-900">Dr. Michael Smith</div>
                  <div className="text-xs text-blue-600">Chief of Urology</div>
                </div>
              </div>
              <blockquote className="italic text-gray-600">“A secure, professional space for urologists to connect, collaborate, and grow. Highly recommended for anyone in the field.”</blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 sm:py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Join the Leading Urology Network?</h2>
          <p className="text-lg text-blue-100 mb-8">Sign up today and connect with professionals who share your passion for excellence in urology.</p>
          <Link href="/register" className="inline-block bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-blue-50 transition-all text-lg">Get Started</Link>
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
