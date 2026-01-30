import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-brand-black font-sans text-brand-text overflow-hidden relative">
            {/* Background Spotlights */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-orange/10 rounded-full blur-[120px] -z-10" />

            <Navbar onGetStarted={onGetStarted} />

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-4 min-h-screen flex flex-col justify-center items-center text-center">

                {/* Status Pill */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs text-brand-textMuted font-medium uppercase tracking-wide">Available now, only 3 spots left</span>
                </motion.div>

                {/* Main Heading */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl mx-auto"
                >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4">
                        <span className="text-brand-orange">Automation</span> Agency
                    </h1>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
                        Beyond <Sparkles className="inline-block text-white mx-2 w-12 h-12 md:w-20 md:h-20" /> Limits.
                    </h1>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent pb-4">
                        Amplified With AI.
                    </h1>
                </motion.div>

                {/* Subtext */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className="mt-8 text-lg text-brand-textMuted max-w-xl mx-auto"
                >
                    Design services at your fingertips. Pause or cancel anytime.
                </motion.p>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12"
                >
                    <button
                        onClick={onGetStarted}
                        className="group relative inline-flex items-center gap-2 bg-white/5 border border-white/10 px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                    >
                        <span className="font-medium">Learn More</span>
                        <ArrowUpRight size={18} className="text-brand-textMuted group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />

                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 rounded-xl ring-1 ring-white/20 group-hover:ring-white/40 transition-all pointer-events-none" />
                    </button>
                </motion.div>
            </section>
        </div>
    );
}
