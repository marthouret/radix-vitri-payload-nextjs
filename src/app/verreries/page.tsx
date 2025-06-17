// src/app/verreries/page.tsx
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catalogue des Verreries | Radix Vitri',
  // description: 'Liste de toutes les verreries documentées sur Radix Vitri.' // Optionnel
};

// Interfaces (à définir ou importer, basées sur ce que l'API retourne pour une liste)
// Ces types devront peut-être être ajustés en fonction de la réponse réelle de l'API
interface LieuCatalogue { // Version simplifiée pour la liste
  villeOuCommune?: string;
  nomDuLieu?: string;
}

interface PeriodeVerriereCatalogue {
  periodeActiviteTexte?: string;
  anneeFondationApprox?: number;
  anneeFermetureApprox?: number;
}

interface VerreriePourCatalogue {
  id: string;
  slug: string;
  nomPrincipal: string;
  lieuPrincipal?: LieuCatalogue | string; // Peut être un ID ou un objet peuplé
  periodeVerriere?: PeriodeVerriereCatalogue;
}

const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';

async function fetchAllVerreries(): Promise<VerreriePourCatalogue[]> {
  try {
    // On veut le nom, le slug, et des infos sur le lieu et la période.
    // depth=1 devrait suffire pour peupler lieuPrincipal (s'il est une relation directe)
    // et periodeVerriere (si c'est un groupe de champs).
    // Ajustez le 'limit' si vous avez beaucoup de verreries. Pour l'instant, 100 est une bonne base.
    const response = await fetch(`${payloadUrl}/api/verreries?limit=100&depth=1&sort=nomPrincipal`, {
      cache: 'no-store', // Ou 'force-cache' si les données changent peu, ou revalidate
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur API Payload (fetchAllVerreries - ${response.status}): ${errorText}`);
      throw new Error(`Failed to fetch verreries: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error("[fetchAllVerreries]", error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
}

export default async function CatalogueVerreriesPage() {
  // const payload = await getPayloadHMR({ config: PAYLOAD_CONFIG }); // Si besoin d'utiliser payload localement
  const verreries = await fetchAllVerreries();

  return (
    <div className="bg-cream text-blueGray-700 font-serif min-h-screen">
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <header className="mb-10 md:mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blueGray-800 mb-3 tracking-tight">
            Catalogue des Verreries
          </h1>
          <p className="text-lg text-blueGray-600 font-sans">
            Découvrez les verreries documentées sur Radix Vitri.
          </p>
        </header>

        {verreries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {verreries.map((verrerie) => {
              let localisation = 'Lieu inconnu';
              if (verrerie.lieuPrincipal && typeof verrerie.lieuPrincipal === 'object') {
                const lieu = verrerie.lieuPrincipal as LieuCatalogue;
                localisation = lieu.villeOuCommune || lieu.nomDuLieu || 'Lieu non précisé';
              }

              let periode = 'Période inconnue';
              if (verrerie.periodeVerriere) {
                periode = verrerie.periodeVerriere.periodeActiviteTexte || 
                          (verrerie.periodeVerriere.anneeFondationApprox && verrerie.periodeVerriere.anneeFermetureApprox 
                            ? `${verrerie.periodeVerriere.anneeFondationApprox} - ${verrerie.periodeVerriere.anneeFermetureApprox}`
                            : verrerie.periodeVerriere.anneeFondationApprox 
                              ? `À partir de ${verrerie.periodeVerriere.anneeFondationApprox}`
                              : verrerie.periodeVerriere.anneeFermetureApprox
                                ? `Jusqu'en ${verrerie.periodeVerriere.anneeFermetureApprox}`
                                : 'Période non précisée');
              }

              return (
                <Link
                  key={verrerie.id}
                  href={`/verreries/${verrerie.slug}`}
                  className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 group text-blueGray-700 no-underline"
                >
                  <h2 className="text-2xl font-semibold text-gold group-hover:text-gold-dark mb-2 font-serif truncate">
                    {verrerie.nomPrincipal}
                  </h2>
                  <p className="text-sm text-blueGray-600 font-sans mb-1">
                    <span className="font-semibold">Lieu :</span> {localisation}
                  </p>
                  <p className="text-sm text-blueGray-500 font-sans">
                    <span className="font-semibold">Période :</span> {periode}
                  </p>
                  <span className="inline-block text-sm text-gold-dark font-semibold font-sans mt-4 group-hover:underline">
                    Voir les détails &rarr;
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-blueGray-500 italic">
            Aucune verrerie à afficher pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}