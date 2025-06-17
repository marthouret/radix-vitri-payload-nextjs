// Fichier : src/app/verreries/[slug]/page.tsx

import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import MapLoader from '@/components/MapLoader'; 
import { MapPoint } from '@/types/map'; 
import PersonneCard from '@/components/PersonneCard';
import ArticleContentRenderer from '@/components/ArticleContentRenderer';
import TruncatedText from '@/components/TruncatedText';
import GalerieVerrerie from '@/components/GalerieVerrerie';
import { statutVerrerieOptions } from '@/config/selectOptions';
import { formatPeriode, type DateDebut, type DateFin } from '@/utils/formatters';

// --- Définitions des Interfaces ---
// Sous-types pour VerrerieType
interface NomHistoriqueOuSocial {
  id?: string; // ID généré par Payload pour chaque item de l'array
  nom: string;
  typeDeNom?: 'usage' | 'raison_sociale' | 'fondation' | 'populaire' | 'autre';
  periodeValidite?: string;
  anneeDebut?: number;
  anneeFin?: number;
  notes?: string;
}

interface DateStructuree { // Pour les dates de début/fin détaillées
  anneeSort?: number;
  moisSort?: number;
  // jourSort?: number; // Omis comme discuté pour les engagements, à voir si pertinent pour verrerie
  typePrecisionDate?: 'MoisAnneeExacts' | 'AnneeSeuleExacte' | 'CircaAnnee' | string; // string pour flexibilité
}

interface PeriodeVerriereData { // Nouvelle interface pour l'objet periodeVerriere
  periodeActiviteTexte?: string;
  anneeFondationApprox?: number;
  anneeFermetureApprox?: number;
  // Si les dates structurées sont directement ici (ce que votre JSON suggère) :
  anneeDebutSort?: number;
  moisDebutSort?: number | null; // Peut être null
  typePrecisionDateDebut?: string;
  anneeFinSort?: number;
  moisFinSort?: number | null; // Peut être null
  typePrecisionDateFin?: string;
  // Si vous aviez gardé les sous-groupes "dateDebutDetaillee" et "dateFinDetaillee" DANS "periodeVerriere":
  // dateDebutDetaillee?: DateStructuree; 
  // dateFinDetaillee?: DateStructuree;
}

interface MediaItem { id: string; url?: string; filename?: string; alt?: string; width?: number; height?: number; mimeType?: string; caption?: string; }
// interface DateGroup { datePreciseCreation?: string | null; descriptionDateCreation?: string | null; datePreciseFermeture?: string | null; descriptionDateFermeture?: string | null;}
interface SourceBibliographique { id?: string; typeSource?: string; titre?: string; auteur?: string; url?: string; detailsPublication?: string; citationOuExtrait?: string; notesSource?: string; }
// interface NomAlternatif { id?: string; typeDeNom?: string; nom?: string; }

interface VerrierType {
  id: string | number;
  nom?: string; 
  prenom?: string;
  nomComplet?: string;
  sexe?: 'M' | 'F';
  slug?: string;
  anneeNaissance?: number;
  anneeDeces?: number;
}

interface Fonction {
  id: string;
  nom: string;
  // ... autres champs de la collection Fonction si besoin
}

// Interface pour les détails d'un engagement à afficher dans la liste groupée
interface EngagementDetailPourListe {
  engagementId: string;
  fonction?: string;
  periode: string;
  // Champs pour le tri chronologique des engagements d'une même personne
  anneeDebutSort?: number;
  moisDebutSort?: number;
}

// Interface pour une personne (Personnalité ou Verrier) avec ses engagements groupés
interface PersonneAvecEngagements<T extends VerrierType> {
  personne: T;
  engagementsDetails: EngagementDetailPourListe[];
}

interface EngagementType {
  id: string;
  personneConcernee?: { 
    relationTo: 'verriers';
    value: VerrierType | string; // string si non peuplé
  };
  typeEngagement?: 'role_personnalite' | 'metier_verrier';
  fonctionPersonnalite?: Fonction | string; // string si non peuplé
  fonctionVerrier?: Fonction | string; 
  periodeActiviteTexte?: string; 
  dateDebutStructurée?: {
    anneeDebutSort?: number;
    moisDebutSort?: number;
    typePrecisionDateDebut?: string;
  };
  dateFinStructurée?: {
    anneeFinSort?: number;
    moisFinSort?: number;
    typePrecisionDateFin?: string;
  };
}

