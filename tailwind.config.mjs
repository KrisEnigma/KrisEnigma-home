/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            fontFamily: {
                'aerovias': ['Aerovias Brasil NF', 'sans-serif'],
            }, colors: {
                'theme-primary': '#00e1af',
                'theme-accent': '#7a53dd',
            },
            backgroundImage: {
                'theme-bg': 'url(https://assets-esponsor.nyc3.cdn.digitaloceanspaces.com/public/profile_themes/backgrounds/914/uZg96WPyDj5i5KKyZzLDl1tnl8eZUVVx8NUJoMFm.jpg)',
            },
        },
    }, plugins: [require('@tailwindcss/aspect-ratio'), function ({ addUtilities, addComponents }) {
        addComponents({
            '.glass-bg': {
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
            },
            '.logo-enigma': {
                background: 'linear-gradient(-45deg, #00e1af, #7a53dd)',
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
