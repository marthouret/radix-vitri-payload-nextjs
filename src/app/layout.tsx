// src/app/layout.tsx
import type { Metadata } from 'next';
import { Playfair_Display, Lato, Limelight } from 'next/font/google';
import './globals.css'; 
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getFooterPages } from '@/lib/getFooterPages';

// Configuration de la police Playfair Display (pour les titres et le corps serif)
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'], // Choisissez les graisses nécessaires
  style: ['normal', 'italic'],
  variable: '--font-playfair-display', // Optionnel: pour utilisation comme variable CSS
  display: 'swap', // Bonne pratique pour la performance perçue
});

// Configuration de la police Lato (pour les éléments sans-serif)
const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'], // Choisissez les graisses nécessaires
  style: ['normal', 'italic'],
  variable: '--font-lato', // Optionnel
  display: 'swap',
});

const limelight = Limelight({
  subsets: ['latin'],
  weight: ['400'], // Limelight n'a qu'une seule graisse (Regular 400)
  style: ['normal'],
  variable: '--font-limelight',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Radix Vitri', // %s sera remplacé par le titre de la page enfant
    default: 'Radix Vitri - Histoire des Verreries et des Verriers', // Titre si une page enfant ne spécifie rien
  },
  description: 'Découvrez l\'histoire des verreries et des verriers.', 
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const footerPages = await getFooterPages();
  return (
    <html lang="fr">
      <body>
        <Header />
        {children}
        <Footer footerPages={footerPages} />
      </body>
    </html>
  );
}