// Interface pour Lieu (basée sur nouvelle collection Lieu.ts)
interface LieuType {
  id: string;
  nomDuLieu?: string;
  adresse?: string;
  villeOuCommune?: string; // Champ principal pour la ville
  codePostal?: string;
  departement?: string;
  region?: string;
  pays?: string;
  coordonnees?: [number, number]; // [longitude, latitude]
  nomCompletAffichage?: string; // Peut être utile pour l'affichage
  notesHistoriquesSurLeLieu?: any; // Type RichText
}

// Interface principale pour VerrerieType
export interface VerrerieType {
  id: string;
  nomPrincipal: string;
  slug: string;
  
  // Anciens champs de date de création/fermeture (à supprimer après migration)
  dateDeCreation?: { datePreciseCreation?: string | null; descriptionDateCreation?: string | null; }; 
  dateDeFermeture?: { datePreciseFermeture?: string | null; descriptionDateFermeture?: string | null; };

  // Nouveaux champs pour la période d'activité
  periodeVerriere?: PeriodeVerriereData; // Champ principal, les autres sont des enfants.
  /* periodeActiviteTexte?: string;
  anneeFondationApprox?: number;
  anneeFermetureApprox?: number; */
  dateDebutStructurée?: DateStructuree; // Groupe de champs pour la date de début détaillée
  dateFinStructurée?: DateStructuree;   // Groupe de champs pour la date de fin détaillée

  // Nouveau champ pour les noms historiques
  nomsHistoriquesEtRaisonsSociales?: NomHistoriqueOuSocial[];

  // Champs existants (vérifiez si les types sont toujours corrects)
  lieuPrincipal?: LieuType | string; // string si non peuplé, LieuType si peuplé
  statutActuel?: string;
  notesStatutVestiges?: string;
  histoire?: any; // Type RichText Lexical JSON
  techniquesInnovations?: string; // Ou RichText?
  aspectsSociaux?: any; // Type RichText Lexical JSON
  
  imagesEtMedias?: MediaItem[];
  sourcesBibliographiques?: SourceBibliographique[];
  
  // Relations (assurez-vous que les types VerrierType etc. sont bien définis)
  fondateurs?: (VerrierType | string | number)[]; // string | number si non peuplé
  typesDeProduction?: Array<{ id: string; nom?: string; slug?: string }>; // Si c'est une relation, le type sera plus complexe si peuplé
  engagements?: EngagementType[];

  // Champs pour les Groupements et Filiation (à ajouter plus tard, mais pour mémoire)
  // appartenancesAGroupements?: Array<{ groupement: string | GroupementVerrierType; periodeAuSeinDuGroupement?: string; ... }>;
  // succedeA?: VerrerieType | string;
  // reprisePar?: (VerrerieType | string)[];

  // Champs de métadonnées Payload
  updatedAt?: string;
  createdAt?: string;
}
interface VerreriePageProps { params: { slug: string; }; }

// --- Fonctions Utilitaires ---
// const displayDateGroup = (datePrecise?: string | null, descriptionDate?: string | null): string => { const formattedPreciseDate = formatDate(datePrecise); if (formattedPreciseDate && datePrecise && !isNaN(new Date(datePrecise).getTime())) { return formattedPreciseDate; } if (descriptionDate) { return descriptionDate; } return 'N/A';};

// --- Composants de Rendu Spécifiques ---
// const ArticleContentRenderer: React.FC<{ content: any }> = ({ content }) => { if (!content || !content.root || !content.root.children) { return <p className="italic text-blueGray-500">Contenu non disponible.</p>; } const renderNodes = (nodes: any[], parentKey: string = 'node'): (JSX.Element | string)[] => { return nodes.map((node, index) => { const key = `${parentKey}-${node.type || 'unknown'}-${index}-${node.format || ''}-${Math.random().toString(36).substr(2, 5)}`; if (node.type === 'paragraph') { return <p key={key} className="mb-4 last:mb-0">{renderNodes(node.children || [], key)}</p>; } if (node.type === 'heading') { const Tag = node.tag as keyof JSX.IntrinsicElements; return <Tag key={key}>{renderNodes(node.children || [], key)}</Tag>; } if (node.type === 'list') { const ListTag = node.tag === 'ol' ? 'ol' : 'ul'; return <ListTag key={key} className={ListTag === 'ol' ? 'list-decimal pl-5 mb-4' : 'list-disc pl-5 mb-4'}>{renderNodes(node.children || [], key)}</ListTag>; } if (node.type === 'listitem') { return <li key={key} className="mb-1">{renderNodes(node.children || [], key)}</li>; } if (node.type === 'link') { const linkType = node.fields?.linkType; const doc = node.fields?.doc; const url = node.fields?.url; const newTab = node.fields?.newTab; const childrenContent = renderNodes(node.children || [], key); if (linkType === 'internal' && doc?.value && typeof doc.value === 'object' && doc.value !== null && doc.value.slug) { const href = `/${doc.relationTo}/${doc.value.slug}`; return <Link key={key} href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined} className="text-gold hover:text-gold-dark underline">{childrenContent}</Link>; } else if (linkType === 'custom' && url) { return <a key={key} href={url} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined} className="text-gold hover:text-gold-dark underline">{childrenContent}</a>; } return <React.Fragment key={key}>{childrenContent}</React.Fragment>; } if (node.type === 'text') { let textElement: JSX.Element | string = <React.Fragment key={`text-${key}`}>{node.text}</React.Fragment>; if (node.format === 1) textElement = <strong key={`strong-${key}`}>{textElement}</strong>; if (node.format === 2) textElement = <em key={`em-${key}`}>{textElement}</em>; if (node.format === 8) textElement = <code key={`code-${key}`}>{textElement}</code>; return textElement; } if (node.type === 'linebreak') { return <br key={key} />; } return node.text || ''; }).filter(item => item !== null && item !== ''); }; return <>{renderNodes(content.root.children, 'root')}</>; };

// Composant de menu de navigation pour la page, positionné dans la colonne de droite
// Composant de navigation avec police agrandie
const PageNavigationMenu = () => {
  return (
    <nav className="mb-4">
      <ul className="flex justify-center items-center gap-x-6 border-b border-blueGray-200 pb-2 list-none p-0">
        <li>
          <a href="#histoire" className="font-semibold text-blueGray-600 no-underline hover:text-gold transition-colors text-base"> {/* text-base ici */}
            Histoire
          </a>
        </li>
        <li>
          <a href="#personnes-liees" className="font-semibold text-blueGray-600 no-underline hover:text-gold transition-colors text-base"> {/* text-base ici */}
            Personnes Liées
          </a>
        </li>
        <li>
          <a href="#galerie" className="font-semibold text-blueGray-600 no-underline hover:text-gold transition-colors text-base"> {/* text-base ici */}
            Galerie
          </a>
        </li>
      </ul>
    </nav>
  );
};
// Composant pour le lien de retour en haut
const BackToTop = () => {
  return (
    <div className="mt-4 pt-4 border-t border-blueGray-200">
      <a href="#" className="font-semibold text-blueGray-600 hover:text-gold transition-colors text-sm">
        ↑ Retour en haut
      </a>
    </div>
  );
};

interface GroupedListItemProps<T extends VerrierType> {
  personne: T;
  engagements: EngagementDetailPourListe[];
}

const getStatutLabel = (value?: string): string => {
  if (!value) return 'N/A';
  const option = statutVerrerieOptions.find(opt => opt.value === value);
  return option ? option.label : value; // Retourne la valeur brute si le label n'est pas trouvé
};

// PersonalityListItem (pour affichage en liste simple dans la colonne principale)

// Composant pour afficher une carte de suggestion de verrerie
// C'est une liste de verreries, avec un lien vers la page de détails
const SuggestionCard: React.FC<{ verrerie: VerrerieType }> = ({ verrerie }) => {
  const name = verrerie.nomPrincipal || 'Verrerie inconnue';
  const link = verrerie.slug ? `/verreries/${verrerie.slug}` : '#';
  
  // On utilise la première image de la galerie comme image principale
  const image = verrerie.imagesEtMedias && verrerie.imagesEtMedias[0];
  const imageUrl = image?.url ? `${process.env.NEXT_PUBLIC_PAYLOAD_URL || ''}${image.url}` : 'https://placehold.co/600x400.png?text=Image+N/A';

  // On reprend notre logique pour la période
  let periodeAffichee = '';
  if (verrerie.periodeVerriere?.periodeActiviteTexte) {
    periodeAffichee = verrerie.periodeVerriere.periodeActiviteTexte;
  } else if (verrerie.periodeVerriere?.anneeFondationApprox || verrerie.periodeVerriere?.anneeFermetureApprox) {
    periodeAffichee = `env. ${verrerie.periodeVerriere.anneeFondationApprox || '?'} - ${verrerie.periodeVerriere.anneeFermetureApprox || '...'}`;
  }

  return (
    <Link
      href={link}
      className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 group text-blueGray-600 no-underline"
    >
      <div className="relative w-full h-48">
        {/* On utilise la balise <img> simple, qui est fiable */}
        <img 
          src={imageUrl} 
          alt={image?.alt || name} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-blueGray-800 mb-2 font-serif group-hover:text-gold transition-colors">{name}</h3>
        {periodeAffichee && (
          <p className="text-blueGray-500 font-sans text-sm mb-4 flex-grow">
            {periodeAffichee}
          </p>
        )}
        <span className="inline-block mt-auto text-gold group-hover:text-gold-dark font-semibold font-sans self-start">
          En savoir plus &rarr;
        </span>
      </div>
    </Link>
  );
};


