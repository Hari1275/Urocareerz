'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'MENTEE' | 'MENTOR'>('MENTEE');
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include', // Include cookies
        });
        
        if (response.ok) {
          // User is authenticated, redirect to dashboard
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold gradient-text">UroCareerz</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Log in
              </Link>
              <Link 
                href="/register" 
                className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-hero-pattern py-20 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Connect with Urology Professionals for Career Growth
              </h1>
              <p className="text-lg md:text-xl opacity-90">
                UroCareerz is the premier platform for mentorship in the field of urology, 
                connecting aspiring professionals with experienced mentors.
              </p>
              <div className="pt-4">
                <div className="bg-white/20 backdrop-blur-sm p-1 rounded-lg inline-flex">
                  <button
                    onClick={() => setActiveTab('MENTEE')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'MENTEE' 
                        ? 'bg-white text-primary-700 shadow-sm' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    I need a mentor
                  </button>
                  <button
                    onClick={() => setActiveTab('MENTOR')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'MENTOR' 
                        ? 'bg-white text-primary-700 shadow-sm' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    I want to mentor
                  </button>
                </div>
              </div>
              <button 
                onClick={() => router.push(`/register?role=${activeTab}`)}
                className="mt-2 bg-white text-primary-700 hover:bg-gray-100 px-8 py-3 rounded-md font-medium shadow-lg transition-all"
              >
                Get Started
              </button>
            </div>
            <div className="hidden md:block">
              <div className="relative h-96 w-full">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20"></div>
                  <div className="relative h-full w-full p-8 flex items-center justify-center">
                    <Image 
                      src="/globe.svg"
                      alt="UroCareerz Network"
                      width={350}
                      height={350}
                      className="opacity-90"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold gradient-text">How UroCareerz Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform makes it easy to find the right mentor or mentee in the field of urology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-gradient rounded-xl p-6 transition-all hover:shadow-lg">
              <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Create Your Profile</h3>
              <p className="mt-2 text-gray-600">
                Build a comprehensive profile highlighting your experience, interests, and goals in urology
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="card-gradient rounded-xl p-6 transition-all hover:shadow-lg">
              <div className="h-12 w-12 rounded-lg bg-secondary-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Find the Perfect Match</h3>
              <p className="mt-2 text-gray-600">
                Our intelligent matching system connects you with mentors or mentees that align with your career goals
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="card-gradient rounded-xl p-6 transition-all hover:shadow-lg">
              <div className="h-12 w-12 rounded-lg bg-accent-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Grow Your Career</h3>
              <p className="mt-2 text-gray-600">
                Schedule meetings, track progress, and achieve your professional goals in the field of urology
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold gradient-text">Success Stories</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              See how UroCareerz has helped professionals advance their careers in urology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  <span className="text-primary-700 font-bold text-lg">JD</span>
                </div>
                <div>
                  <h4 className="font-semibold">Dr. Jane Doe</h4>
                  <p className="text-sm text-gray-500">Urology Resident</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Finding a mentor in my specialized field was challenging until I discovered UroCareerz. 
                The platform connected me with an experienced urologist who has guided me through critical 
                career decisions and helped me secure a competitive fellowship."
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-secondary-100 flex items-center justify-center mr-4">
                  <span className="text-secondary-700 font-bold text-lg">MS</span>
                </div>
                <div>
                  <h4 className="font-semibold">Dr. Michael Smith</h4>
                  <p className="text-sm text-gray-500">Chief of Urology</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "As a mentor on UroCareerz, I've had the privilege of guiding the next generation of urologists. 
                The platform makes it easy to share my knowledge and experience, while also keeping me connected 
                to fresh perspectives and emerging trends in the field."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to advance your career in urology?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join UroCareerz today and connect with professionals who can help you achieve your goals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register?role=MENTEE" 
              className="btn-primary text-center"
            >
              Find a Mentor
            </Link>
            <Link 
              href="/register?role=MENTOR" 
              className="btn-secondary text-center"
            >
              Become a Mentor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">UroCareerz</h3>
              <p className="text-gray-400">
                Connecting mentors and mentees in the field of urology
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">How it Works</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Testimonials</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} UroCareerz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
