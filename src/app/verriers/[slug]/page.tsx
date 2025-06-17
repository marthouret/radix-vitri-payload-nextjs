// src/app/verriers/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import MapLoader from '@/components/MapLoader'; 
import TimelineClient from '@/components/TimelineClient';
import { MapPoint, type EngagementDetailForPopup } from '@/types/map';
import ArticleContentRenderer from '@/components/ArticleContentRenderer'; 
import { formatPeriode, type DateDebut, type DateFin } from '@/utils/formatters';

// --- Définitions des Interfaces ---
interface EvenementBiographiqueFromAPI {
  id: string | number;
  typeEvenement?: string;
  dateEvenementTexte?: string;
  dateStructureeEvenement?: {
    anneeSort?: number;
    moisSort?: number;
    jourSort?: number;
    typePrecisionDate?: string;
  };
  lieu?: LieuSimplifie | string;
  descriptionEvenement?: string | null;
}

interface LieuType {
  id: string;
  nomDuLieu?: string;
  adresse?: string;
  villeOuCommune?: string;
  codePostal?: string;
  departement?: string;
  region?: string;
  pays?: string;
  coordonnees?: [number, number];
  nomCompletAffichage?: string;
  slug?: string;
}

interface FonctionSimplifiee { // Juste le nom de la fonction du Verrier ou de la Personnalité, pour l'affichage
  nom: string;
}

interface LieuSimplifie { // Juste les coordonnées et nom pour la carte/popup
  coordonnees?: [number, number]; // [longitude, latitude]
  villeOuCommune?: string; // Utile pour la popup
  nomDuLieu?: string;
  // Ajoutez d'autres champs du Lieu si nécessaire pour la popup
}

interface VerrerieSimplifiee { // Juste ce dont on a besoin de la verrerie pour la carte
  id: string;
  slug: string;
  nomPrincipal: string;
  lieuPrincipal?: LieuSimplifie | string; // string si non peuplé, objet si peuplé
}

interface EngagementPourCarte {
  id: string; // ID de l'engagement
  verrerie: VerrerieSimplifiee | string; // string si non peuplé
  fonctionVerrier?: FonctionSimplifiee | string;
  fonctionPersonnalite?: FonctionSimplifiee | string;
  typeEngagement: 'role_personnalite' | 'metier_verrier';
  periodeActiviteTexte?: string;
  // Champs de date structurée pour le tri (si besoin de les passer au client)
  dateDebutStructurée?: {
    anneeDebutSort?: number;
    moisDebutSort?: number;
    typePrecisionDateDebut: string
  };
  dateFinStructurée?: {
    anneeFinSort?: number;
    moisFinSort?: number;
    typePrecisionDateFin: string
  };
  descriptionEngagement: string;
}


interface FriseItem { // Définition de FriseItem
  title?: string;
  timelineContent?: React.ReactNode; // JSX personnalisé pour le contenu de la carte
  _type: 'engagement' | 'evenementBiographique';
  _datePourTri: Date;
  _idOriginal: string | number;
}

interface VerrierFromAPI {
  id: string;
  nom?: string;
  prenom?: string;
  nomComplet?: string;
  slug?: string;
  dateDeNaissance?: string;
  lieuDeNaissance?: LieuType | string;
  dateDeDeces?: string;
  lieuDeDeces?: LieuType | string;
  periodePrincipaleActivite?: string;
  specialisation?: string;
  notesBiographie?: any; // C'est le contenu RichText (Lexical JSON)
  engagements?: EngagementPourCarte[]; // Tableau des engagements (relations) du verrier courant
  evenementsBiographiques?: EvenementBiographiqueFromAPI[]; // Tableau des événements biographiques (relations) du verrier courant
}

interface VerrierPageProps {
  params: { slug: string };
}

const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';

// --- Fonctions Utilitaires ---


