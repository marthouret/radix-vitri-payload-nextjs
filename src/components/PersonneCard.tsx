// src/components/PersonneCard.tsx
import React from 'react';
import Link from 'next/link';

// On définit un type simple juste pour ce composant qui ne contient QUE les champs dont on a besoin pour l'affichage.
interface PersonnePourCarte {
  id: string | number;
  slug?: string | null;
  nomComplet?: string | null;
  prenom?: string | null;
  nom?: string | null;
  anneeNaissance?: number | null;
  anneeDeces?: number | null;
  sexe?: 'M' | 'F' | null;
}

// On utilise le bon nom d'interface pour la cohérence
interface EngagementDetailPourListe {
  engagementId: string;
  fonction?: string;
  periode: string;
  verrerieNom?: string;
  verrerieSlug?: string;
}

interface PersonneCardProps {
  personne: PersonnePourCarte;
  engagements: EngagementDetailPourListe[];
}

// Le composant est maintenant correctement typé
const PersonneCard: React.FC<PersonneCardProps> = ({ personne, engagements }) => {
  // Le reste du code du composant ne change pas
  let nomCompletAffichage = personne.nomComplet || `${personne.prenom || ''} ${personne.nom || ''}`.trim();
  const anneeN = personne.anneeNaissance;
  const anneeD = personne.anneeDeces;
  const accordE = personne.sexe === 'F' ? 'e' : '';

  if (anneeN && anneeD) {
    nomCompletAffichage = `${nomCompletAffichage} (${anneeN} - ${anneeD})`;
  } else if (anneeN) {
    nomCompletAffichage = `${nomCompletAffichage} (Né${accordE} en ${anneeN})`;
  } else if (anneeD) {
    nomCompletAffichage = `${nomCompletAffichage} (Décédé${accordE} en ${anneeD})`;
  }

  return (
  <div className="bg-white p-4 rounded-lg shadow-md border border-blueGray-100 h-full flex flex-col">
      <h4 className="font-semibold text-blueGray-800 font-serif leading-tight mb-2">
        <Link
          href={personne.slug ? `/verriers/${personne.slug}` : '#'}
          className="text-gold hover:text-gold-dark text-base no-underline hover:underline"
        >
          {nomCompletAffichage}
        </Link>
      </h4>
      <div className="space-y-2 flex-grow">
        {engagements.map(eng => (
            // Chaque engagement est maintenant un conteneur flex qui distribue l'espace
          // On utilise Grid pour un contrôle total des colonnes
          <div key={eng.engagementId} className="grid grid-cols-2 items-start gap-x-4 text-xs font-sans">
            
            {/* Colonne de gauche : on lui dit de prendre 2 des 3 colonnes de la grille */}
            <div className="col-span-1">
              {eng.fonction && <span className="block text-blueGray-700 font-semibold">{eng.fonction}</span>}
              {eng.periode && <span className="block text-blueGray-500 text-xs">{eng.periode}</span>}
            </div>

            {/* Colonne de droite : elle prend la dernière colonne et aligne son texte à droite */}
            <div className="text-right">
              {eng.verrerieNom && (
                  eng.verrerieSlug ? (
                    <Link href={`/verreries/${eng.verrerieSlug}`} className="text-blueGray-600 hover:text-gold hover:underline">
                      {eng.verrerieNom}
                    </Link>
                  ) : (
                    <span className="text-blueGray-600">{eng.verrerieNom}</span>
                  )
              )}
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonneCard;