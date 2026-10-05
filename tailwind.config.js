/* Tailwind CDN theme config — must load right after the Tailwind CDN script */
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          olive: {
            50: '#F4F6EC', 100: '#E8EDD6', 200: '#D3DCB0', 300: '#B9C78A',
            400: '#9FB16A', 500: '#859752', 600: '#6C7C40', 700: '#556233',
            800: '#3F4927', 900: '#2B321B'
          },
          ink: { DEFAULT: '#16181A', soft: '#3A3D40', mute: '#6E7276' },
          paper: '#F5F5F1',
          line: '#E6E6E0'
        },
        fontFamily: { sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
        boxShadow: {
          soft: '0 1px 2px rgba(22,24,26,.04), 0 8px 24px -12px rgba(22,24,26,.12)',
          lift: '0 2px 4px rgba(22,24,26,.04), 0 24px 48px -20px rgba(22,24,26,.22)'
        }
      }
    }
  };