// Fonction de transformation
function transformerEngagementEnFriseItem(engagement: EngagementPourCarte): FriseItem {
  const {
    id, verrerie, fonctionVerrier, fonctionPersonnalite, typeEngagement,
    dateDebutStructurée, descriptionEngagement,
  } = engagement;

  const _idOriginal = id;
  const _type = 'engagement' as const;
  const anneeTri = dateDebutStructurée?.anneeDebutSort || 1;
  const moisTri = dateDebutStructurée?.moisDebutSort ? dateDebutStructurée.moisDebutSort - 1 : 0;
  const _datePourTri = new Date(anneeTri, moisTri, 1);
  
// On utilise notre fonction pour générer le titre de l'axe de la frise
  const titlePourAxe = formatPeriode(
      engagement.dateDebutStructurée as DateDebut,
      engagement.dateFinStructurée as DateFin
    ) || 'Période inconnue'; // On ajoute un texte par défaut si la période est vide

  let cardTitleText = 'Rôle non spécifié'; // Sera la fonction/métier
  if (typeEngagement === 'role_personnalite' && typeof fonctionPersonnalite === 'object' && fonctionPersonnalite?.nom) {
    cardTitleText = fonctionPersonnalite.nom;
  } else if (typeEngagement === 'metier_verrier' && typeof fonctionVerrier === 'object' && fonctionVerrier?.nom) {
    cardTitleText = fonctionVerrier.nom;
  }

  let cardSubtitleText: string | undefined = undefined; // Sera la verrerie + lieu
  let urlLien: string | undefined = undefined;
  let imagePourCarte: { url: string; alt: string } | undefined = undefined;
  const payloadBaseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || '';

  if (typeof verrerie === 'object' && verrerie !== null) {
    interface VerrerieAvecMediaPourFrise extends VerrerieSimplifiee {
        imagesEtMedias?: Array<{ url?: string; alt?: string; filename?: string; }>;
    }
    const verrerieObj = verrerie as VerrerieAvecMediaPourFrise;
    const nomVerrerie = verrerieObj.nomPrincipal || 'Verrerie non spécifiée';
    let localisationVerrerie = '';
    if (verrerieObj.lieuPrincipal && typeof verrerieObj.lieuPrincipal === 'object') {
      const lieuSimplifie = verrerieObj.lieuPrincipal as LieuSimplifie;
      localisationVerrerie = lieuSimplifie.villeOuCommune || lieuSimplifie.nomDuLieu || '';
    }
    cardSubtitleText = localisationVerrerie ? `${nomVerrerie} (${localisationVerrerie})` : nomVerrerie;
    if (verrerieObj.slug) urlLien = `/verreries/${verrerieObj.slug}`;

    if (verrerieObj.imagesEtMedias && verrerieObj.imagesEtMedias.length > 0) {
      const premiereImage = verrerieObj.imagesEtMedias[0];
      if (premiereImage && premiereImage.url) {
        imagePourCarte = {
          url: `${payloadBaseUrl}${premiereImage.url}`,
          alt: premiereImage.alt || premiereImage.filename || `Image de ${verrerieObj.nomPrincipal}`,
        };
      }
    }
  } else {
    cardSubtitleText = 'Verrerie (informations limitées)';
  }
  const cardDetailedTextValue = descriptionEngagement || undefined;

  const timelineContent = (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full text-left no-underline"> {/* Classes de base de votre carte */}
      {imagePourCarte && imagePourCarte.url ? (
        <div className="relative w-full h-40"> {/* Hauteur légèrement réduite pour la frise, ex: h-40 (10rem) ou h-32 (8rem). À ajuster. */}
          <img 
            src={imagePourCarte.url}
            alt={imagePourCarte.alt} 
            className="w-full h-full object-cover" // Style de votre image
          />
        </div>
      ) : (
        // Optionnel: Placeholder si pas d'image pour cet item, ou ne rien mettre
        // <div className="w-full h-20 bg-blueGray-100 flex items-center justify-center text-blueGray-400 font-sans">Pas d'image</div>
        null
      )}
      <div className="p-6 flex flex-col flex-grow"> {/* Padding un peu réduit (p-4 au lieu de p-6) */}
        {urlLien ? (
          <Link href={urlLien} className="no-underline" legacyBehavior={false}>
            <span className="text-gold hover:text-gold-dark font-serif font-semibold text-base hover:underline mb-1 line-clamp-2">
              {cardTitleText}
            </span>
          </Link>
        ) : (
          <h4 className="font-serif font-semibold text-base text-blueGray-800 mb-1 line-clamp-2">{cardTitleText}</h4>
        )}
        {cardSubtitleText && (
          <p className="text-blueGray-800 font-sans text-md font-semibold mt-1 mb-2 line-clamp-2">{cardSubtitleText}</p>
        )}
        {cardDetailedTextValue && (
          <p className="text-xs text-blueGray-600 font-sans line-clamp-6 flex-grow">{/* line-clamp-4 pour plus de texte */}
            {cardDetailedTextValue}
          </p>
        )}
      </div>
    </div>
  );

  return {
    title: titlePourAxe,
    timelineContent,
    _type,
    _datePourTri,
    _idOriginal,
  };
}

