import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, Code, Briefcase, Coffee, Zap, Brain, Github, Loader2, Server, Shield, Smartphone, Terminal, TrendingUp, Users, BookOpen, Headphones, Mail, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Step = 'auth' | 'profession' | 'stack' | 'attention' | 'calibration';
type AuthMode = 'signup' | 'login';

const GoogleLogo = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </svg>
);

const OnboardingWizard = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>('auth');
    const [authMode, setAuthMode] = useState<AuthMode>('signup');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: '',
        stack: [] as string[],
        attentionSpan: '',
    });

    const stepOrder: Step[] = ['auth', 'profession', 'stack', 'attention', 'calibration'];

    const handleNext = (nextStep: Step) => {
        setCurrentStep(nextStep);
    };

    const handleBack = () => {
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(stepOrder[currentIndex - 1]);
        }
    };

    const toggleStack = (tech: string) => {
        setFormData(prev => ({
            ...prev,
            stack: prev.stack.includes(tech)
                ? prev.stack.filter(t => t !== tech)
                : [...prev.stack, tech]
        }));
    };

    // Calibration Animation
    const [calibrationText, setCalibrationText] = useState('Building your profile...');

    useEffect(() => {
        if (currentStep === 'calibration') {
            const timers = [
                setTimeout(() => setCalibrationText('Analyzing 1,400 sources...'), 1500),
                setTimeout(() => setCalibrationText('Personalizing Dashboard...'), 3000),
                setTimeout(() => router.push('/'), 4500) // Redirect to dashboard (home for now)
            ];
            return () => timers.forEach(clearTimeout);
        }
    }, [currentStep, router]);

    // Dynamic Preview Content
    const getPreviewContent = () => {
        switch (currentStep) {
            case 'auth':
                return (
                    <div className="space-y-6 animate-in fade-in duration-700">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 opacity-50 scale-95 blur-[1px]">
                            <div className="h-4 w-3/4 bg-gray-100 rounded mb-4"></div>
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-gray-50 rounded"></div>
                                <div className="h-3 w-5/6 bg-gray-50 rounded"></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transform scale-100 z-10 relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-bold">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900">Secure Access</div>
                                    <div className="text-xs text-slate-500">Encrypted & Private</div>
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm">Join the community of developers building the future.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 opacity-50 scale-95 blur-[1px]">
                            <div className="h-4 w-1/2 bg-gray-100 rounded mb-4"></div>
                            <div className="h-20 bg-gray-50 rounded w-full"></div>
                        </div>
                    </div>
                );
            case 'profession':
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Code className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">Tailored Feed</div>
                                        <div className="text-xs text-slate-500">Based on your role</div>
                                    </div>
                                </div>
                                <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-500">Preview</div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    <div className="h-2 w-5/6 bg-gray-100 rounded"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                                    <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                        </div>
                        {formData.role && (
                            <div className="bg-violet-600 text-white p-4 rounded-xl shadow-lg transform rotate-1 animate-in zoom-in duration-300">
                                <div className="font-medium text-sm mb-1">Role Selected</div>
                                <div className="font-bold text-lg capitalize">{formData.role.replace('_', ' ')}</div>
                            </div>
                        )}
                    </div>
                );
            case 'stack':
                return (
                    <div className="relative h-full w-full flex items-center justify-center animate-in fade-in duration-500">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-64 h-64 border border-dashed border-gray-200 rounded-full animate-spin-slow"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-48 h-48 border border-dashed border-gray-200 rounded-full animate-reverse-spin"></div>
                        </div>
                        <div className="relative z-10 grid grid-cols-2 gap-4">
                            {formData.stack.map((tech, idx) => (
                                <div key={tech} className="bg-white px-4 py-2 rounded-lg shadow-md border border-gray-100 text-sm font-medium text-slate-700 animate-in zoom-in duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                                    {tech}
                                </div>
                            ))}
                            {formData.stack.length === 0 && (
                                <div className="text-slate-400 text-sm font-medium">Select your stack...</div>
                            )}
                        </div>
                    </div>
                );
            case 'attention':
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="font-semibold text-slate-900">Daily Briefing</div>
                                <div className="text-xs text-slate-500">{new Date().toLocaleDateString()}</div>
                            </div>

                            {formData.attentionSpan === 'sprinter' && (
                                <div className="space-y-3 animate-in fade-in">
                                    <div className="flex gap-3 items-start">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0"></div>
                                        <div className="text-sm text-slate-600">React 19 released with new compiler.</div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0"></div>
                                        <div className="text-sm text-slate-600">AWS Lambda adds Ruby 3.2 support.</div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0"></div>
                                        <div className="text-sm text-slate-600">Docker Desktop 4.28 brings performance boost.</div>
                                    </div>
                                </div>
                            )}

                            {formData.attentionSpan === 'commuter' && (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                                        <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600">
                                            <Headphones className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">Daily Mix</div>
                                            <div className="text-xs text-slate-500">12 min • 4 stories</div>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded"></div>
                                    <div className="h-2 w-full bg-gray-100 rounded"></div>
                                    <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                                </div>
                            )}

                            {formData.attentionSpan === 'deep' && (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="border-l-2 border-violet-500 pl-4">
                                        <h4 className="font-medium text-slate-900 mb-1">Deep Dive: AI Regulations</h4>
                                        <p className="text-xs text-slate-500 leading-relaxed">Comprehensive analysis of the new EU AI Act and its impact on open source models...</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">Source A</div>
                                        <div className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">Source B</div>
                                        <div className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">Analysis</div>
                                    </div>
                                </div>
                            )}

                            {!formData.attentionSpan && (
                                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                    <Zap className="w-8 h-8 mb-2 opacity-50" />
                                    <span className="text-sm">Select density...</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-slate-900">
            {/* Left Side - Interactive Wizard */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-12 justify-center relative overflow-y-auto max-h-screen">
                <div className="max-w-xl mx-auto w-full py-8">
                    {/* Back Button */}
                    {currentStep !== 'auth' && currentStep !== 'calibration' && (
                        <button
                            onClick={handleBack}
                            className="absolute top-8 left-8 p-2 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}

                    {/* Progress Indicator */}
                    {currentStep !== 'auth' && (
                        <div className="mb-10 flex gap-2">
                            {['profession', 'stack', 'attention'].map((step, idx) => {
                                const currentIndex = stepOrder.indexOf(currentStep);
                                const stepIndex = stepOrder.indexOf(step as Step);
                                return (
                                    <div
                                        key={step}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${stepIndex <= currentIndex ? 'w-8 bg-violet-600' : 'w-2 bg-gray-200'
                                            }`}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* Step 1: Auth (Login / Signup) */}
                    {currentStep === 'auth' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold mb-2">Welcome to Texy.</h1>
                                <p className="text-slate-500">Your personalized intelligence hub awaits.</p>
                            </div>

                            {/* Auth Tabs */}
                            <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
                                <button
                                    onClick={() => setAuthMode('signup')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${authMode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Create Account
                                </button>
                                <button
                                    onClick={() => setAuthMode('login')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${authMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Sign In
                                </button>
                            </div>

                            <div className="space-y-3 mb-6">
                                <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-slate-700 p-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                                    <GoogleLogo />
                                    {authMode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
                                </button>
                                <button className="w-full flex items-center justify-center gap-3 bg-[#24292F] text-white p-3 rounded-lg font-medium hover:bg-[#24292F]/90 transition-colors">
                                    <Github className="w-5 h-5" />
                                    {authMode === 'signup' ? 'Sign up with GitHub' : 'Sign in with GitHub'}
                                </button>
                            </div>

                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-400">Or continue with email</span>
                                </div>
                            </div>

                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleNext('profession'); }}>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                                        placeholder="you@company.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-violet-600 text-white p-3 rounded-lg font-medium hover:bg-violet-700 transition-colors mt-4 flex items-center justify-center gap-2">
                                    {authMode === 'signup' ? 'Get Started' : 'Sign In'} <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Step 2: The Profession */}
                    {currentStep === 'profession' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-bold mb-2">What's your role?</h2>
                            <p className="text-slate-500 mb-8">We tailor the technical depth based on this.</p>

                            <div className="space-y-6">
                                {/* Group 1: Engineering */}
                                <div>
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Engineering</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'frontend', label: 'Frontend', icon: Code },
                                            { id: 'backend', label: 'Backend', icon: Server },
                                            { id: 'devops', label: 'DevOps', icon: Terminal },
                                            { id: 'mobile', label: 'Mobile', icon: Smartphone },
                                        ].map((role) => (
                                            <button
                                                key={role.id}
                                                onClick={() => setFormData({ ...formData, role: role.id })}
                                                className={`p-4 border rounded-xl text-left transition-all flex flex-col gap-2 ${formData.role === role.id
                                                        ? 'bg-violet-50 border-violet-500 ring-1 ring-violet-500'
                                                        : 'bg-white border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <role.icon className={`w-5 h-5 ${formData.role === role.id ? 'text-violet-600' : 'text-slate-400'}`} />
                                                <span className={`font-medium ${formData.role === role.id ? 'text-violet-900' : 'text-slate-700'}`}>{role.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Group 2: Leadership & Product */}
                                <div>
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Leadership & Product</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'cto', label: 'CTO / VP', icon: Users },
                                            { id: 'pm', label: 'Product Mgr', icon: Briefcase },
                                            { id: 'founder', label: 'Founder', icon: TrendingUp },
                                        ].map((role) => (
                                            <button
                                                key={role.id}
                                                onClick={() => setFormData({ ...formData, role: role.id })}
                                                className={`p-4 border rounded-xl text-left transition-all flex flex-col gap-2 ${formData.role === role.id
                                                        ? 'bg-violet-50 border-violet-500 ring-1 ring-violet-500'
                                                        : 'bg-white border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <role.icon className={`w-5 h-5 ${formData.role === role.id ? 'text-violet-600' : 'text-slate-400'}`} />
                                                <span className={`font-medium ${formData.role === role.id ? 'text-violet-900' : 'text-slate-700'}`}>{role.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Group 3: Specialized */}
                                <div>
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Specialized</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'security', label: 'Security', icon: Shield },
                                            { id: 'ai', label: 'Data / AI', icon: Brain },
                                        ].map((role) => (
                                            <button
                                                key={role.id}
                                                onClick={() => setFormData({ ...formData, role: role.id })}
                                                className={`p-4 border rounded-xl text-left transition-all flex flex-col gap-2 ${formData.role === role.id
                                                        ? 'bg-violet-50 border-violet-500 ring-1 ring-violet-500'
                                                        : 'bg-white border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <role.icon className={`w-5 h-5 ${formData.role === role.id ? 'text-violet-600' : 'text-slate-400'}`} />
                                                <span className={`font-medium ${formData.role === role.id ? 'text-violet-900' : 'text-slate-700'}`}>{role.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleNext('stack')}
                                disabled={!formData.role}
                                className={`w-full p-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-8 ${formData.role
                                        ? 'bg-violet-600 text-white hover:bg-violet-700'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Step 3: The Stack */}
                    {currentStep === 'stack' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-bold mb-2">What's in your stack?</h2>
                            <p className="text-slate-500 mb-8">Select at least 3 topics.</p>

                            <div className="flex flex-wrap gap-3 mb-8">
                                {['Python', 'React', 'AWS', 'Docker', 'CyberSec', 'Crypto', 'AI', 'Rust', 'Go', 'Kubernetes', 'Design', 'GraphQL', 'Node.js', 'Next.js'].map((tech) => (
                                    <button
                                        key={tech}
                                        onClick={() => toggleStack(tech)}
                                        className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${formData.stack.includes(tech)
                                                ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-200'
                                                : 'bg-white border-gray-200 text-slate-600 hover:border-violet-300'
                                            }`}
                                    >
                                        {tech}
                                        {formData.stack.includes(tech) && <Check className="w-3 h-3" />}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => handleNext('attention')}
                                disabled={formData.stack.length < 3}
                                className={`w-full p-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${formData.stack.length >= 3
                                        ? 'bg-violet-600 text-white hover:bg-violet-700'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Step 4: Attention Span */}
                    {currentStep === 'attention' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-bold mb-2">How much time do you have?</h2>
                            <p className="text-slate-500 mb-8">This defines your default summary density.</p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setFormData({ ...formData, attentionSpan: 'sprinter' })}
                                    className={`w-full p-5 text-left border rounded-xl transition-all flex items-start gap-4 ${formData.attentionSpan === 'sprinter'
                                            ? 'bg-violet-50 border-violet-500 ring-1 ring-violet-500'
                                            : 'bg-white border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`p-3 rounded-lg ${formData.attentionSpan === 'sprinter' ? 'bg-violet-200 text-violet-700' : 'bg-amber-100 text-amber-600'}`}>
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 text-lg">The Sprinter</h3>
                                        <p className="text-slate-500 text-sm mt-1">Less than 5 mins/day. TL;DR bullet points and short audio briefs.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setFormData({ ...formData, attentionSpan: 'commuter' })}
                                    className={`w-full p-5 text-left border rounded-xl transition-all flex items-start gap-4 ${formData.attentionSpan === 'commuter'
                                            ? 'bg-violet-50 border-violet-500 ring-1 ring-violet-500'
                                            : 'bg-white border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`p-3 rounded-lg ${formData.attentionSpan === 'commuter' ? 'bg-violet-200 text-violet-700' : 'bg-blue-100 text-blue-600'}`}>
                                        <Headphones className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 text-lg">The Commuter</h3>
                                        <p className="text-slate-500 text-sm mt-1">~15 mins/day. Standard summaries and medium-length podcasts.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setFormData({ ...formData, attentionSpan: 'deep' })}
                                    className={`w-full p-5 text-left border rounded-xl transition-all flex items-start gap-4 ${formData.attentionSpan === 'deep'
                                            ? 'bg-violet-50 border-violet-500 ring-1 ring-violet-500'
                                            : 'bg-white border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`p-3 rounded-lg ${formData.attentionSpan === 'deep' ? 'bg-violet-200 text-violet-700' : 'bg-emerald-100 text-emerald-600'}`}>
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 text-lg">The Deep Diver</h3>
                                        <p className="text-slate-500 text-sm mt-1">30+ mins/day. Full reports, source comparisons, and chatbot access.</p>
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={() => handleNext('calibration')}
                                disabled={!formData.attentionSpan}
                                className={`w-full p-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-8 ${formData.attentionSpan
                                        ? 'bg-violet-600 text-white hover:bg-violet-700'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Finish Setup <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Step 5: Calibration */}
                    {currentStep === 'calibration' && (
                        <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-700 py-12">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-violet-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                                <Loader2 className="w-16 h-16 text-violet-600 animate-spin relative z-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">{calibrationText}</h2>
                            <p className="text-slate-500">Building your custom knowledge graph...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Dynamic Visual */}
            <div className="hidden lg:flex w-1/2 bg-slate-50 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {/* Decorative Blobs */}
                <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 w-full max-w-md px-4">
                    {getPreviewContent()}
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
