// src/app/histoires/[slug]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { Histoire as HistoireType, Verrier as VerrierType, Verrery as VerrerieType } from '@/payload-types';
import ArticleContentRenderer from '@/components/ArticleContentRenderer';
import VerrerieMap from '@/components/VerrerieMapClientWrapper';
import type { MapPoint } from '@/types/map';

const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';

// --- Fonction pour récupérer les données de l'histoire ---
async function getHistoire(slug: string): Promise<HistoireType | null> {
  try {
    const endpoint = new URL(`${payloadUrl}/api/histoires`);
    endpoint.searchParams.append('where[slug][equals]', slug);
    endpoint.searchParams.append('limit', '1');
    endpoint.searchParams.append('depth', '2');
    
    const response = await fetch(endpoint.toString(), { 
      next: { revalidate: 60 } // Met en cache les pages pendant 60 secondes
    });

    if (!response.ok) {
      console.error(`Erreur API pour le slug ${slug}: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data.docs[0] || null;
  } catch (error) {
    console.error("Error fetching histoire:", error);
    return null;
  }
}

// --- Fonction pour les métadonnées de la page ---
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const histoire = await getHistoire(params.slug);
  
  return {
    title: histoire?.title || 'Histoire non trouvée',
    description: histoire?.resume,
  };
}

// --- Le composant de la page ---
export default async function HistoirePage({ params }: { params: any }) {
  const histoire = await getHistoire(params.slug);

  if (!histoire) {
    return notFound();
  }

  // On prépare les points pour la carte contextuelle
  const mapPoints: MapPoint[] = (histoire.verreriesLiees || [])
    .map(verrerie => {
      // On s'assure que verrerie est bien un objet complet
      if (typeof verrerie === 'object' && verrerie.lieuPrincipal && typeof verrerie.lieuPrincipal === 'object' && verrerie.lieuPrincipal.coordonnees) {
        return {
          id: verrerie.id.toString(), // On convertit l'ID en string
          coordonnees: verrerie.lieuPrincipal.coordonnees as [number, number],
          nomPrincipal: verrerie.nomPrincipal,
          slug: verrerie.slug,
        };
      }
      return null; // On retourne null pour les verreries invalides
    })
    .filter((point): point is MapPoint => point !== null); // On filtre les null pour avoir un tableau propre

  return (
    <div className="bg-cream">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* --- En-tête de l'article --- */}
        <header className="mb-8 md:mb-12 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-blueGray-800 font-serif text-center">{histoire.title}</h1>
          {histoire.resume && (
            <p className="mt-4 text-lg text-blueGray-600 font-sans text-center">{histoire.resume}</p>
          )}
        </header>

        {/* --- Grille principale : Contenu à gauche, Sidebar à droite --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
          
          {/* Colonne de gauche : Contenu principal de l'article */}
          <main className="lg:col-span-2 prose lg:prose-xl max-w-full bg-white p-6 md:p-10 rounded-lg shadow-md">
            <ArticleContentRenderer content={histoire.content} />
          </main>

          {/* Colonne de droite : Informations contextuelles */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              
              {/* Carte contextuelle */}
              {mapPoints.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md border">
                  <h3 className="text-xl font-semibold text-blueGray-800 mb-4 font-serif">Lieux Mentionnés</h3>
                  <div className="h-64 rounded-md overflow-hidden border">
                    <VerrerieMap points={mapPoints} />
                  </div>
                </div>
              )}

              {/* Personnes liées */}
              {histoire.personnesLiees && histoire.personnesLiees.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md border">
                  <h3 className="text-xl font-semibold text-blueGray-800 mb-4 font-serif">Personnes Liées</h3>
                  <ul className="space-y-2">
                    {(histoire.personnesLiees as VerrierType[]).map(personne => (
                      <li key={personne.id}>
                        <Link href={`/verriers/${personne.slug}`} className="text-gold hover:underline font-semibold text-sm">
                          {personne.nomComplet}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Verreries liées */}
              {histoire.verreriesLiees && histoire.verreriesLiees.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md border">
                  <h3 className="text-xl font-semibold text-blueGray-800 mb-4 font-serif">Verreries Liées</h3>
                  <ul className="space-y-2">
                    {(histoire.verreriesLiees as VerrerieType[]).map(verrerie => (
                      <li key={verrerie.id}>
                        <Link href={`/verreries/${verrerie.slug}`} className="text-gold hover:underline font-semibold text-sm">
                          {verrerie.nomPrincipal}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}