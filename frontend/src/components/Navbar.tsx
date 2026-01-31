import React from 'react';
import { Menu, X, Terminal } from 'lucide-react';

interface NavbarProps {
    onGetStarted: () => void;
}

export function Navbar({ onGetStarted }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-bg-border bg-bg-main/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-bg-card border border-bg-border rounded flex items-center justify-center">
                        <Terminal size={16} className="text-primary" />
                    </div>
                    <span className="text-sm font-bold text-text-main tracking-widest uppercase font-mono">
                        Automatix
                    </span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {['Features', 'Security', 'Protocol', 'Documentation'].map((item) => (
                        <a
                            key={item}
                            href="#"
                            className="text-xs font-medium text-text-muted hover:text-primary transition-colors uppercase tracking-wider"
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="hidden md:flex items-center">
                    <button
                        onClick={onGetStarted}
                        className="px-4 py-2 bg-text-main text-bg-main text-xs font-bold uppercase tracking-wide rounded hover:bg-primary hover:text-white transition-colors"
                    >
                        Launch App
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-text-muted hover:text-text-main">
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-bg-main border-b border-bg-border">
                    <div className="px-6 py-4 space-y-4">
                        {['Features', 'Security', 'Protocol', 'Documentation'].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="block text-sm font-medium text-text-muted hover:text-primary transition-colors"
                            >
                                {item}
                            </a>
                        ))}
                        <button
                            onClick={onGetStarted}
                            className="w-full mt-4 bg-primary text-white px-6 py-3 rounded text-sm font-bold uppercase tracking-wide"
                        >
                            Launch App
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