// --- Fonction de Récupération des Données ---
const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
async function fetchFullRelatedDoc(collectionSlug: string, id: string | number): Promise<any | null> { try { const apiUrl = `${payloadUrl}/api/${collectionSlug}/${id}?depth=0&locale=fr&fallback-locale=fr`; const response = await fetch(apiUrl, { cache: 'no-store' }); if (!response.ok) { console.error(`[fetchRelatedDoc] Erreur API pour ${collectionSlug} ID ${id} (${response.status}): ${await response.text()}`); return null; } return await response.json(); } catch (error) { console.error(`[fetchRelatedDoc] Exception pour ${collectionSlug} ID ${id}:`, error); return null; } }

async function getVerrerie(slug: string): Promise<VerrerieType | null> { 
  try { 
    const verrerieUrl = `${payloadUrl}/api/verreries?where[slug][equals]=${slug}&depth=1&locale=fr&fallback-locale=fr&limit=1`;
    const verrerieResponse = await fetch(verrerieUrl, { cache: 'no-store' });

    if (!verrerieResponse.ok) {
      console.error(`Erreur API Payload (${verrerieResponse.status}): ${await verrerieResponse.text()}`);
      throw new Error(`Failed to fetch verrerie: ${verrerieResponse.status}`);
    }

    const verrerieData = await verrerieResponse.json();
    if (!verrerieData.docs || verrerieData.docs.length === 0) {
      console.warn(`[getVerrerie] Aucune verrerie trouvée pour le slug: ${slug}`);
      return null;
    }

    const verrerie = verrerieData.docs[0] as VerrerieType;

    // === ÉTAPE 2 : Récupérer les engagements liés à cette verrerie SÉPARÉMENT ===
    // On va chercher dans la collection 'engagements' tous ceux dont le champ 'verrerie' est l'ID de notre verrerie.
    // Assurez-vous que dans votre collection 'Engagements', le champ de relation vers une verrerie s'appelle bien 'verrerie'.
    const engagementsUrl = `${payloadUrl}/api/engagements?where[verrerie][equals]=${verrerie.id}&depth=2&limit=100`;
    const engagementsResponse = await fetch(engagementsUrl, { cache: 'no-store' });

    if (engagementsResponse.ok) {
      const engagementsData = await engagementsResponse.json();
      // On attache manuellement les engagements récupérés à notre objet verrerie.
      verrerie.engagements = engagementsData.docs;
    } else {
      console.error(`Impossible de récupérer les engagements pour la verrerie ${verrerie.id}`);
      verrerie.engagements = []; // S'assurer que le champ est un tableau vide en cas d'erreur
    }

    if (verrerie.fondateurs && verrerie.fondateurs.length > 0) { 
      const populatedFondateurs = await Promise.all( verrerie.fondateurs.map(async (personOrId) => { 
        if (personOrId && (typeof personOrId === 'string' || typeof personOrId === 'number')) {
          return await fetchFullRelatedDoc('personnalites', personOrId); 
        } 
        return personOrId; 
      }) 
    ); 
    verrerie.fondateurs = populatedFondateurs.filter(p => p !== null) as VerrierType[]; 
  } 
  return verrerie; 
  } catch (error) { 
    console.error("[getVerrerie]", error); return null; 
  } 
}

type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const verrerie = await getVerrerie(slug); // Récupérer les données pour le titre

  if (!verrerie) {
    return {
      title: 'Verrerie inconnue',
    };
  }

  return {
    title: verrerie.nomPrincipal, // Le titre de la page sera "Nom de la Verrerie | Radix Vitri"
    description: `Histoire de la ${verrerie.nomPrincipal}. ${verrerie.periodeVerriere?.periodeActiviteTexte || ''}`,
    // Vous pouvez ajouter d'autres métadonnées ici (openGraph, etc.)
  };
}