// Fonction de transformation pour les événements biographiques à positionner sur la frise chronologique
function transformerEvenementBiographiqueEnFriseItem(event: EvenementBiographiqueFromAPI): FriseItem {
  const {
    id, typeEvenement, dateEvenementTexte, dateStructureeEvenement, lieu, descriptionEvenement,
  } = event;

  // --- 1. Calcul de la date de tri (inchangé) ---
  const anneeTri = dateStructureeEvenement?.anneeSort || 9999;
  const moisTri = dateStructureeEvenement?.moisSort ? dateStructureeEvenement.moisSort - 1 : 0;
  const jourTri = dateStructureeEvenement?.jourSort || 1;
  const _datePourTri = new Date(anneeTri, moisTri, jourTri);

  // --- 2. Formatage de la date pour l'axe (AMÉLIORÉ) ---
  const formatDatePourAxe = (d?: typeof dateStructureeEvenement): string => {
    if (!d?.anneeSort) return 'Date inconnue';
    if (d.typePrecisionDate === 'CircaAnnee') return `env. ${d.anneeSort}`;

    // Si on a une date complète, on utilise toLocaleDateString pour un format littéral
    if (d.jourSort && d.moisSort) {
      return _datePourTri.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    // Fallbacks pour les dates partielles
    if (d.moisSort) return `${d.moisSort}/${d.anneeSort}`;
    return d.anneeSort.toString();
  };
  const titlePourAxe = dateEvenementTexte || formatDatePourAxe(dateStructureeEvenement);
  
  // --- 3. Formatage du titre de la carte (AMÉLIORÉ) ---
  const formatEventType = (type?: string): string => {
    if (!type) return 'Événement';
    const labels: { [key: string]: string } = {
      'naissance': 'Naissance',
      'deces': 'Décès',
      'mariage': 'Mariage',
      // Ajoutez ici d'autres correspondances si nécessaire
    };
    // Met la première lettre en majuscule et retourne le label si trouvé, sinon la valeur brute
    const label = labels[type] || type;
    return label.charAt(0).toUpperCase() + label.slice(1);
  };
  const cardTitleText = formatEventType(typeEvenement);

  // Le reste de la fonction est inchangé
  const cardSubtitleText = (lieu && typeof lieu === 'object') ? (lieu.nomDuLieu || lieu.villeOuCommune) : undefined;
  const cardDetailedTextValue = descriptionEvenement || undefined;

  const timelineContent = (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full text-left no-underline p-4">
      <h4 className="font-serif font-semibold text-base text-blueGray-800 mb-1 line-clamp-2">{cardTitleText}</h4>
      {cardSubtitleText && (
        <p className="text-blueGray-800 font-sans text-base font-semibold mt-1 mb-2 line-clamp-2">
          {cardSubtitleText}
        </p>
      )}
      {cardDetailedTextValue && (
        <p className="text-xs text-blueGray-600 font-sans line-clamp-4 flex-grow">{cardDetailedTextValue}</p>
      )}
    </div>
  );

  return {
    title: titlePourAxe,
    timelineContent,
    _type: 'evenementBiographique',
    _datePourTri,
    _idOriginal: id,
  };
}

// --- Fonctions de Récupération de Données ---
async function fetchFullLieu(id: string): Promise<LieuType | null> {
  try {
    const apiUrl = `${payloadUrl}/api/lieux/${id}?depth=0`; // Correction ici
    const response = await fetch(apiUrl, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`Erreur API Payload pour Lieu ID ${id} (${response.status}): ${await response.text()}`);
      return null;
    }
    return await response.json() as LieuType;
  } catch (error) {
    console.error(`[fetchFullLieu] Exception pour Lieu ID ${id}:`, error);
    return null;
  }
}

