/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#FF9F1C', // Warm Amber
                'primary-hover': '#FFB23F',
                'primary-dim': 'rgba(255, 159, 28, 0.1)',

                // Backgrounds
                'bg-main': '#050505', // Deep Black
                'bg-card': '#121212', // Slightly lighter charcoal
                'bg-border': '#2a2a2a', // Zinc-800

                // Text
                'text-main': '#FFFFFF',
                'text-muted': '#A0A0A0', // Zinc-400
                'text-dim': '#555555',   // Zinc-600
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'dot-pattern': 'radial-gradient(circle, #333333 1px, transparent 1px)',
            },
            backgroundSize: {
                'dot-size': '24px 24px',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        },
    },
    plugins: [],
}
