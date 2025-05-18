// src/app/page.tsx
import Link from 'next/link';
import React from 'react';
import MapLoader from '@/components/MapLoader'; 
// ArticleContentRenderer n'est plus utilisé sur CETTE page si on simplifie les résumés
// import ArticleContentRenderer from '@/components/ArticleContentRenderer';

// --- Composants de Section (Placeholders pour l'instant) ---
const HeroSection = () => {
  return (
    <section className="bg-blueGray-800 text-white py-16 md:py-24 text-center">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
          Radix Vitri
        </h1>
        <p className="text-lg md:text-xl text-blueGray-300 max-w-3xl mx-auto">
          Un catalogue des verreries, de leurs fondateurs et ouvriers, pour préserver la mémoire de cet artisanat et de mes ancêtres verriers.
        </p>
      </div>
    </section>
  );
};

const CatalogueTeaser = () => {
  return (
    <section className="py-12 md:py-16 bg-cream">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-blueGray-800 mb-4 font-serif">
          Découvrez le catalogue des verreries
        </h2>
        <p className="text-blueGray-600 mb-8 max-w-2xl mx-auto font-sans">
          Explorez l&apos;histoire des usines de la vallée du Gier, de Lyon et d&apos;ailleurs, avec des détails sur leurs productions et acteurs.
        </p>
        <button
          type="button"
          className="bg-everglade hover:bg-everglade-clear text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-lg" // Correction: hover:scale-105 au lieu de hover:scale-
        >
          Explorer le catalogue
        </button>
      </div>
    </section>
  );
};

interface VerrerieMapPoint {
  id: string;
  slug: string;
  nomPrincipal: string;
  coordonnees: [number, number]; // [longitude, latitude]
  villeOuCommune?: string; // Optionnel, pour la popup
}

async function getVerreriesForMap(): Promise<VerrerieMapPoint[]> {
  try {
    // On veut les verreries qui ont des coordonnées.
    // depth=1 devrait suffire pour populer lieuPrincipal.coordonnees
    // Il faut peut-être ajuster le filtre si lieuPrincipal peut ne pas avoir de coordonnées.
    const apiUrl = `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/verreries?limit=300&depth=1&where[lieuPrincipal.coordonnees][exists]=true`;
    const response = await fetch(apiUrl, { cache: 'no-store' }); // Ou 'force-cache' ou options de revalidation
    if (!response.ok) {
      console.error(`[getVerreriesForMap] Erreur API (${response.status}): ${await response.text()}`);
      return [];
    }
    const data = await response.json();

    return data.docs
      .map((doc: any): VerrerieMapPoint | null => {
        // S'assurer que lieuPrincipal est un objet et a des coordonnées
        if (doc.lieuPrincipal && typeof doc.lieuPrincipal === 'object' && doc.lieuPrincipal.coordonnees) {
          return {
            id: doc.id,
            slug: doc.slug,
            nomPrincipal: doc.nomPrincipal,
            coordonnees: doc.lieuPrincipal.coordonnees,
            villeOuCommune: doc.lieuPrincipal.villeOuCommune,
          };
        }
        return null;
      })
      .filter((item: VerrerieMapPoint | null): item is VerrerieMapPoint => item !== null); // Filtrer les nulls
  } catch (error) {
    console.error('[getVerreriesForMap] Exception:', error);
    return [];
  }
}