async function getVerrier(slug: string): Promise<VerrierFromAPI | null> {
  try {
    const apiUrl = `${payloadUrl}/api/verriers?where[slug][equals]=${slug}&depth=3&limit=1`; // depth=3 pour Verrier est OK
    const response = await fetch(apiUrl, { cache: 'no-store' });

    if (!response.ok) {
      console.error(`Erreur API Payload pour verrier (${response.status}): ${await response.text()}`);
      return null;
    }
    const data = await response.json();
    if (!data.docs || data.docs.length === 0) {
      console.warn(`[getVerrier] Aucun verrier trouvé pour le slug: ${slug}`);
      return null;
    }
    const verrier = data.docs[0] as VerrierFromAPI;

    // Peuplage des lieux de naissance/décès (votre logique existante, qui est bonne si depth ne suffit pas)
    if (verrier.lieuDeNaissance && typeof verrier.lieuDeNaissance === 'string') {
      const lieuDetails = await fetchFullLieu(verrier.lieuDeNaissance);
      if (lieuDetails) verrier.lieuDeNaissance = lieuDetails;
    }
    if (verrier.lieuDeDeces && typeof verrier.lieuDeDeces === 'string') {
      const lieuDetails = await fetchFullLieu(verrier.lieuDeDeces);
      if (lieuDetails) verrier.lieuDeDeces = lieuDetails;
    }

    // Récupère les Engagements séparément.
    if (verrier.id) {
      // CORRECTION DE L'URL CI-DESSOUS :
      const engagementsApiUrl = `${payloadUrl}/api/engagements?where[personneConcernee][equals]=${verrier.id}&depth=2&sort=dateDebutStructur%C3%A9e.anneeDebutSort,dateDebutStructur%C3%A9e.moisDebutSort&limit=100`;
      // Explication de la correction :
      // - On filtre directement sur 'personneConcernee' égal à l'ID du verrier.
      // - Plus besoin de 'personneConcernee.relationTo' car le champ pointe toujours vers 'verriers'.
      // - Plus besoin de 'personneConcernee.value' car ce n'est pas la manière de requêter sur une relation simple.

      const engagementsResponse = await fetch(engagementsApiUrl, { cache: 'no-store' });
      if (engagementsResponse.ok) {
        const engagementsData = await engagementsResponse.json();
        verrier.engagements = engagementsData.docs as EngagementPourCarte[];
        
        console.log(`[getVerrier] Engagements récupérés pour ${verrier.nomComplet}:`, verrier.engagements.length);

      } else {
        console.error(`Erreur API Payload pour les engagements du verrier ${verrier.id} (${engagementsResponse.status}): ${await engagementsResponse.text()}`);
        verrier.engagements = [];
      }
    } else {
      verrier.engagements = [];
    }

    // Récupère les Événements Biographiques séparément
    if (verrier.id) {
      // Pour les événements biographiques, un depth=1 ou 2 devrait suffire
      // depth=1 pour peupler le champ 'lieu' (car c'est une relation)
      const evenementsApiUrl = `${payloadUrl}/api/evenements-biographiques?where[personneConcernee][equals]=${verrier.id}&depth=1&sort=dateStructureeEvenement.anneeSort,dateStructureeEvenement.moisSort,dateStructureeEvenement.jourSort&limit=100`;
      
      const evenementsResponse = await fetch(evenementsApiUrl, { cache: 'no-store' });
      if (evenementsResponse.ok) {
        const evenementsData = await evenementsResponse.json();
        verrier.evenementsBiographiques = evenementsData.docs as EvenementBiographiqueFromAPI[];
        console.log(`[getVerrier] Événements Biographiques récupérés pour ${verrier.nomComplet}:`, verrier.evenementsBiographiques?.length || 0);
      } else {
        console.error(`Erreur API Payload pour les événements biographiques du verrier ${verrier.id} (${evenementsResponse.status}): ${await evenementsResponse.text()}`);
        verrier.evenementsBiographiques = [];
      }
    } else {
      verrier.evenementsBiographiques = [];
    }

    // Tri des engagements (votre logique existante)
    if (verrier.engagements) {
        verrier.engagements.sort((a, b) => {
            const anneeA = a.dateDebutStructurée?.anneeDebutSort || 9999;
            const moisA = a.dateDebutStructurée?.moisDebutSort || 13;
            const anneeB = b.dateDebutStructurée?.anneeDebutSort || 9999;
            const moisB = b.dateDebutStructurée?.moisDebutSort || 13;
            if (anneeA !== anneeB) return anneeA - anneeB;
            return moisA - moisB;
        });
    }

    return verrier;
  } catch (error) {
    console.error("[getVerrier]", error);
    return null;
  }
}

type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const verrier = await getVerrier(slug); // Récupérer les données pour le titre

  if (!verrier) {
    return {
      title: 'Verrier inconnu',
    };
  }

  return {
    title: verrier.nomComplet, // Le titre de la page sera "Nom du verrier | Radix Vitri"
    description: `Histoire de ${verrier.nomComplet} (${verrier?.dateDeNaissance || ''} - ${verrier?.dateDeDeces || ''})`,
    // Vous pouvez ajouter d'autres métadonnées ici (openGraph, etc.)
  };
}

