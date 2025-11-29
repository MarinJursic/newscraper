"use client";

import { Play, FileText, Headphones, Globe, ArrowRight, Shield, Activity, CheckCircle, CheckCircle2, TrendingUp, ArrowUpRight, Home, Hash, Bookmark, Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-violet-100 selection:text-violet-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-serif font-bold tracking-tight">
                Blinkfeed
              </span>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a
                href="#features"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                How it Works
              </a>
              <button
                className="cursor-pointer bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
                onClick={() => router.push("/onboarding")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8 mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-medium mb-8 border border-violet-100">
          <span className="flex h-2 w-2 rounded-full bg-violet-600 mr-2"></span>
          Now in Public Beta
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 max-w-4xl">
          Knowledge, <span className="text-slate-400">not just links.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
          Blinkfeed filters the noise. Get AI-curated summaries, audio
          briefings, and developer-centric intelligence from The Hacker News in
          seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <button className="cursor-pointer group flex items-center justify-center gap-3 bg-violet-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-violet-700 transition-all shadow-lg hover:shadow-violet-200">
            <Play className="w-5 h-5 fill-current" />
            Play Daily Briefing
            <div className="flex gap-1 items-end h-4 ml-2">
              <span className="w-1 h-2 bg-white/60 rounded-full animate-[pulse_1s_ease-in-out_infinite]"></span>
              <span className="w-1 h-4 bg-white/80 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]"></span>
              <span className="w-1 h-3 bg-white/60 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]"></span>
            </div>
          </button>
        </div>

        {/* Browser Window Mockup */}
        <div className="relative w-full max-w-5xl mx-auto perspective-1000">
          <div className="relative rounded-xl bg-white border border-gray-200 shadow-2xl overflow-hidden transform transition-transform hover:scale-[1.01] duration-500">
            {/* Browser Header */}
            <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-400 flex items-center gap-2 w-64 justify-center">
                  <Shield className="w-3 h-3" />
                  blinkfeed.ai/dashboard
                </div>
              </div>
            </div>

            {/* Mockup Content */}
            <div className="bg-white grid grid-cols-12 text-left h-[500px] overflow-hidden">
              {/* Sidebar */}
              <div className="col-span-3 border-r border-gray-200 bg-white p-5 hidden md:flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Logo */}
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-serif tracking-tight text-slate-900">
                      Blinkfeed.
                    </span>
                  </div>

                  {/* Nav Links */}
                  <nav className="space-y-1">
                    <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-100 text-slate-900">
                      <Home className="w-5 h-5" />
                      <span className="font-medium">Home</span>
                    </div>
                    <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-gray-50">
                      <Hash className="w-5 h-5" />
                      <span className="font-medium">Explore</span>
                    </div>
                    <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-gray-50">
                      <Globe className="w-5 h-5" />
                      <span className="font-medium">Impact Map</span>
                    </div>
                    
                    <div className="h-px bg-gray-200 my-2"></div>
                    
                    <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-gray-50">
                      <Bookmark className="w-5 h-5" />
                      <span className="font-medium">Saved</span>
                    </div>
                    <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-gray-50">
                      <Folder className="w-5 h-5" />
                      <span className="font-medium">History</span>
                    </div>
                  </nav>
                </div>

                {/* User Section */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                      <span className="text-violet-600 font-bold text-sm">JD</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-3 w-20 bg-gray-200 rounded mb-1"></div>
                      <div className="h-2 w-32 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Feed */}
              <div className="col-span-12 md:col-span-9 flex flex-col h-full">
                {/* Header with Category Filters */}
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-slate-900 text-white shadow-md whitespace-nowrap flex-shrink-0">
                      All
                    </button>
                    <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-slate-600 hover:bg-gray-200 whitespace-nowrap flex-shrink-0">
                      Security
                    </button>
                    <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-slate-600 hover:bg-gray-200 whitespace-nowrap flex-shrink-0">
                      AI
                    </button>
                    <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-slate-600 hover:bg-gray-200 whitespace-nowrap flex-shrink-0">
                      Legal
                    </button>
                    <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-slate-600 hover:bg-gray-200 whitespace-nowrap flex-shrink-0">
                      Market
                    </button>
                    <button className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-slate-600 hover:bg-gray-200 whitespace-nowrap flex-shrink-0">
                      DevOps
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Realistic Article Card 1 */}
                <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        The Hacker News
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] text-slate-400">
                        2 hours ago
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] text-violet-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Actionable
                      </span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-3 leading-snug group-hover:text-violet-600 transition-colors">
                    Critical Zero-Day Vulnerability Discovered in Popular Authentication Framework
                  </h3>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3">
                    Security researchers have identified a zero-day vulnerability in a widely-used authentication library that could allow attackers to bypass multi-factor authentication. The flaw affects over 2.3 million applications globally. Immediate patching is recommended for organizations using affected versions.
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      Zero-Day
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      Authentication
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      Critical
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium px-2 py-1 rounded-md text-red-700 bg-red-50">
                        Security
                      </span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 font-medium flex items-center gap-1 px-1.5 py-0.5 rounded">
                        <ArrowUpRight className="w-3 h-3" />
                        87%
                      </span>
                      <span className="text-[10px] text-violet-600 font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        92
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
                  </div>
                </div>

                {/* Realistic Article Card 2 */}
                <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group opacity-75">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        The Hacker News
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] text-slate-400">
                        5 hours ago
                      </span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-3 leading-snug group-hover:text-violet-600 transition-colors">
                    New AI-Powered Threat Detection System Reduces False Positives by 94%
                  </h3>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
                    A machine learning model trained on 10 years of security incident data has achieved unprecedented accuracy in identifying real threats while dramatically reducing false alarms.
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      AI
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      Threat Detection
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium px-2 py-1 rounded-md text-emerald-700 bg-emerald-50">
                        AI
                      </span>
                      <span className="text-[10px] text-violet-600 font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        78
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
                  </div>
                </div>
                </div>
              </div>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Feature Grid (Bento) */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Adaptive Perspectives
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Don't just read the news; understand it from your angle.
                Instantly switch between a high-level strategic overview and a
                detailed deep-dive, tailored specifically to your professional
                role.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-6 text-violet-600">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Blinkfeed Audio
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Transform your morning reading list into a studio-quality
                personal podcast. AI synthesizes your key topics into a coherent
                audio narrative, perfect for your commute.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Global Pulse
              </h3>
              <p className="text-slate-600 leading-relaxed">
                News doesn't happen in a void. Visualize breaking stories and
                viral trends on an interactive 3D globe to instantly understand
                the geopolitical context and location of every event.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">
              How Blinkfeed Works
            </h2>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              <div className="flex flex-col items-center text-center bg-white p-4">
                <div className="w-16 h-16 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Activity className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">
                  Connect Source
                </h4>
                <p className="text-slate-500 text-sm">
                  Aggregates data from The Hacker News.
                </p>
              </div>

              <div className="flex flex-col items-center text-center bg-white p-4">
                <div className="w-16 h-16 bg-white border-2 border-violet-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">AI</span>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">
                  AI Analysis
                </h4>
                <p className="text-slate-500 text-sm">
                  Processes content to extract key insights, code, and context.
                </p>
              </div>

              <div className="flex flex-col items-center text-center bg-white p-4">
                <div className="w-16 h-16 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">
                  Intelligence Dashboard
                </h4>
                <p className="text-slate-500 text-sm">
                  Delivers structured knowledge ready for action.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-medium text-slate-900 mb-12">
            "Simplifying tech news for{" "}
            <span className="text-violet-600 font-bold">500+ developers</span>."
          </h2>

          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale">
            {/* Placeholder Logos */}
            <div className="h-8 w-24 bg-slate-400 rounded"></div>
            <div className="h-8 w-24 bg-slate-400 rounded"></div>
            <div className="h-8 w-24 bg-slate-400 rounded"></div>
            <div className="h-8 w-24 bg-slate-400 rounded"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-serif font-bold text-slate-900">
              Blinkfeed
            </span>
            <span className="text-slate-400 text-sm">© 2024</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-900">
              Terms
            </a>
            <a href="#" className="hover:text-slate-900">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
