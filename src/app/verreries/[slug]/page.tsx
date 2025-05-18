// Fichier : src/app/verreries/[slug]/page.tsx

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; 
import MapLoader from '@/components/MapLoader'; 
import ArticleContentRenderer from '@/components/ArticleContentRenderer';

// --- Définitions des Interfaces ---
interface MediaItem { id: string; url?: string; filename?: string; alt?: string; width?: number; height?: number; mimeType?: string; caption?: string; }
interface DateGroup { datePreciseCreation?: string | null; descriptionDateCreation?: string | null; datePreciseFermeture?: string | null; descriptionDateFermeture?: string | null;}
interface SourceBibliographique { id?: string; typeSource?: string; titre?: string; auteur?: string; url?: string; detailsPublication?: string; citationOuExtrait?: string; notesSource?: string; }
interface NomAlternatif { id?: string; typeDeNom?: string; nom?: string; }

interface PersonnaliteType {
  id: string | number;
  nom?: string; 
  prenom?: string;
  nomComplet?: string; 
  slug?: string; 
}

interface VerrierType {
  id: string | number;
  nom?: string; 
  prenom?: string;
  nomComplet?: string; 
  slug?: string;
}

interface EngagementType {
  id: string;
  personneConcernee?: { 
    relationTo: 'personnalites' | 'verriers';
    value: PersonnaliteType | VerrierType; 
  };
  typeEngagement?: 'role_personnalite' | 'metier_verrier';
  fonctionOuMetier?: string; 
  periodeActiviteTexte?: string; 
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

// AJOUT/VÉRIFICATION : Interface pour les points de la carte (doit correspondre à celle utilisée par MapLoader/VerrerieMap)
interface MapPoint {
  id: string;
  slug: string;
  nomPrincipal: string;
  coordonnees: [number, number]; // [longitude, latitude]
  villeOuCommune?: string;
}

interface VerrerieType {
  id: string; 
  nomPrincipal: string; 
  slug: string; 
  nomsAlternatifs?: NomAlternatif[]; 
  dateDeCreation?: { datePreciseCreation?: string | null; descriptionDateCreation?: string | null; }; 
  dateDeFermeture?: { datePreciseFermeture?: string | null; descriptionDateFermeture?: string | null; };
  statutActuel?: string; 
  notesStatutVestiges?: string; adresse?: string; ville?: string; coordonnees?: [number, number]; 
  lieuPrincipal?: LieuType | string;
  imagesEtMedias?: MediaItem[]; 
  sourcesBibliographiques?: SourceBibliographique[]; 
  fondateurs?: (PersonnaliteType | string | number)[]; 
  typesDeProduction?: Array<{ id: string; nom?: string; slug?: string }>; 
  engagements?: EngagementType[]; 
  histoire?: any; techniquesInnovations?: string; aspectsSociaux?: any; 
}
interface VerreriePageProps { params: { slug: string; }; }

// --- Fonctions Utilitaires ---
const formatDate = (dateString?: string | null): string | null => { if (!dateString) return null; try { const date = new Date(dateString); if (isNaN(date.getTime())) { const yearMatch = dateString.match(/\d{4}/); if (yearMatch) return yearMatch[0]; return dateString; } return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`; } catch (_e) { return dateString; } };
const displayDateGroup = (datePrecise?: string | null, descriptionDate?: string | null): string => { const formattedPreciseDate = formatDate(datePrecise); if (formattedPreciseDate && datePrecise && !isNaN(new Date(datePrecise).getTime())) { return formattedPreciseDate; } if (descriptionDate) { return descriptionDate; } return 'N/A';};

// --- Composants de Rendu Spécifiques ---
// const ArticleContentRenderer: React.FC<{ content: any }> = ({ content }) => { if (!content || !content.root || !content.root.children) { return <p className="italic text-blueGray-500">Contenu non disponible.</p>; } const renderNodes = (nodes: any[], parentKey: string = 'node'): (JSX.Element | string)[] => { return nodes.map((node, index) => { const key = `${parentKey}-${node.type || 'unknown'}-${index}-${node.format || ''}-${Math.random().toString(36).substr(2, 5)}`; if (node.type === 'paragraph') { return <p key={key} className="mb-4 last:mb-0">{renderNodes(node.children || [], key)}</p>; } if (node.type === 'heading') { const Tag = node.tag as keyof JSX.IntrinsicElements; return <Tag key={key}>{renderNodes(node.children || [], key)}</Tag>; } if (node.type === 'list') { const ListTag = node.tag === 'ol' ? 'ol' : 'ul'; return <ListTag key={key} className={ListTag === 'ol' ? 'list-decimal pl-5 mb-4' : 'list-disc pl-5 mb-4'}>{renderNodes(node.children || [], key)}</ListTag>; } if (node.type === 'listitem') { return <li key={key} className="mb-1">{renderNodes(node.children || [], key)}</li>; } if (node.type === 'link') { const linkType = node.fields?.linkType; const doc = node.fields?.doc; const url = node.fields?.url; const newTab = node.fields?.newTab; const childrenContent = renderNodes(node.children || [], key); if (linkType === 'internal' && doc?.value && typeof doc.value === 'object' && doc.value !== null && doc.value.slug) { const href = `/${doc.relationTo}/${doc.value.slug}`; return <Link key={key} href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined} className="text-gold hover:text-gold-dark underline">{childrenContent}</Link>; } else if (linkType === 'custom' && url) { return <a key={key} href={url} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined} className="text-gold hover:text-gold-dark underline">{childrenContent}</a>; } return <React.Fragment key={key}>{childrenContent}</React.Fragment>; } if (node.type === 'text') { let textElement: JSX.Element | string = <React.Fragment key={`text-${key}`}>{node.text}</React.Fragment>; if (node.format === 1) textElement = <strong key={`strong-${key}`}>{textElement}</strong>; if (node.format === 2) textElement = <em key={`em-${key}`}>{textElement}</em>; if (node.format === 8) textElement = <code key={`code-${key}`}>{textElement}</code>; return textElement; } if (node.type === 'linebreak') { return <br key={key} />; } return node.text || ''; }).filter(item => item !== null && item !== ''); }; return <>{renderNodes(content.root.children, 'root')}</>; };
const InlineDocument: React.FC<{ src?: string; caption?: string; altText?: string }> = ({ src, caption, altText }) => {
  if (!src) return null;
  const payloadBaseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
  const imageUrl = `${payloadBaseUrl}${src}`;
  return (
    <figure className="my-8 clear-both overflow-hidden rounded-lg border border-blueGray-200 bg-white shadow-md max-w-xl mx-auto">
      <div className="relative w-full aspect-[4/3]">
        <Image src={imageUrl} alt={altText || caption || "Document historique"} fill className="object-contain max-h-[600px]" sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" />
      </div>
      {caption && <figcaption className="mt-2 text-sm text-blueGray-600 italic px-3 py-2 bg-blueGray-50 text-center font-sans">{caption}</figcaption>}
    </figure>
  );
};

// PersonalityListItem (pour affichage en liste simple dans la colonne principale)
const PersonalityListItem: React.FC<{person: PersonnaliteType, fonction?: string, periode?: string}> = ({ person, fonction, periode }) => {
  const nomCompletAffichage = person.nomComplet || `${person.prenom || ''} ${person.nom || ''}`.trim() || 'Personnalité Inconnue';
  return (
    // Gardez les classes de ce div comme dans la version que vous trouviez la plus acceptable visuellement
    // Le 'border-b border-blueGray-100 last:border-b-0' est le trait fin.
    <div className="flex items-center space-x-3 py-2 border-b border-blueGray-100 last:border-b-0">
      {/* Gardez votre icône et son conteneur comme vous les aviez */}
      <div className="w-8 h-8 rounded-full bg-blueGray-200 border border-gold flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blueGray-400 group-hover:text-gold transition-colors">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-1.5 min-w-0">
        <h4 className="font-semibold text-blueGray-700 font-serif leading-tight whitespace-nowrap">
          <Link
            href={person.slug ? `/personnalites/${person.slug}` : '#'}
            className="text-gold hover:text-gold-dark text-m no-underline hover:underline decoration-gold hover:decoration-gold-dark transition-colors"
          >
            {nomCompletAffichage}
          </Link>
        </h4>
        {(fonction || periode) &&
          <span className="text-s text-blueGray-600 font-sans whitespace-nowrap">
            {fonction}{fonction && periode && <span className="text-blueGray-400">, </span>}{periode && <span className="text-blueGray-500">{periode}</span>}
          </span>
        }
      </div>
    </div>
  );
};

const SuggestionCard: React.FC<{ name: string; period: string; link: string; image?: string }> = ({ name, period, link, image }) => {
  return (
    <Link href={link} className="block bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 group text-blueGray-600 no-underline">
      {image ? (
        <div className="relative w-full h-36 rounded-md mb-4 overflow-hidden">
         <Image src={image} alt={name} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        </div>
      ) : (
        <div className="w-full h-36 bg-blueGray-100 rounded-md mb-4 flex items-center justify-center text-blueGray-400 font-sans">Image N/A</div>
      )}
      <h3 className="text-lg font-semibold text-blueGray-800 font-serif mb-1">{name}</h3>
      <p className="text-xs text-blueGray-500 font-sans mb-3">{period}</p>
      <span className="inline-block text-sm text-gold group-hover:text-gold-dark font-semibold font-sans group-hover:underline decoration-gold group-hover:decoration-gold-dark">
        En savoir plus &rarr;
      </span>
    </Link>
  );
};

const VerrierListItem: React.FC<{verrier: VerrierType, metier?: string, periode?: string}> = ({ verrier, metier, periode }) => {
  const nomCompletAffichage = verrier.nomComplet || `${verrier.prenom || ''} ${verrier.nom || ''}`.trim() || 'Verrier Inconnu';
  return (
    <div className="flex items-center space-x-2 py-1 border-b border-blueGray-100 last:border-b-0">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth="1.5" 
      stroke="currentColor" 
      className="w-6 h-6 text-gold shrink-0"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 22h20M4 22V10l4-3 4 3 4-3 4 3v12M8 16h2m4 0h2M8 12h2m4 0h2M18 9V6h-2v3" />
    </svg>
      <div className="flex flex-wrap items-baseline gap-x-1.5 min-w-0"> 
        <h4 className="font-semibold text-blueGray-700 font-serif leading-tight whitespace-nowrap my-0">
          <Link href={verrier.slug ? `/verriers/${verrier.slug}` : '#'} className="text-gold hover:text-gold-dark no-underline hover:underline decoration-gold hover:decoration-gold-dark transition-colors">
            {nomCompletAffichage}
          </Link>
        </h4>
        {(metier || periode) && 
          <span className="text-xs text-blueGray-600 font-sans whitespace-nowrap">
            {metier && <span className="text-blueGray-700">{metier}</span>}
            {metier && periode && <span className="text-blueGray-400">, </span>}
            {periode && <span className="text-blueGray-500">{periode}</span>}
          </span>
        }
      </div>
    </div>
  );
};

// --- Fonction de Récupération des Données ---
const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
async function fetchFullRelatedDoc(collectionSlug: string, id: string | number): Promise<any | null> { try { const apiUrl = `${payloadUrl}/api/${collectionSlug}/${id}?depth=0&locale=fr&fallback-locale=fr`; const response = await fetch(apiUrl, { cache: 'no-store' }); if (!response.ok) { console.error(`[fetchRelatedDoc] Erreur API pour ${collectionSlug} ID ${id} (${response.status}): ${await response.text()}`); return null; } return await response.json(); } catch (error) { console.error(`[fetchRelatedDoc] Exception pour ${collectionSlug} ID ${id}:`, error); return null; } }
async function getVerrerie(slug: string): Promise<VerrerieType | null> { try { const apiUrl = `${payloadUrl}/api/verreries?where[slug][equals]=${slug}&depth=2&locale=fr&fallback-locale=fr&limit=1`; const response = await fetch(apiUrl, { cache: 'no-store' }); if (!response.ok) { console.error(`Erreur API Payload (${response.status}): ${await response.text()}`); throw new Error(`Failed to fetch verrerie: ${response.status}`); } const data = await response.json(); if (!data.docs || data.docs.length === 0) { console.warn(`[getVerrerie] Aucune verrerie trouvée pour le slug: ${slug}`); return null; } const verrerie = data.docs[0] as VerrerieType; if (verrerie.engagements && verrerie.engagements.length > 0) { const populatedEngagements = await Promise.all( verrerie.engagements.map(async (engagement) => { if (engagement.personneConcernee && (typeof engagement.personneConcernee.value === 'string' || typeof engagement.personneConcernee.value === 'number')) { const personneId = engagement.personneConcernee.value; const relationTo = engagement.personneConcernee.relationTo; const personneDetails = await fetchFullRelatedDoc(relationTo, personneId); if (personneDetails) { return { ...engagement, personneConcernee: { relationTo, value: personneDetails } }; } } return engagement; }) ); verrerie.engagements = populatedEngagements.filter(e => e !== null && e.personneConcernee && typeof e.personneConcernee.value === 'object') as EngagementType[]; } if (verrerie.fondateurs && verrerie.fondateurs.length > 0) { const populatedFondateurs = await Promise.all( verrerie.fondateurs.map(async (personOrId) => { if (personOrId && (typeof personOrId === 'string' || typeof personOrId === 'number')) { return await fetchFullRelatedDoc('personnalites', personOrId); } return personOrId; }) ); verrerie.fondateurs = populatedFondateurs.filter(p => p !== null) as PersonnaliteType[]; } return verrerie; } catch (error) { console.error("[getVerrerie]", error); return null; } }

// --- Composant de Page ---
export default async function VerreriePage({ params }: VerreriePageProps) {
  const resolvedParams = await params; 
  const { slug } = resolvedParams; 
  const verrerie = await getVerrerie(slug);

  if (!verrerie) {
    notFound(); 
  }
  
  const payloadBaseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
  const mockSuggestions = [ { name: "Verrerie de Givors", period: "1749 - XIXe", link: "#", image: "https://placehold.co/300x200/f9f6f2/2d3e50?text=Givors" }, { name: "Verrerie de Rive-de-Gier", period: "XVIIIe - XXe", link: "#", image: "https://placehold.co/300x200/f9f6f2/2d3e50?text=Rive-de-Gier" }, { name: "Cristallerie du Creusot", period: "1786 - 1930s", link: "#", image: "https://placehold.co/300x200/f9f6f2/2d3e50?text=Le+Creusot" }, ];

  // Extraire les données du lieu principal de manière sécurisée
  const lieu = (verrerie.lieuPrincipal && typeof verrerie.lieuPrincipal === 'object')
    ? verrerie.lieuPrincipal as LieuType
    : null;

  // Filtrer les engagements pour les personnalités (NE PLUS EXCLURE les fondateurs)
  const personnalitesEngagements = verrerie.engagements?.filter(
    eng => eng.personneConcernee?.relationTo === 'personnalites' && 
           typeof eng.personneConcernee.value === 'object'
  ) || [];

  const verriersEngagements = verrerie.engagements?.filter(
    eng => eng.personneConcernee?.relationTo === 'verriers' && 
           typeof eng.personneConcernee.value === 'object'
  ) || [];

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

  return (
    <div className="bg-cream text-blueGray-700 font-serif min-h-screen"> 
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12"> 
        <header className="mb-10 md:mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blueGray-800 mb-3 tracking-tight">
            {verrerie.nomPrincipal}
          </h1>
          {verrerie.nomsAlternatifs && verrerie.nomsAlternatifs.length > 0 && (
            <p className="text-blueGray-500 text-lg font-sans">
              <span className="italic">Aussi connue sous :</span> {verrerie.nomsAlternatifs.map((na, index) => <span key={na.id || `na-${index}`}>{na.nom}</span>).reduce((prev, curr, index) => <>{prev}{index > 0 ? ', ' : ''}{curr}</>)}
            </p>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-12 gap-y-10"> 
          <main className="lg:col-span-2 space-y-12"> 
            
            {verrerie.histoire && ( <section id="histoire" className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-blueGray-800 prose-a:text-gold prose-strong:text-blueGray-800 prose-blockquote:border-gold prose-blockquote:text-blueGray-600"> <ArticleContentRenderer content={verrerie.histoire} /> </section> )}
            {/* ... autres sections ... */}

            {/* Section "Personnalités Liées" (via Engagements) - dans la colonne principale */}
            {personnalitesEngagements.length > 0 && (
              <section id="personnalites-engagees" className="mt-10"> {/* Réduit le mt-16 à mt-10 */}
                <h2 className="text-2xl font-semibold text-blueGray-800 mb-5 font-serif border-b border-blueGray-200 pb-2.5"> {/* Titre un peu plus petit, marge et padding ajustés */}
                  Personnalités Clés
                </h2>
                <div className="space-y-0"> {/* Réduit l'espace entre les items à 0, car le py-2.5 et border-b de l'item gèrent déjà l'espacement */}
                  {personnalitesEngagements.map(engagement => {
                    if (engagement.personneConcernee && typeof engagement.personneConcernee.value === 'object' && engagement.personneConcernee.value !== null) {
                      return ( <PersonalityListItem key={engagement.id} person={engagement.personneConcernee.value as PersonnaliteType} fonction={engagement.fonctionOuMetier} periode={engagement.periodeActiviteTexte} /> );
                    }
                    return <div key={engagement.id} className="text-sm text-blueGray-500 italic">Données de personnalité incomplètes pour engagement ID: {engagement.id}</div>;
                  })}
                </div>
              </section>
            )}

            {verrerie.imagesEtMedias && verrerie.imagesEtMedias.length > 0 && (
              <section id="galerie" className="mt-16">
                <h2 className="text-3xl font-bold text-blueGray-800 mb-8 border-b-2 border-blueGray-200 pb-4 font-serif">
                  Galerie d&apos;Images {/* Correction : apostrophe échappée */}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {verrerie.imagesEtMedias.map((mediaItem) => {
                    // Assumant que 'mediaItem' est de type 'MediaItem' que vous avez défini
                    // et que si 'mediaItem' est un objet Upload de Payload, 'mediaItem.url' est le chemin relatif
                    // et 'mediaItem.width' / 'mediaItem.height' sont les dimensions de l'image originale.
                    // S'il s'agit d'une relation, 'mediaItem' pourrait être l'objet Media populé.

                    // Tentative de déterminer si mediaItem est un objet Media populé ou juste une chaîne d'ID
                    // (adaptez cette logique si mediaItem est toujours un objet à cause de depth=2)
                    const media = (typeof mediaItem === 'object' && mediaItem !== null) ? mediaItem : null;

                    if (media && media.url && typeof media.url === 'string' && media.url.trim() !== '') {
                      const imageUrl = `${payloadBaseUrl}${media.url}`;
                      const altText = media.alt || media.filename || `Image de la verrerie ${verrerie.nomPrincipal}`;
                      
                      // Dimensions pour next/image. Utiliser les dimensions réelles si disponibles, sinon des valeurs par défaut.
                      // Payload stocke souvent width/height sur l'objet media.
                      const imageWidth = typeof media.width === 'number' && media.width > 0 ? media.width : 600; // Valeur par défaut raisonnable
                      const imageHeight = typeof media.height === 'number' && media.height > 0 ? media.height : 400; // Valeur par défaut raisonnable

                      return (
                        <div
                          key={media.id || media.url} // Utiliser media.id si disponible, sinon media.url comme clé
                          className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group bg-slate-50 aspect-[4/3]" // Utiliser aspect-ratio pour la responsivité de la hauteur
                        >
                          <Image
                            src={imageUrl}
                            alt={altText}
                            fill // Fait que l'image remplit le conteneur parent. Le parent doit avoir une position relative.
                            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                            // Pour 'fill', width et height ne sont pas nécessaires sur Image, mais le parent doit avoir des dimensions
                            // ou un ratio d'aspect. J'ai ajouté aspect-[4/3] au parent.
                            // Si vous ne voulez pas 'fill', vous devez fournir width et height à Image
                            // et ajuster le className (par exemple, w-full h-auto ou des dimensions fixes)
                            // width={imageWidth} // Nécessaire si 'fill' n'est pas utilisé
                            // height={imageHeight} // Nécessaire si 'fill' n'est pas utilisé
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" // Aide Next.js à choisir la bonne taille d'image source
                          />
                          {media.filename && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs text-center p-2 truncate transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                              {media.filename}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null; // Si media n'est pas valide ou n'a pas d'URL
                  })}
                </div>
              </section>
            )}
            {verrerie.sourcesBibliographiques && verrerie.sourcesBibliographiques.length > 0 && ( <section id="sources" className="mt-16"> <h2 className="text-3xl font-bold text-blueGray-800 mb-8 border-b-2 border-blueGray-200 pb-4 font-serif">Sources</h2> <ul className="list-disc list-inside space-y-2 text-blueGray-600 font-sans text-sm"> {verrerie.sourcesBibliographiques.map(source => ( <li key={source.id || Math.random().toString(36).substr(2, 9)}> <strong>{source.titre || 'Source non titrée'}</strong> {source.auteur && ` par ${source.auteur}`} {source.detailsPublication && ` (${source.detailsPublication})`} {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-dark hover:underline decoration-gold hover:decoration-gold-dark ml-1"> [Lien]</a>} </li> ))} </ul> </section> )}
            
            <section id="suggestions" className="mt-16 pt-8 border-t-2 border-blueGray-200">
                <h2 className="text-3xl font-bold text-blueGray-800 mb-8 text-center font-serif">À Découvrir Aussi</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
                  {mockSuggestions.map((suggestion, index) => (
                    <SuggestionCard key={index} {...suggestion} />
                  ))}
                </div>
            </section>
          </main>

          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-8"> 
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
                                  ? <Link href={`/personnalites/${fondateur.slug}`} className="text-gold hover:text-gold-dark">{nomComplet}</Link>
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
                  {verrerie.dateDeCreation && ( <div className="flex pt-1"> <strong className="font-bold text-blueGray-700 w-28 shrink-0">Création :</strong> <span>{displayDateGroup(verrerie.dateDeCreation.datePreciseCreation, verrerie.dateDeCreation.descriptionDateCreation)}</span> </div> )}
                  {verrerie.dateDeFermeture && ( <div className="flex pt-1"> <strong className="font-bold text-blueGray-700 w-28 shrink-0">Fermeture :</strong> <span>{displayDateGroup(verrerie.dateDeFermeture.datePreciseFermeture, verrerie.dateDeFermeture.descriptionDateFermeture)}</span> </div> )}
                  {verrerie.statutActuel && ( <div className="flex pt-1"><strong className="font-bold text-blueGray-700 w-28 shrink-0">Statut :</strong><span>{verrerie.statutActuel}</span></div>  )}
                  {verrerie.notesStatutVestiges && ( 
                    <div className="pt-1">
                      <strong className="font-bold text-blueGray-700 block mb-0.5">Notes statut :</strong>
                      <p className="whitespace-pre-line">{verrerie.notesStatutVestiges}</p>
                    </div> 
                  )}
                </dl>
              </div>

              {verreriePourLaCarte.length > 0 && ( // Vérifie s'il y a des données pour la carte
                <div className="bg-white p-6 rounded-xl shadow-xl border border-blueGray-100">
                  <h3 className="text-2xl font-semibold text-blueGray-800 mb-4 font-serif">Localisation</h3>
                  <div className="h-72 rounded-lg overflow-hidden border border-blueGray-200">
                    <MapLoader
                      points={verreriePourLaCarte} // Passer le tableau de points
                      // La prop 'nom' n'est plus nécessaire pour MapLoader car VerrerieMap la prend de chaque 'point'
                    />
                  </div>
                </div>
              )}

              {/* Bloc Verriers (dans la sidebar) */}
              {verriersEngagements.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-xl border border-blueGray-100">
                  <h3 className="text-2xl font-semibold text-blueGray-800 mb-5 font-serif">Verriers</h3>
                  <div className="space-y-1"> 
                    {verriersEngagements.map(engagement => {
                        if (engagement.personneConcernee && typeof engagement.personneConcernee.value === 'object' && engagement.personneConcernee.value !== null) {
                            return (
                                <VerrierListItem 
                                    key={engagement.id} 
                                    verrier={engagement.personneConcernee.value as VerrierType}
                                    metier={engagement.fonctionOuMetier}
                                    periode={engagement.periodeActiviteTexte}
                                />
                            );
                        }
                        return <div key={engagement.id} className="text-sm text-blueGray-500 italic">Données de verrier incomplètes pour engagement ID: {engagement.id}</div>;
                    })}
                  </div>
                </div>
              )}
            </div> 
          </aside>
        </div>
      </div>
    </div>
  );
}