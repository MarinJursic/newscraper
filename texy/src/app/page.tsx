"use client";

import {
  Play,
  FileText,
  Headphones,
  Globe,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

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
            <div className="p-8 bg-white grid grid-cols-12 gap-6 text-left h-[500px] overflow-hidden">
              {/* Sidebar */}
              <div className="col-span-3 border-r border-gray-100 pr-6 hidden md:block">
                <div className="space-y-6">
                  <div className="h-8 w-24 bg-gray-100 rounded-md"></div>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-50 rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-50 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-50 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Main Feed */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                <div className="flex justify-between items-center mb-8">
                  <div className="h-8 w-48 bg-gray-100 rounded-md"></div>
                  <div className="h-8 w-8 bg-gray-100 rounded-full"></div>
                </div>

                {/* Article Card 1 */}
                <div className="p-6 rounded-xl border border-gray-100 bg-gray-50/50 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="h-6 w-2/3 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-violet-100 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-100 rounded"></div>
                    <div className="h-4 w-full bg-gray-100 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
                  </div>
                </div>

                {/* Article Card 2 */}
                <div className="p-6 rounded-xl border border-gray-100 bg-gray-50/50 space-y-4 opacity-60">
                  <div className="flex justify-between items-start">
                    <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-violet-100 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-100 rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
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