const MapAndFiltersSection = async () => {
  const verreriesForMap = await getVerreriesForMap();

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 flex flex-col">
            <h3 className="text-2xl font-semibold text-blueGray-800 mb-4 font-serif">Carte des verreries</h3>
            <div className="bg-blueGray-100 rounded-lg shadow border border-blueGray-200 flex-grow min-h-[450px] md:min-h-[500px] lg:min-h-[600px] flex items-center justify-center text-blueGray-500 relative overflow-hidden">
              <div className="absolute inset-0">
                {/* MODIFIÉ : Appel à MapLoader avec les points */}
                {verreriesForMap.length > 0 ? (
                  <MapLoader points={verreriesForMap} />
                ) : (
                  <span className="italic p-4">Aucune donnée de carte à afficher.</span>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-semibold text-blueGray-800 mb-4 font-serif">Rechercher des verreries</h3>
            <div className="space-y-4 p-6 bg-blueGray-50 rounded-lg shadow">
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-blueGray-700 font-sans">Région</label>
                <select id="region" name="region" className="mt-1 block w-full p-2 border border-blueGray-300 rounded-md shadow-sm focus:ring-gold focus:border-gold font-sans">
                  <option>Sélectionner une région...</option>
                </select>
              </div>
              <div>
                <label htmlFor="ville" className="block text-sm font-medium text-blueGray-700 font-sans">Ville</label>
                <select id="ville" name="ville" className="mt-1 block w-full p-2 border border-blueGray-300 rounded-md shadow-sm focus:ring-gold focus:border-gold font-sans" disabled>
                  <option>Sélectionner une ville...</option>
                </select>
              </div>
              <div>
                <label htmlFor="verrerie-select" className="block text-sm font-medium text-blueGray-700 font-sans">Verrerie</label>
                <select id="verrerie-select" name="verrerie-select" className="mt-1 block w-full p-2 border border-blueGray-300 rounded-md shadow-sm focus:ring-gold focus:border-gold font-sans" disabled>
                  <option>Sélectionner une verrerie...</option>
                </select>
              </div>
              <button
                type="button"
                className="w-full bg-everglade hover:bg-everglade-clear text-white font-semibold py-2.5 px-6 rounded-lg shadow transition duration-300"
              >
                Voir la liste
              </button>
            </div>
            <h3 className="text-2xl font-semibold text-blueGray-800 mb-4 mt-8 font-serif">Rechercher un verrier</h3>
            <div className="space-y-4 p-6 bg-blueGray-50 rounded-lg shadow">
              <input type="text" placeholder="Nom du verrier" className="mt-1 block w-full p-2 border border-blueGray-300 rounded-md shadow-sm focus:ring-gold focus:border-gold font-sans" />
              <button type="button" className="w-full bg-everglade hover:bg-everglade-clear text-white font-semibold py-2.5 px-6 rounded-lg shadow transition duration-300">Rechercher</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- FeaturedVerreries ---
interface FeaturedVerrerieType {
  id: string;
  slug: string;
  nomPrincipal: string;
  resumeOuExtrait?: string; // MODIFIÉ : Sera une chaîne de texte simple
  imageEnAvant?: {
    url?: string;
    alt?: string;
  };
}

// Nouvelle fonction pour extraire du texte brut des nœuds Lexical
const extractPlainTextFromLexical = (lexicalContent: any, maxLength: number = 120): string => {
  if (!lexicalContent || !lexicalContent.root || !lexicalContent.root.children || lexicalContent.root.children.length === 0) {
    return 'Description à venir.';
  }
  let text = '';
  function recurseNodes(nodes: any[]) {
    for (const node of nodes) {
      if (node.type === 'text') {
        text += node.text;
      }
      if (node.children) {
        recurseNodes(node.children);
      }
      if (node.type === 'paragraph' || node.type === 'listitem' || node.type === 'linebreak') {
        if (text.length > 0 && !text.endsWith(' ')) {
          text += ' ';
        }
      }
    }
  }
  recurseNodes(lexicalContent.root.children);
  const cleanedText = text.replace(/\s\s+/g, ' ').trim();
  if (cleanedText.length > maxLength) {
    return cleanedText.substring(0, maxLength - 3) + '...';
  }
  return cleanedText || 'Description à venir.';
};

async function getFeaturedVerreries(): Promise<FeaturedVerrerieType[]> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/verreries?sort=-updatedAt&limit=3&depth=1`;
    const response = await fetch(apiUrl, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`[getFeaturedVerreries] Erreur API (${response.status}): ${await response.text()}`);
      return [];
    }
    const data = await response.json();

    return data.docs.map((doc: any): FeaturedVerrerieType => {
      let imageUrl, imageAlt;
      if (doc.imagesEtMedias && doc.imagesEtMedias.length > 0 && typeof doc.imagesEtMedias[0] === 'object' && doc.imagesEtMedias[0] !== null) {
        const mediaFile = doc.imagesEtMedias[0];
        if (mediaFile.url) {
            imageUrl = `${process.env.NEXT_PUBLIC_PAYLOAD_URL || ''}${mediaFile.url}`;
            imageAlt = mediaFile.alt || doc.nomPrincipal;
        }
      }
      return {
        id: doc.id,
        slug: doc.slug,
        nomPrincipal: doc.nomPrincipal,
        // MODIFIÉ ICI : Utilisation de la fonction pour extraire du texte brut
        resumeOuExtrait: extractPlainTextFromLexical(doc.histoire, 120),
        imageEnAvant: imageUrl ? { url: imageUrl, alt: imageAlt } : undefined,
      };
    });
  } catch (error) {
    console.error('[getFeaturedVerreries] Exception:', error);
    return [];
  }
}

const FeaturedVerreries = async () => {
  const verreries = await getFeaturedVerreries();

  if (!verreries || verreries.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-cream">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-blueGray-800 mb-10 font-serif">
            À découvrir
          </h2>
          <p className="text-blueGray-600 font-sans">Aucune verrerie à afficher pour le moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-cream">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-blueGray-800 mb-10 text-center font-serif">
          Quelques verreries à découvrir
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {verreries.map(v => (
            <Link
              href={`/verreries/${v.slug}`}
              key={v.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 group text-blueGray-600 no-underline hover:text-gold hover:underline hover:decoration-gold-dark"
            >
              {v.imageEnAvant ? (
                // Remplacé <img> par next/image
                <div className="relative w-full h-48"> {/* Conteneur pour Image avec fill */}
                  <img 
                    src={v.imageEnAvant.url} 
                    alt={v.imageEnAvant.alt || v.nomPrincipal} 
                    //width={600} // Fournir des dimensions si vous n'utilisez pas fill
                    //height={400}
                    //fill // Si fill, le parent doit être position:relative et avoir des dimensions
                    className="w-full h-full object-cover" // object-cover avec fill fonctionne bien
                    //sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-blueGray-100 flex items-center justify-center text-blueGray-400 font-sans">Image N/A</div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-blueGray-800 mb-2 font-serif">{v.nomPrincipal}</h3>
                {/* MODIFIÉ ICI : Affichage du résumé en texte brut, plus besoin de ArticleContentRenderer ni de prose ici */}
                <p className="text-blueGray-600 font-sans text-sm mb-4 flex-grow line-clamp-3 overflow-hidden">
                  {v.resumeOuExtrait}
                </p>
                <span className="inline-block mt-auto text-gold group-hover:text-gold-dark font-semibold font-sans self-start">
                  En savoir plus &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactFormSection = () => {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold text-blueGray-800 mb-8 text-center font-serif">
          Contribuez à la mémoire
        </h2>
        <form className="space-y-6 p-8 bg-blueGray-50 rounded-xl shadow-lg">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-blueGray-700 font-sans">Nom</label>
            <input type="text" name="name" id="name" className="mt-1 block w-full p-2.5 border border-blueGray-300 rounded-md shadow-sm focus:ring-gold focus:border-gold" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-blueGray-700 font-sans">E-mail</label>
            <input type="email" name="email" id="email" className="mt-1 block w-full p-2.5 border border-blueGray-300 rounded-md shadow-sm focus:ring-gold focus:border-gold" />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-blueGray-700 font-sans">Message</label>
            <textarea id="message" name="message" rows={4} className="mt-1 block w-full p-2.5 border border-blueGray-300 rounded-md shadow-sm focus:ring-gold focus:border-gold"></textarea>
          </div>
          <div>
            <button type="submit"
            className="w-full bg-everglade hover:bg-everglade-clear text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 text-lg">
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

// --- Composant Page Principal ---
export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream">
      <HeroSection />
      <CatalogueTeaser />
      <MapAndFiltersSection />
      <FeaturedVerreries />
      <ContactFormSection />
    </main>
  );
}