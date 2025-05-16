// src/app/layout.tsx
import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google'; // Import des polices
import './globals.css'; // Assurez-vous que ce fichier importe les styles Tailwind

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

export const metadata: Metadata = {
  title: 'Radix Vitri - Histoire des Verreries', 
  description: 'Découvrez l\'histoire des verreries et des verriers.', 
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${playfairDisplay.variable} ${lato.variable} font-serif`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
