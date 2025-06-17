// src/app/recherche/page.tsx
import React from 'react';
import type { Verrier as VerrierType, Engagement as EngagementType, FonctionsVerrier, FonctionsPersonnalite } from '@/payload-types';
import PersonneCard from '@/components/PersonneCard'; // On utilise notre composant réutilisable !
import { formatPeriode } from '@/utils/formatters'; // On importe notre fonction de formatage de date

const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';

// On dit à TypeScript que nos objets Verrier auront bien un champ 'engagements'
type VerrierAvecEngagements = VerrierType & {
  engagements?: EngagementType[];
  fondateurDe?: string | any[]; // On ajoute le champ fondateurDe pour les verriers
};

// Fonction pour chercher les personens via leurs engagements dans l'API
async function searchPersonnes(query: string): Promise<VerrierAvecEngagements[]> {
  if (!query) return [];
  
  // On appelle notre nouvel endpoint /api/custom/recherche-personnes
  // Le préfixe '/api/custom' est ajouté automatiquement par Payload
  const endpoint = new URL(`${payloadUrl}/api/custom/recherche-personnes`);
  endpoint.searchParams.append('q', query);

  try {
    const res = await fetch(endpoint.toString(), { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.docs || [];
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    return [];
  }
}

// Le composant de la page de recherche
export default async function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || '';

  // La fonction renvoie maintenant des Verriers avec leurs engagements
const personnesTrouvees: VerrierAvecEngagements[] = await searchPersonnes(query);

// On trie les engagements de chaque personne par ordre chronologique
personnesTrouvees.forEach(personne => {
  if (Array.isArray(personne.engagements)) {
    personne.engagements.sort((a, b) => {
      const anneeA = a?.dateDebutStructurée?.anneeDebutSort ?? 9999;
      const anneeB = b?.dateDebutStructurée?.anneeDebutSort ?? 9999;
      if (anneeA !== anneeB) return anneeA - anneeB;
      const moisA = a?.dateDebutStructurée?.moisDebutSort ?? 13;
      const moisB = b?.dateDebutStructurée?.moisDebutSort ?? 13;
      return moisA - moisB;
    });
  }
});

const personnalites: VerrierAvecEngagements[] = [];
const verriers: VerrierAvecEngagements[] = [];

personnesTrouvees.forEach(personne => {
  const hasPersonalityRole = Array.isArray(personne.engagements) && personne.engagements.some(
    eng => eng?.typeEngagement === 'role_personnalite'
  );
  // On considère que c'est une personnalité si elle a un rôle de personnalité ou est fondateur d'une verrerie
  const isFondateur = Array.isArray(personne.fondateurDe) && personne.fondateurDe.length > 0;
  if (hasPersonalityRole || isFondateur) {
    personnalites.push(personne);
  } else {
    verriers.push(personne);
  }
});

  // Fonction utilitaire pour transformer les engagements complets en engagements simplifiés
const transformerEngagements = (engagements?: (string | EngagementType)[]) => {
if (!engagements) return [];
return engagements
    .filter((eng): eng is EngagementType => typeof eng === 'object')
    .map(eng => {
    const fonction = (eng.typeEngagement === 'metier_verrier' ? eng.fonctionVerrier : eng.fonctionPersonnalite) as FonctionsVerrier | FonctionsPersonnalite;
    const verrerie = (typeof eng.verrerie === 'object' && eng.verrerie !== null) ? eng.verrerie : undefined; // On s'assure que verrerie est bien un objet

    if (eng.typeEngagement != 'metier_verrier' && eng.typeEngagement != 'role_personnalite') {
        console.warn(`Engagement de type inattendu: ${eng.typeEngagement}`, eng);
    } else {
        console.warn(`Engagement correct: ${eng.typeEngagement}`, eng);
    }

    return {
        engagementId: eng.id.toString(),
        fonction: (typeof fonction === 'object' ? fonction?.nom : undefined),
        periode: formatPeriode(eng.dateDebutStructurée, eng.dateFinStructurée),
        // On ajoute les informations de la verrerie
        verrerieNom: (typeof verrerie === 'object' ? verrerie?.nomPrincipal : undefined),
        verrerieSlug: (typeof verrerie === 'object' ? verrerie?.slug : undefined),
    };
    });
};

  return (
    <div className="bg-cream min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold font-serif mb-10 text-center">
          Résultats de la recherche pour : <span className="text-gold">&quot;{query}&quot;</span>
        </h1>

        {personnesTrouvees.length === 0 ? (
          <p className="text-center text-blueGray-600">Aucun résultat trouvé pour votre recherche.</p>
        ) : (
          <div className="space-y-12">
            {personnalites.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-blueGray-800 mb-5 font-serif border-b pb-2">Personnalités Clés</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {personnalites.map(p => (
                    <PersonneCard key={p.id} personne={p} engagements={transformerEngagements(p.engagements || [])} />
                  ))}
                </div>
              </section>
            )}
            {verriers.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-blueGray-800 mb-5 font-serif border-b pb-2">Verriers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {verriers.map(v => (
                    <PersonneCard key={v.id} personne={v} engagements={transformerEngagements(v.engagements || [])} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}