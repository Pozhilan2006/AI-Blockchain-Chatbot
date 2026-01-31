import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-bg-main font-sans text-text-main overflow-hidden relative selection:bg-primary selection:text-white">
            <Navbar onGetStarted={onGetStarted} />

            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-dim rounded-[100%] blur-[120px] pointer-events-none -z-10 opacity-40" />

            <main className="pt-32 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">

                {/* Trust Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-card border border-bg-border mb-8 shadow-sm"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-xs font-medium text-text-muted tracking-wide uppercase">AI-Powered Web3 Intelligence</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight max-w-4xl"
                >
                    <span className="text-text-main">Intelligent Logic for</span><br />
                    <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">Decentralized Finance</span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-lg md:text-xl text-text-muted max-w-2xl mb-12 leading-relaxed"
                >
                    Execute complex blockchain transactions with natural language.
                    Non-custodial, precise, and built for the modern economy.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                >
                    <button
                        onClick={onGetStarted}
                        className="group relative px-8 py-4 bg-primary text-white font-semibold rounded-lg overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(255,159,28,0.3)] hover:-translate-y-0.5"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        <span className="relative flex items-center gap-2">
                            Connect Wallet <ArrowRight size={18} />
                        </span>
                    </button>

                    <button className="px-8 py-4 bg-bg-card border border-bg-border text-text-muted font-medium rounded-lg hover:text-text-main hover:border-text-dim transition-colors">
                        View Documentation
                    </button>
                </motion.div>

                {/* Feature Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full text-left"
                >
                    {[
                        {
                            icon: ShieldCheck,
                            title: "Sovereign Security",
                            desc: "Non-custodial architecture ensures your private keys never leave your device."
                        },
                        {
                            icon: Zap,
                            title: "Instant Execution",
                            desc: "Zero-latency intent parsing converts your words into on-chain actions immediately."
                        },
                        {
                            icon: Globe,
                            title: "Cross-Chain Ready",
                            desc: "Seamlessly interact with multiple networks through a unified conversational interface."
                        }
                    ].map((feature, i) => (
                        <div key={i} className="p-6 rounded-xl bg-bg-card border border-bg-border/50 hover:border-primary/30 transition-colors group">
                            <feature.icon className="w-10 h-10 text-text-dim group-hover:text-primary transition-colors mb-4" />
                            <h3 className="text-lg font-semibold text-text-main mb-2">{feature.title}</h3>
                            <p className="text-sm text-text-muted leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </main>

            {/* Footer / Status */}
            <footer className="absolute bottom-0 w-full border-t border-bg-border py-6 px-6 bg-bg-main/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center text-xs text-text-dim uppercase tracking-wider font-mono">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        System Operational
                    </div>
                    <div>v2.0.4-stable</div>
                </div>
            </footer>
        </div>
    );
}
