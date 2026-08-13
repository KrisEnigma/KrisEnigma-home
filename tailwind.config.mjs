/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            fontFamily: {
                'titillium': ['Titillium Web', 'sans-serif'],
                'aerovias': ['Aerovias Brasil NF', 'sans-serif'],
                'uni-neue': ['Uni Neue', 'sans-serif'],
            }, colors: {
                'theme-primary': 'var(--kris-primary)',
                'theme-accent': 'var(--kris-accent)',
            }, backgroundImage: {
                'theme-bg': 'url(/bg.webp)',
            },
        },
    }, plugins: [require('@tailwindcss/aspect-ratio'), function ({ addUtilities, addComponents }) {
        addComponents({
            '.glass-bg': {
                background: 'var(--kris-glass)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--kris-radius)',
                border: '1px solid var(--kris-glass-border)',
            },
            '.logo-enigma': {
                background: 'linear-gradient(-45deg, var(--kris-accent), var(--kris-primary))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
                padding: '0 2px',
                margin: '0 -2px',
            },
        });
    },
    ],
}