// --- Composant de Page ---
export default async function VerreriePage({ params }: VerreriePageProps) {
  const { slug } = await params;
  const verrerie = await getVerrerie(slug);

  console.log("Données brutes pour la verrerie (nombre d'engagements) :", JSON.stringify(verrerie?.engagements?.length, null, 2));

  if (!verrerie) {
    notFound(); // Si la verrerie n'est pas trouvée, on affiche une page 404
  }

  // Vérification des données de la verrerie (galerie d'images)
  console.log("Données brutes pour la galerie (nombre d'images) :", JSON.stringify(verrerie?.imagesEtMedias?.length, null, 2));
  

  const nomsHistoriquesTries = verrerie.nomsHistoriquesEtRaisonsSociales?.sort((a, b) => {
    const anneeA = a.anneeDebut || (a.periodeValidite ? parseInt(a.periodeValidite.split('-')[0]) : 0) || 0;
    const anneeB = b.anneeDebut || (b.periodeValidite ? parseInt(b.periodeValidite.split('-')[0]) : 0) || 0;
    return anneeA - anneeB;
  }) || [];

  // Extraire les données du lieu principal de manière sécurisée
  const lieu = (verrerie.lieuPrincipal && typeof verrerie.lieuPrincipal === 'object')
    ? verrerie.lieuPrincipal as LieuType
    : null;

  // Filtre les engagements de type "rôle de personnalité" (directeur, propriétaire...)
  const personnalitesEngagements = verrerie.engagements?.filter(
    eng => eng.typeEngagement === 'role_personnalite' &&
          typeof eng.personneConcernee === 'object' && // On vérifie que personneConcernee est un objet...
          eng.personneConcernee !== null                // ...et pas null
  ) || [];

  // Filtre les engagements de type "métier de verrier" (souffleur, tailleur...)
  const verriersEngagements = verrerie.engagements?.filter(
    eng => eng.typeEngagement === 'metier_verrier' &&
          typeof eng.personneConcernee === 'object' && // Idem ici
          eng.personneConcernee !== null
  ) || [];

  // AJOUTEZ CES LIGNES DE DÉBOGAGE
  console.log('Nombre de personnalités après filtrage:', personnalitesEngagements.length);
  console.log('Nombre de verriers après filtrage:', verriersEngagements.length);

  // NOUVELLE LOGIQUE DE GROUPEMENT POUR LES PERSONNALITÉS
  const personnalitesGroupees: PersonneAvecEngagements<VerrierType>[] = (() => {
    if (!personnalitesEngagements || personnalitesEngagements.length === 0) return [];
    const map = new Map<string | number, PersonneAvecEngagements<VerrierType>>();

    // 1. Trier les engagements globaux (personnalitesEngagements) si pas déjà fait par l'API
    // Cela assure que si une personne a plusieurs engagements, ils sont ajoutés dans l'ordre
    const engagementsTries = [...personnalitesEngagements].sort((a, b) => {
      const anneeA = a.dateDebutStructurée?.anneeDebutSort || 9999;
      const moisA = a.dateDebutStructurée?.moisDebutSort || 13; // 13 pour mettre les mois inconnus après les mois connus
      const anneeB = b.dateDebutStructurée?.anneeDebutSort || 9999;
      const moisB = b.dateDebutStructurée?.moisDebutSort || 13;
      if (anneeA !== anneeB) return anneeA - anneeB;
      return moisA - moisB;
    });

    for (const engagement of engagementsTries) {
      if (engagement.personneConcernee && typeof engagement.personneConcernee === 'object') {
        const personne = engagement.personneConcernee as unknown as VerrierType; // Accès direct !
        
        let fonctionNom: string | undefined = undefined;
        if (engagement.fonctionPersonnalite && typeof engagement.fonctionPersonnalite === 'object' && 'nom' in engagement.fonctionPersonnalite) {
          fonctionNom = (engagement.fonctionPersonnalite as Fonction).nom;
        }

        if (!map.has(personne.id)) {
          map.set(personne.id, {
            personne: personne, // personne est de type VerrierType
            engagementsDetails: []
          });
        }
        map.get(personne.id)!.engagementsDetails.push({
          engagementId: engagement.id,
          fonction: fonctionNom,
          periode: formatPeriode(
            engagement.dateDebutStructurée as DateDebut,
            engagement.dateFinStructurée as DateFin
          ),
        });
      }
    }
    return Array.from(map.values());
  })();

  // FAIRE DE MÊME POUR 'verriersGroupes' en adaptant les types et champs
  const verriersGroupes: PersonneAvecEngagements<VerrierType>[] = (() => {
    if (!verriersEngagements || verriersEngagements.length === 0) return [];
    const map = new Map<string | number, PersonneAvecEngagements<VerrierType>>();
    const engagementsTries = [...verriersEngagements].sort((a, b) => { /* ... même logique de tri ... */
        const anneeA = a.dateDebutStructurée?.anneeDebutSort || 9999;
        const moisA = a.dateDebutStructurée?.moisDebutSort || 13;
        const anneeB = b.dateDebutStructurée?.anneeDebutSort || 9999;
        const moisB = b.dateDebutStructurée?.moisDebutSort || 13;
        if (anneeA !== anneeB) return anneeA - anneeB;
        return moisA - moisB;
    });

    for (const engagement of engagementsTries) {
      if (engagement.personneConcernee && typeof engagement.personneConcernee === 'object') {
        const personne = engagement.personneConcernee as unknown as VerrierType; 
        
        let fonctionNom: string | undefined = undefined;
        // CORRECTION DE LA CONDITION ET DE L'ASSIGNATION CI-DESSOUS :
        if (engagement.fonctionVerrier && 
            typeof engagement.fonctionVerrier === 'object' && 
            engagement.fonctionVerrier !== null && // S'assurer qu'il n'est pas null
            'nom' in engagement.fonctionVerrier) { 
          fonctionNom = (engagement.fonctionVerrier as Fonction).nom;
        }

        if (!map.has(personne.id)) {
          map.set(personne.id, {
            personne: personne,
            engagementsDetails: []
          });
        }
        map.get(personne.id)!.engagementsDetails.push({
          engagementId: engagement.id,
          fonction: fonctionNom,
          periode: formatPeriode(
            engagement.dateDebutStructurée as DateDebut,
            engagement.dateFinStructurée as DateFin
          ),
        });
      }
    }
    return Array.from(map.values());
  })();

  // PRÉPARER LES DONNÉES POUR LA CARTE DE CETTE VERRERIE SPÉCIFIQUE
  let verreriePourLaCarte: MapPoint[] = [];
  if (lieu && lieu.coordonnees && verrerie.slug && verrerie.nomPrincipal) {
    verreriePourLaCarte = [{
      id: verrerie.id,
      slug: verrerie.slug,
      nomPrincipal: verrerie.nomPrincipal,
      coordonnees: lieu.coordonnees,
      villeOuCommune: lieu.villeOuCommune,
    }];
  }

  // Préparer les images pour la galerie
  const imagesPourGalerie = verrerie.imagesEtMedias
    ?.filter(img => typeof img?.url === 'string') // On garde le filtre de sécurité
    .map(img => ({
      ...img,
      // On construit l'URL complète ici, côté serveur !
      url: `${process.env.NEXT_PUBLIC_PAYLOAD_URL || ''}${img.url}`,
    }));

  let suggestions = [];
  
  // On essaie d'abord de récupérer le pays de la verrerie actuelle
  const pays = (typeof verrerie.lieuPrincipal === 'object' && verrerie.lieuPrincipal.pays) 
    ? verrerie.lieuPrincipal.pays 
    : null;

  const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
  const suggestionsApiUrl = new URL(`${payloadUrl}/api/verreries`);

  // Si on a un pays, on l'utilise pour filtrer. Sinon, on ne met pas de filtre géographique.
  if (pays) {
    suggestionsApiUrl.searchParams.append('where[lieuPrincipal.pays][equals]', pays);
  }

  suggestionsApiUrl.searchParams.append('where[id][not_equals]', verrerie.id); // Toujours exclure la verrerie actuelle
  suggestionsApiUrl.searchParams.append('limit', '20'); // On prend une liste plus large pour avoir du hasard
  suggestionsApiUrl.searchParams.append('depth', '1');

  try {
    const suggestionsResponse = await fetch(suggestionsApiUrl.toString(), { cache: 'no-store' });
    if (suggestionsResponse.ok) {
      const suggestionsData = await suggestionsResponse.json();
      if (suggestionsData.docs && suggestionsData.docs.length > 0) {
        // On mélange le tableau de résultats et on en prend les 2 premiers
        suggestions = suggestionsData.docs.sort(() => 0.5 - Math.random()).slice(0, 2);
      }
      console.log(`Suggestions aléatoires trouvées:`, suggestions.length);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des suggestions:", error);
  }

  return (
    <div className="bg-cream text-blueGray-700 font-serif min-h-screen"> 
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12"> 
        <header className="mb-10 md:mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-limelight text-blueGray-800 mb-3 tracking-tight">
            {verrerie.nomPrincipal}
          </h1>
          {verrerie.nomsHistoriquesEtRaisonsSociales && verrerie.nomsHistoriquesEtRaisonsSociales.length > 0 && (
            <p className="text-blueGray-500 text-lg font-sans mt-1">
              <span className="italic">Aussi connue sous : </span> 
              {verrerie.nomsHistoriquesEtRaisonsSociales
                .filter(nh => nh.nom !== verrerie.nomPrincipal) // Optionnel: exclure le nom principal s'il y est
                .map(nh => nh.nom) // Prendre juste le nom
                .join(' - ') // Les joindre avec un séparateur
              }
            </p>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-12 gap-y-10"> 
          <main className="lg:col-span-2 space-y-8"> 
            
            {nomsHistoriquesTries.length > 0 && (
              <section id="noms-historiques" className="mb-12"> {/* Ajout de mb-12 pour espacer de la section suivante */}
                <h2 className="text-3xl font-bold text-blueGray-800 mb-6 border-b-2 border-blueGray-200 pb-3 font-serif">
                  Noms et raisons sociales au fil du temps
                </h2>
                <ul className="space-y-2 font-sans text-sm list-none pl-0"> {/* list-none pour enlever les puces par défaut si non désiré */}
                  {nomsHistoriquesTries.map((item, index) => (
                    <li key={item.id || `nom-hist-${index}`} className="p-3 bg-white rounded-md shadow-sm border border-blueGray-100">
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-base text-blueGray-700">{item.nom}</span>
                        {item.typeDeNom && (
                          <span className="text-xs text-gold italic ml-2">
                            {item.typeDeNom === "raison_sociale" ? "Raison Sociale" : /* ... autres labels ... */ "Nom d'Usage"}
                          </span>
                        )}
                      </div>
                      {item.periodeValidite && (
                        <div className="text-xs text-blueGray-500 mt-0.5">Période : {item.periodeValidite}</div>
                      )}
                      {item.notes && (
                        <p className="mt-1 text-xs text-blueGray-600 whitespace-pre-line bg-blueGray-50 p-2 rounded">{item.notes}</p> // Notes avec un léger fond pour les distinguer
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {verrerie.histoire && ( 
              <section id="histoire" className="scroll-mt-28 prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-blueGray-800 prose-a:text-gold prose-strong:text-blueGray-800 prose-blockquote:border-gold prose-blockquote:text-blueGray-600">
                <h2 className="text-3xl font-bold text-blueGray-800 mb-6 border-b-2 border-blueGray-200 pb-3 font-serif">
                  Histoire
                </h2>
                <ArticleContentRenderer content={verrerie.histoire} /> 
              </section> 
            )}

            {/* NOUVELLE SECTION UNIFIÉE POUR LES PERSONNES LIÉES */}
            <section id="personnes-liees" className="scroll-mt-28">

              {/* La grille qui contiendra nos deux colonnes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                {/* Colonne 1: Personnalités Clés */}
                <div id="personnalites-cles">
                  <h2 className="text-3xl font-semibold text-blueGray-800 mb-5 font-serif border-b ...">
                    Personnalités Clés
                  </h2>
                  <div className="space-y-4">
                    {personnalitesGroupees.map(item => (
                      <PersonneCard 
                        key={item.personne.id} 
                        personne={item.personne} 
                        engagements={item.engagementsDetails} 
                      />
                    ))}
                  </div>
                </div>

                {/* Colonne 2: Verriers Associés */}
                <div id="verriers-associes">
                  <h2 className="text-3xl font-semibold text-blueGray-800 mb-5 font-serif border-b ...">
                    Verriers Associés
                  </h2>
                  <div className="space-y-4">
                    {verriersGroupes.map(item => (
                      <PersonneCard 
                        key={item.personne.id} 
                        personne={item.personne} 
                        engagements={item.engagementsDetails} 
                      />
                    ))}
                  </div>
                </div>
                
              </div>
            </section>

            {/* Section pour la galerie d'images */}
            {verrerie.imagesEtMedias && verrerie.imagesEtMedias.length > 0 && (
              <section id="galerie" className="mt-16 scroll-mt-28">
                <h2 className="text-3xl font-bold text-blueGray-800 mb-8 border-b-2 border-blueGray-200 pb-4 font-serif">
                  Galerie d&apos;Images {/* Correction : apostrophe échappée */}
                </h2>
                <GalerieVerrerie images={imagesPourGalerie || []} />
              </section>
            )}
            {verrerie.sourcesBibliographiques && verrerie.sourcesBibliographiques.length > 0 && ( <section id="sources" className="mt-16"> <h2 className="text-3xl font-bold text-blueGray-800 mb-8 border-b-2 border-blueGray-200 pb-4 font-serif">Sources</h2> <ul className="list-disc list-inside space-y-2 text-blueGray-600 font-sans text-sm"> {verrerie.sourcesBibliographiques.map(source => ( <li key={source.id || Math.random().toString(36).substr(2, 9)}> <strong>{source.titre || 'Source non titrée'}</strong> {source.auteur && ` par ${source.auteur}`} {source.detailsPublication && ` (${source.detailsPublication})`} {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark hover:underline decoration-gold hover:decoration-gold-dark ml-1"> [Lien]</a>} </li> ))} </ul> </section> )}
            
            {suggestions && suggestions.length > 0 && (
              <section id="suggestions" className="mt-16 pt-8 border-t-2 border-blueGray-200">
                <h2 className="text-3xl font-bold text-blueGray-800 mb-10 font-serif">
                  À Découvrir Aussi
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* On utilise notre nouveau composant, inspiré de celui qui marche */}
                  {suggestions.map((suggestion: VerrerieType) => (
                    <SuggestionCard key={suggestion.id} verrerie={suggestion} />
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6 rounded-xl p-1">
              {/* Bloc de navigation latérale */}
              <PageNavigationMenu />

              {/* Bloc Informations Clés */}
              <div className="bg-white p-6 rounded-xl shadow-xl border border-blueGray-100">
                <h3 className="text-2xl font-semibold text-blueGray-800 mb-5 font-serif">Informations Clés</h3>
                <dl className="space-y-1 text-blueGray-600 font-sans text-sm">
                  {verrerie.fondateurs && verrerie.fondateurs.length > 0 && (
                    <div className="flex pt-1">
                      <strong className="font-bold text-blueGray-700 w-28 shrink-0">Fondateur(s) :</strong>
                      <div>
                        {verrerie.fondateurs.map((fondateur, index) => {
                          if (typeof fondateur === 'object' && fondateur !== null) {
                            const nomComplet = `${fondateur.prenom || ''} ${fondateur.nom || ''}`.trim() || 'Nom inconnu';
                            return (
                              <React.Fragment key={fondateur.id}>
                                {fondateur.slug 
                                  ? <Link href={`/verriers/${fondateur.slug}`} className="text-gold hover:text-gold-dark">{nomComplet}</Link>
                                  : nomComplet}
                                {index < verrerie.fondateurs!.length - 1 && ', '}
                              </React.Fragment>
                            );
                          }
                          return <span key={fondateur as string | number} className="italic">ID: {fondateur}</span>;
                        })}
                      </div>
                    </div>
                  )}
                  {lieu?.villeOuCommune && (
                    <div className="flex pt-1">
                      <strong className="font-bold text-blueGray-700 w-28 shrink-0">Ville :</strong>
                      <span>{lieu.villeOuCommune}</span>
                    </div>
                  )}
                  {lieu?.adresse && (
                    <div className="flex pt-1">
                      <strong className="font-bold text-blueGray-700 w-28 shrink-0">Adresse :</strong>
                      <span>{lieu.adresse}</span>
                    </div>
                  )}
                  {verrerie.periodeVerriere?.periodeActiviteTexte && (
                    <div className="flex pt-1">
                      <strong className="font-bold text-blueGray-700 w-28 shrink-0">Période :</strong>
                      <span>{verrerie.periodeVerriere?.periodeActiviteTexte}</span>
                    </div>
                  )}
                  {/* Vous pouvez aussi afficher les années approx si periodeActiviteTexte n'est pas assez précis ou en complément */}
                  {(!verrerie.periodeVerriere?.periodeActiviteTexte && (verrerie.periodeVerriere?.anneeFondationApprox || verrerie.periodeVerriere?.anneeFermetureApprox)) && (
                    <div className="flex pt-1">
                      <strong className="font-bold text-blueGray-700 w-28 shrink-0">Activité (env.) :</strong>
                      <span>
                        {verrerie.periodeVerriere?.anneeFondationApprox || '?'} - {verrerie.periodeVerriere?.anneeFermetureApprox || 'Actuelle'}
                      </span>
                    </div>
                  )}
                  {verrerie.statutActuel && (
                    <div className="flex pt-1">
                      <strong className="font-bold text-blueGray-700 w-28 shrink-0">Statut :</strong>
                      <span>{getStatutLabel(verrerie.statutActuel)}</span> {/* Bien utiliser la fonction, sinon on affiche la value/key */}
                    </div>
                  )}
                  {verrerie.notesStatutVestiges && ( 
                    <div className="pt-1">
                      <strong className="font-bold text-blueGray-700 block mb-0.5">Notes statut :</strong>
                      <TruncatedText text={verrerie.notesStatutVestiges} charLimit={250} lineLimitForClamp={3} />
                    </div> 
                  )}
                </dl>
                {/* On intègre la carte directement ici */}
                {verreriePourLaCarte.length > 0 && (
                  <div className="mt-5">
                    <strong className="font-bold font-sans text-blueGray-700 block mb-2">Localisation :</strong>
                    <div className="h-48 rounded-lg overflow-hidden border border-blueGray-200"> {/* Hauteur réduite à h-48 */}
                      <MapLoader
                        points={verreriePourLaCarte}
                        disableMapAnimation={true}
                      />
                    </div>
                  </div>
                )}
              </div>
              {/* Bloc de retour en haut */}
              <BackToTop />
            </div> 
          </aside>
        </div>
      </div>
    </div>
  );
}