import React from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
    onGetStarted: () => void;
}

export function Navbar({ onGetStarted }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <nav className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-7xl pt-6 px-4">
            <div className="bg-brand-gray/40 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex justify-between items-center shadow-lg">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-brand-orange tracking-tight">Automatix</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Why Us</a>
                    <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Mission</a>
                    <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Works</a>
                    <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Services</a>
                </div>

                {/* CTA Button */}
                <div className="hidden md:flex items-center">
                    <button
                        onClick={onGetStarted}
                        className="group flex items-center gap-2 bg-white/5 border border-white/10 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-all"
                    >
                        Let's Talk
                        <ArrowUpRight size={16} className="text-brand-orange group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden mt-2 bg-brand-gray/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4">
                    <a href="#" className="block text-lg font-medium text-gray-400 hover:text-white">Why Us</a>
                    <a href="#" className="block text-lg font-medium text-gray-400 hover:text-white">Mission</a>
                    <a href="#" className="block text-lg font-medium text-gray-400 hover:text-white">Works</a>
                    <a href="#" className="block text-lg font-medium text-gray-400 hover:text-white">Services</a>
                    <button
                        onClick={onGetStarted}
                        className="w-full mt-4 bg-brand-orange text-white px-6 py-3 rounded-xl text-base font-bold"
                    >
                        Let's Talk
                    </button>
                </div>
            )}
        </nav>
    );
}
