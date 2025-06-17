// src/app/histoires/page.tsx

import React from 'react';
import type { Metadata } from 'next';
import type { Histoire as HistoireType } from '@/payload-types';
import HistoireCard from '@/components/HistoireCard';

const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';

// On redéfinit ici le type attendu par nos cartes pour plus de clarté
interface HistoirePourCarte {
  id: string;
  slug?: string | null;
  title: string;
  resume?: string | null;
  imageMiseEnAvant?: {
    url?: string | null;
    alt?: string | null;
  } | null;
}

// Fonction pour récupérer toutes les histoires
async function getAllHistoires(): Promise<HistoirePourCarte[]> {
  try {
    const apiUrl = `${payloadUrl}/api/histoires?sort=-updatedAt&limit=100&depth=1`;
    const response = await fetch(apiUrl, { next: { revalidate: 3600 } });

    if (!response.ok) {
      console.error(`[getAllHistoires] Erreur API (${response.status}): ${await response.text()}`);
      return [];
    }
    const data = await response.json();
    
    const histoiresPourCartes: HistoirePourCarte[] = data.docs.map((doc: HistoireType) => ({
      id: doc.id.toString(), // On convertit l'ID en string
      slug: doc.slug,
      title: doc.title,
      resume: doc.resume,
      imageMiseEnAvant: (typeof doc.imageMiseEnAvant === 'object' ? doc.imageMiseEnAvant : null),
    }));
    
    return histoiresPourCartes;

  } catch (error) {
    console.error('[getAllHistoires] Exception:', error);
    return [];
  }
}

// Métadonnées de la page
export const metadata: Metadata = {
  title: 'Histoires et Récits',
  description: 'Découvrez les dynasties verrières, les aventures industrielles et les sagas régionales qui ont marqué l"histoire du verre.',
};

// Le composant de la page
export default async function HistoiresIndexPage() {
  const histoires = await getAllHistoires();

  return (
    <div className="bg-cream min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <header className="mb-8 md:mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-blueGray-800 font-serif">
            Histoires & Récits
          </h1>
          <p className="mt-4 text-lg text-blueGray-600 font-sans max-w-3xl mx-auto">
            Plongez dans les sagas qui ont façonné l'industrie du verre, des verreries forestières aux grandes manufactures.
          </p>
        </header>
        
        <main>
          {histoires.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {histoires.map(histoire => (
                <HistoireCard key={histoire.id} histoire={histoire} />
              ))}
            </div>
          ) : (
            <p className="text-center text-blueGray-500 italic">Aucune histoire publiée pour le moment.</p>
          )}
        </main>
      </div>
    </div>
  );
}