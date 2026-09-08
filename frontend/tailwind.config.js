/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'SF Pro Display',
          'SF Pro Text',
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        display: [
          'SF Pro Display',
          'Inter',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        mono: [
          'SF Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'monospace',
        ],
      },
      colors: {
        // Brand & Accent
        primary: '#0066cc',
        'primary-focus': '#0071e3',
        'primary-on-dark': '#2997ff',

        // Surface
        canvas: '#ffffff',
        parchment: '#f5f5f7',
        pearl: '#fafafc',
        'tile-1': '#272729',
        'tile-2': '#2a2a2c',
        'tile-3': '#252527',
        'surface-black': '#000000',
        'chip-gray': 'rgba(210,210,215,0.64)',

        // Text
        ink: '#1d1d1f',
        'ink-80': '#333333',
        'ink-48': '#7a7a7a',
        'on-dark': '#ffffff',
        'muted-dark': '#cccccc',

        // Hairlines
        hairline: '#e0e0e0',
        divider: '#f0f0f0',

        // Semantic (used carefully, not as accents)
        success: '#34c759',
        warning: '#ff9f0a',
        danger: '#ff453a',

        // Landing Page Colors
        forest: '#173B2A',
        'deep-green': '#24523A',
        herbal: '#3F6B45',
        leaf: '#6F8F5F',
        sage: '#A8B89A',
        cream: '#FBF7ED',
        sand: '#E6D3B1',
        earth: '#76583E',
        brown: '#4A3828',
        saffron: '#B8792E',
        ochre: '#C6954C',
      },
      borderRadius: {
        none: '0px',
        xs: '5px',
        sm: '8px',
        md: '11px',
        lg: '18px',
        pill: '9999px',
        full: '9999px',
      },
      fontSize: {
        // verge.md typography scale
        'hero': ['56px', { lineHeight: '1.07', letterSpacing: '-0.28px', fontWeight: '600' }],
        'display-lg': ['40px', { lineHeight: '1.10', letterSpacing: '0', fontWeight: '600' }],
        'display-md': ['34px', { lineHeight: '1.47', letterSpacing: '-0.374px', fontWeight: '600' }],
        'lead': ['28px', { lineHeight: '1.14', letterSpacing: '0.196px', fontWeight: '400' }],
        'lead-airy': ['24px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '300' }],
        'tagline': ['21px', { lineHeight: '1.19', letterSpacing: '0.231px', fontWeight: '600' }],
        'body-strong': ['17px', { lineHeight: '1.24', letterSpacing: '-0.374px', fontWeight: '600' }],
        'body': ['17px', { lineHeight: '1.47', letterSpacing: '-0.374px', fontWeight: '400' }],
        'dense-link': ['17px', { lineHeight: '2.41', letterSpacing: '0', fontWeight: '400' }],
        'caption': ['14px', { lineHeight: '1.43', letterSpacing: '-0.224px', fontWeight: '400' }],
        'caption-strong': ['14px', { lineHeight: '1.29', letterSpacing: '-0.224px', fontWeight: '600' }],
        'btn-large': ['18px', { lineHeight: '1.0', letterSpacing: '0', fontWeight: '300' }],
        'btn-utility': ['14px', { lineHeight: '1.29', letterSpacing: '-0.224px', fontWeight: '400' }],
        'fine-print': ['12px', { lineHeight: '1.0', letterSpacing: '-0.12px', fontWeight: '400' }],
        'micro': ['10px', { lineHeight: '1.3', letterSpacing: '-0.08px', fontWeight: '400' }],
        'nav': ['12px', { lineHeight: '1.0', letterSpacing: '-0.12px', fontWeight: '400' }],
      },
      spacing: {
        'xxs': '4px',
        'xs': '8px',
        'sm-sp': '12px',
        'md-sp': '17px',
        'lg-sp': '24px',
        'xl-sp': '32px',
        'xxl-sp': '48px',
        'section': '80px',
      },
      boxShadow: {
        product: 'rgba(0,0,0,0.22) 3px 5px 30px 0',
        'hairline': '0 0 0 1px rgba(0,0,0,0.08)',
        'btn': '0 2px 8px rgba(0,102,204,0.2)',
      },
      backdropBlur: {
        nav: '20px',
      },
    },
  },
  plugins: [],
}