// --- Composant de Page ---
export default async function VerrierPage({ params }: VerrierPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const verrier = await getVerrier(slug);

  if (!verrier) {
    notFound();
  }
  const nomCompletAffichage = verrier.nomComplet || `${verrier.prenom || ''} ${verrier.nom || ''}`.trim() || 'Verrier Inconnu';

  // --- PRÉPARATION DES DONNÉES POUR LA FRISE CHRONOLOGIQUE ---
  const engagementsFrise: FriseItem[] = verrier.engagements?.map(transformerEngagementEnFriseItem) || [];
  const evenementsBioFrise: FriseItem[] = verrier.evenementsBiographiques?.map(transformerEvenementBiographiqueEnFriseItem) || [];
  const friseItemsNonTriee: FriseItem[] = [...engagementsFrise, ...evenementsBioFrise];
  const friseItems: FriseItem[] = friseItemsNonTriee.sort((a, b) => {
    //getTime() convertit la date en millisecondes, permettant une comparaison numérique simple
    return a._datePourTri.getTime() - b._datePourTri.getTime();
  });
  
  // Logique de création des mapPointsEngagement (regroupement par verrerie)
  const mapPointsEngagement: MapPoint[] = (() => {
    if (!verrier || !verrier.engagements || verrier.engagements.length === 0) return [];

    const engagementsByVerrerieId: Record<string, {
      verrerieDoc: VerrerieSimplifiee;
      lieuDoc: LieuSimplifie;
      detailsDesEngagements: EngagementDetailForPopup[];
    }> = {};

    // Le tri a déjà été fait dans getVerrier, mais on peut le ré-assurer si besoin.
    // Pour cet exemple, je suppose que verrier.engagements est déjà trié.

    for (const eng of verrier.engagements) {
      const verrerieDoc = (typeof eng.verrerie === 'object' ? eng.verrerie : null);
      if (!verrerieDoc || !verrerieDoc.id) continue;

      const lieuPrincipalDoc = (verrerieDoc.lieuPrincipal && typeof verrerieDoc.lieuPrincipal === 'object' ? verrerieDoc.lieuPrincipal : null);
      if (!lieuPrincipalDoc || !lieuPrincipalDoc.coordonnees) continue;

      let fonctionNom: string | undefined = undefined;
      let typeEvenementAffichage: string | undefined = undefined;

      if (eng.typeEngagement === 'metier_verrier' && eng.fonctionVerrier && typeof eng.fonctionVerrier === 'object') {
        fonctionNom = (eng.fonctionVerrier as FonctionSimplifiee).nom;
        typeEvenementAffichage = 'Métier';
      } else if (eng.typeEngagement === 'role_personnalite' && eng.fonctionPersonnalite && typeof eng.fonctionPersonnalite === 'object') {
        fonctionNom = (eng.fonctionPersonnalite as FonctionSimplifiee).nom;
        typeEvenementAffichage = 'Rôle';
      }

      if (!engagementsByVerrerieId[verrerieDoc.id]) {
        engagementsByVerrerieId[verrerieDoc.id] = {
          verrerieDoc: verrerieDoc,
          lieuDoc: lieuPrincipalDoc,
          detailsDesEngagements: []
        };
      }
      engagementsByVerrerieId[verrerieDoc.id].detailsDesEngagements.push({
        fonction: fonctionNom,
        periode: formatPeriode(
          eng.dateDebutStructurée as DateDebut,
          eng.dateFinStructurée as DateFin
        ),
        typeEvenement: typeEvenementAffichage,
      });
    }

    return Object.values(engagementsByVerrerieId).map(data => {
      const point: MapPoint = { // Assigner explicitement au type MapPoint
        id: data.verrerieDoc.id.toString(), // S'assurer que l'ID est une chaîne
        slug: data.verrerieDoc.slug,
        nomPrincipal: data.verrerieDoc.nomPrincipal,
        coordonnees: data.lieuDoc.coordonnees as [number, number], // Type assertion si sûr du format
        villeOuCommune: data.lieuDoc.villeOuCommune,
        nomDuLieu: data.lieuDoc.nomDuLieu,
        popupDetails: {
          allEngagementsAtThisLocation: data.detailsDesEngagements
        }
      };
      return point;
    });
  })();

  // DEBUG
  console.log(`[VerrierPage] Verrier: ${nomCompletAffichage}`);
  console.log('[VerrierPage] mapPointsEngagement calculés:', JSON.stringify(mapPointsEngagement.slice(0,2), null, 2));
  console.log('[VerrierPage] Nombre de mapPointsEngagement:', mapPointsEngagement.length);
  console.log('[VerrierPage] Nombre d\'items pour la frise:', friseItems.length);

  return (
    <div className="bg-cream text-blueGray-700 font-serif min-h-screen">
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <header className="mb-10 md:mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blueGray-800 mb-2 tracking-tight">
            {nomCompletAffichage}
          </h1>
          {(verrier.dateDeNaissance || verrier.dateDeDeces) && (
            <p className="text-lg text-blueGray-500 font-sans">
              ( {verrier.dateDeNaissance || '?'} – {verrier.dateDeDeces || '?'} )
            </p>
          )}
          {verrier.specialisation && (
            <p className="text-2xl text-gold font-sans mt-1">{verrier.specialisation}</p>
          )}
        </header>

        {/* Le contenu principal prendra plus de largeur maintenant */}
        {/* L'ancien layout lg:grid-cols-3 n'est plus nécessaire si on supprime la sidebar */}
        <div className="space-y-12 md:space-y-16"> {/* Espacement vertical entre les sections */}

          {/* Section Biographie */}
          <section id="biographie">
            <h2 className="text-3xl font-bold text-blueGray-800 mb-6 border-b-2 border-blueGray-200 pb-3 font-serif max-w-4xl mx-auto">
              Biographie
            </h2>
            {verrier.notesBiographie && Object.keys(verrier.notesBiographie).length > 0 ? (
              <div className="prose prose-bluegray lg:prose-lg max-w-4xl mx-auto"> {/* Prose uniquement pour le contenu */}
                <ArticleContentRenderer content={verrier.notesBiographie} />
              </div>
            ) : (
              <p className="italic text-blueGray-500 max-w-4xl mx-auto">Aucune note biographique.</p>
            )}
          </section>

          {/* Section Frise Chronologique */}
          <section id="frise-chronologique" className="mt-12">
            <h2 className="text-3xl font-bold text-blueGray-800 mb-6 border-b-2 border-blueGray-200 pb-3 font-serif max-w-4xl mx-auto">
              Frise chronologique
            </h2>
            {friseItems.length > 0 ? (
              // Laisser TimelineClient gérer sa propre largeur (il devrait prendre 100% du conteneur)
              <TimelineClient items={friseItems} />
              ) : (
              <p className="italic text-blueGray-500 max-w-4xl mx-auto">Aucun événement à afficher dans la frise pour ce verrier.</p>
            )}
          </section>

          {/* Pour l'instant en pleine largeur. Nous pourrons revoir pour un layout 2/3 + 1/3 plus tard. */}
          <h2 className="text-3xl font-bold text-blueGray-800 mb-6 border-b-2 border-blueGray-200 pb-3 font-serif max-w-4xl mx-auto">
            Parcours Professionnel (Verreries)
          </h2>
          <section id="parcours-professionnel" className="mt-12">
            {mapPointsEngagement.length > 0 ? (
              <div className="h-[450px] md:h-[550px] lg:h-[600px] bg-gray-200 rounded-lg shadow-md max-w-5xl mx-auto"> {/* Hauteur augmentée et largeur max pour centrer */}
                <MapLoader 
                  points={mapPointsEngagement} 
                  defaultZoomLevel={5}
                  singlePointZoomLevel={13}
                  disableMapAnimation={mapPointsEngagement.length === 1}
                />
              </div>
            ) : (
              <p className="italic text-blueGray-500 max-w-4xl mx-auto">Aucun engagement dans des verreries avec localisation connue pour ce verrier.</p>
            )}
          </section>
          
          {/* L'ancienne <aside> a été supprimée. */}
          {/* Si vous voulez un layout 2/3 + 1/3 pour la carte et un futur bloc contextuel : */}
          {/*
          <section id="carte-et-contexte" className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 h-[450px] md:h-[550px] lg:h-[600px] bg-gray-200 rounded-lg shadow-md">
                {mapPointsEngagement.length > 0 ? (
                  <MapLoader points={mapPointsEngagement} ... />
                ) : (
                  <p>...</p>
                )}
              </div>
              <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-xl border border-blueGray-100">
                <h3 className="text-2xl font-semibold text-blueGray-800 mb-5 font-serif">Liens & Contextes</h3>
                <p className="italic text-blueGray-400">(Contenu post-MVP : mini-généalogie, autres verriers au même lieu, etc.)</p>
              </div>
            </div>
          </section>
          */}
        </div>
      </div>
    </div>
  );
}