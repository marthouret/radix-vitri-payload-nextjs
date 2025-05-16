// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'everglade': '#1a4731', // Votre couleur personnalisée
        'everglade-clear': '#2a6b47',
        cream: "#f9f6f2", // Votre couleur crème pour les fonds d'article
        blueGray: {
          // Nuances de bleu-gris pour les textes, titres
          // Vous pouvez ajouter plus de nuances (50, 100, ..., 900) si nécessaire
          // Exemple pris de couleurs Tailwind courantes, à ajuster :
          50: '#f8fafc',  // slate-50
          100: '#f1f5f9', // slate-100
          200: '#e2e8f0', // slate-200
          300: '#cbd5e1', // slate-300
          400: '#94a3b8', // slate-400
          500: '#64748b', // slate-500
          600: '#475569', // slate-600
          700: '#334155', // slate-700
          800: "#2d3e50", // Votre bleu-gris pour les titres
          900: '#0f172a', // slate-900
        },
        gold: {
          // Nuances d'or/cuivre pour les accents
          // Exemple pris de couleurs Tailwind courantes, à ajuster :
          DEFAULT: "#b08d57", // Votre couleur principale 'gold'
          light: '#c8a876', // Une version plus claire
          dark: '#98723a',  // Une version plus foncée
        },
        // Vous pouvez garder les couleurs par défaut de Tailwind et juste étendre
        // ou redéfinir complètement la palette si vous le souhaitez.
      },
      fontFamily: {
        // Définition des polices personnalisées
        // Assurez-vous que ces polices sont importées/chargées dans votre projet (par exemple, via src/app/layout.tsx)
        serif: ["'Playfair Display'", "Georgia", "serif"], // Pour les titres, le corps de texte principal
        sans: ["Lato", "Helvetica", "Arial", "sans-serif"],    // Pour les UI elements, légendes, etc.
      },
      // Configuration pour le plugin typography (prose)
      // Vous pouvez personnaliser les styles de prose ici
      typography: (theme) => ({
        DEFAULT: {
          css: {
            // ... (vos autres variables --tw-prose-body, etc. ou styles directs)
            'a': {
              color: theme('colors.gold.DEFAULT'), // Couleur du texte
              textDecoration: 'underline',        // Assurer le soulignement
              textDecorationColor: theme('colors.gold.DEFAULT'), // Couleur du soulignement
              fontWeight: 'inherit', // ou 'normal' pour éviter le gras par défaut des navigateurs
              '&:hover': {
                color: theme('colors.gold.dark'),
                textDecorationColor: theme('colors.gold.dark'),
              },
            },
          },
        },
        lg: { // Pour la classe 'prose-lg'
          css: {
            // ... (vos autres variables --tw-prose-body, etc. ou styles directs)
            'a': {
              color: theme('colors.gold.DEFAULT'), // Couleur du texte
              textDecoration: 'underline',        // Assurer le soulignement
              textDecorationColor: theme('colors.gold.DEFAULT'), // Couleur du soulignement
              fontWeight: 'inherit', // ou 'normal' pour éviter le gras par défaut des navigateurs
              '&:hover': {
                color: theme('colors.gold.dark'),
                textDecorationColor: theme('colors.gold.dark'),
              },
            },
          },
        },
        // Vous pouvez définir d'autres thèmes de prose, par exemple 'prose-cream'
        cream: {
          css: {
            // '--tw-prose-body': theme('colors.blueGray.800'),
            // '--tw-prose-headings': theme('colors.blueGray.900'),
            // '--tw-prose-links': theme('colors.gold.DEFAULT'),
            // ... et ainsi de suite pour toutes les variables de couleur de prose.
            // C'est une manière plus moderne de personnaliser avec Tailwind v3+
            // Pour l'instant, nous allons utiliser le DEFAULT et appliquer un fond crème au conteneur.
          }
        }
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    // require('@tailwindcss/line-clamp'), // Sert à limiter un bloc de texte à un nombre spécifique de lignes, mais inclus par défaut dans tailwind 3.3+
    // Assurez-vous que ces plugins sont compatibles avec Tailwind v3
  ],
  // Bien s'assurer que cette section est présente et active (sinon conflits styles frontend et backend) :
  corePlugins: {
    preflight: false,
  }
}
