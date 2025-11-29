import React from 'react';
import { Play, Pause } from 'lucide-react';

type Category = 'All' | 'Python' | 'Security' | 'AI' | 'Startups' | 'Crypto';

interface HeroSectionProps {
    activeCategory: Category;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ activeCategory, isPlaying, setIsPlaying }) => {
    const getHeroStyles = () => {
        switch (activeCategory) {
            case 'Security': return 'bg-red-50/30 border-red-100';
            case 'Python': return 'bg-blue-50/30 border-blue-100';
            case 'AI': return 'bg-emerald-50/30 border-emerald-100';
            case 'Crypto': return 'bg-amber-50/30 border-amber-100';
            case 'Startups': return 'bg-purple-50/30 border-purple-100';
            default: return 'bg-slate-50/30 border-slate-100';
        }
    };

    return (
        <div className={`rounded-3xl border shadow-sm overflow-hidden transition-colors duration-500 ${getHeroStyles()}`}>
            <div className="flex flex-col md:flex-row">
                <div className="md:w-[75%] p-8 flex flex-col justify-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {activeCategory === 'All' ? 'Good Morning, User.' : `State of ${activeCategory}.`}
                    </h1>
                    <p className="text-slate-600 text-lg leading-relaxed">
                        {activeCategory === 'All'
                            ? 'Markets are experiencing volatility as new AI regulations are discussed in the EU. Meanwhile, a critical vulnerability in OpenSSH is causing widespread concern among security teams. In tech, Python 3.13 introduces experimental no-GIL builds.'
                            : `Here is the latest intelligence for ${activeCategory}. Key trends indicate a shift towards more robust security protocols and increased adoption of AI-driven tools in the sector.`}
                    </p>
                </div>

                <div className="md:w-[25%] bg-white/50 border-t md:border-t-0 md:border-l border-gray-100 p-6 flex flex-col justify-center items-center text-center relative">
                    <div className="mb-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Audio Brief</div>
                        <div className="text-sm font-bold text-slate-900">
                            {activeCategory === 'All' ? 'Morning Mix' : `${activeCategory}`}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 active:scale-95 bg-violet-600"
                    >
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                    </button>

                    <div className="text-xs font-mono text-slate-400 mt-3">03:45</div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
