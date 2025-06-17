// src/app/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import MapAndFiltersClientWrapper from '@/components/MapAndFiltersClientWrapper';
import SearchVerriers from '@/components/SearchVerriers';
// Import des types nécessaires
import HistoireCard from '@/components/HistoireCard';
import { VerrerieMapPoint } from '@/types/verrerie';

export const dynamic = 'force-dynamic';

// --- Composants de Section ---
const HeroSection = () => {
  return (
    <section className="py-16 md:py-20 lg:py-6 bg-cream text-blueGray-800"> {/* Ajustement du padding vertical */}
      <div className="container mx-auto px-4 text-center"> {/* Contenu centré */}
        
        {/* Logo SVG Principal (agissant comme titre H1 visuel) */}
        <div className="mb-6 max-w-2xl lg:max-w-3xl mx-auto"> {/* Contrôle de la largeur max du logo */}
          <Image
            src="/images/radixvitri-main-transparent.svg" // Chemin vers votre SVG
            alt="Radix Vitri" // Texte alternatif essentiel pour l'accessibilité et SEO
            width={800}  // Largeur de base (intrinsèque ou souhaitée) de votre SVG
            height={150} // Hauteur correspondante pour maintenir le ratio (adaptez ces valeurs !)
            className="inline-block w-full" // Prend la largeur de son conteneur, hauteur auto
            priority 
          />
          {/* Pour la sémantique H1, si le SVG ne contient pas de texte accessible : */}
          {/* <h1 className="sr-only">Radix Vitri</h1> */}
        </div>

        {/* Accroche */}
        <p className="text-xl lg:text-2xl text-gold mb-8 font-sans max-w-3xl mx-auto">
          Un hommage à nos ancêtres verriers et à leur histoire.
        </p>

        {/* Introduction */}
        <div className="prose prose-bluegray lg:prose-lg max-w-2xl mx-auto text-blueGray-700 font-sans mb-10 text-center sm:text-left md:pl-4 lg:pl-12">
          {/* J'ai remis text-center sur mobile et text-left à partir de sm pour les paragraphes */}
          <p>
            Radix Vitri est un hommage à mes ancêtres verriers. Ce catalogue interactif vous invite à découvrir les nombreux établissements où, du XVIIe siècle à l&apos;aube de la Première Guerre Mondiale, ces artisans du verre – qu&apos;ils soient souffleurs, composeurs, tamiseurs, graveurs ou peintres sur verre – exercèrent leurs précieux talents.
          </p>
          <p>
            Explorez avec nous l&apos;évolution de ces lieux oubliés de savoir-faire : des verreries forestières éphémères, dévoreuses de bois, aux premières grandes manufactures prestigieuses, jusqu&apos;à l&apos;essor de l&apos;industrie verrière transformée par le charbon puis la mécanisation.
          </p>
        </div>
        
        {/* Bouton CTA */}
        <Link href="/verreries">
          <button
            type="button"
            className="bg-everglade hover:bg-everglade-clear text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 text-lg"
          >
            Explorer le Catalogue
          </button>
        </Link>
      </div>
    </section>
  );
};

async function getVerreriesForMap(): Promise<VerrerieMapPoint[]> { // VerrerieMapPoint est l'interface attendue par votre ClientWrapper
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/verreries?limit=300&depth=1&where[lieuPrincipal.coordonnees][exists]=true`;
    const response = await fetch(apiUrl, { next: { revalidate: 3600 } });
    if (!response.ok) {
      console.error(`[getVerreriesForMap] Erreur API (${response.status}): ${await response.text()}`);
      return [];
    }
    const data = await response.json();

    return data.docs
      .map((doc: any): VerrerieMapPoint | null => { // 'doc' est un document Verrerie brut de Payload
        if (doc.lieuPrincipal && typeof doc.lieuPrincipal === 'object' && doc.lieuPrincipal.coordonnees) {
          
          // Récupérer directement nomsHistoriquesEtRaisonsSociales
          // C'est un champ de premier niveau de la collection "Verreries", donc depth=0 (ou 1) suffit.
          // Il est déjà un tableau d'objets, chaque objet ayant une propriété 'nom'.
          const nomsHistoriques = doc.nomsHistoriquesEtRaisonsSociales || []; // Assurer que c'est un tableau, même vide

          return {
            id: doc.id,
            slug: doc.slug,
            nomPrincipal: doc.nomPrincipal,
            coordonnees: doc.lieuPrincipal.coordonnees,
            villeOuCommune: doc.lieuPrincipal.villeOuCommune, // Vérifiez si ce champ existe sur lieuPrincipal
            region: doc.lieuPrincipal.region,               // Vérifiez si ce champ existe sur lieuPrincipal
            pays: doc.lieuPrincipal.pays,
            
            // Transmettre le champ correctement
            nomsHistoriquesEtRaisonsSociales: nomsHistoriques.map((nh: any) => ({ nom: nh.nom })), 
            // On s'assure ici de ne passer que la structure minimale { nom: string }
            // si VerrerieMapPoint.nomsHistoriquesEtRaisonsSociales attend cela.
            // Si VerrerieMapPoint.nomsHistoriquesEtRaisonsSociales peut prendre l'objet complet de l'array (avec typeDeNom, periodeValidite etc.),
            // alors vous pouvez juste faire : nomsHistoriquesEtRaisonsSociales: nomsHistoriques,

            // L'ancien champ 'nomsAlternatifs' (string[]) n'est plus nécessaire ici
            // si VerrerieMapPoint ne l'attend plus et utilise nomsHistoriquesEtRaisonsSociales
          };
        }
        return null;
      })
      .filter((item : VerrerieMapPoint | null): item is VerrerieMapPoint => item !== null);
  } catch (error) {
    console.error('[getVerreriesForMap] Exception:', error);
    return [];
  }
}

const MapAndFiltersSection = async () => {
  const verreriesForMap = await getVerreriesForMap();
  console.log('Verreries récupérées pour la carte (serveur):', JSON.stringify(verreriesForMap.slice(0, 5), null, 2)); // Affiche les 5 premiers pour la lisibilité

  return (
    <section id="carte-interactive" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/*
          ICI : Nous appelons MapAndFiltersClientWrapper.
          Ce composant client va maintenant gérer :
          - L'affichage de la grille à deux colonnes.
          - La colonne de gauche avec la carte (qui deviendra dynamique).
          - La colonne de droite avec les filtres (qui deviendront interactifs).
          Tout le JSX de la grille que vous aviez ici est maintenant DANS MapAndFiltersClientWrapper.
        */}
        <MapAndFiltersClientWrapper initialVerreries={verreriesForMap} />
      </div>
    </section>
  );
};

const SearchVerriersSection = () => {
  return (
    <section className="py-12 md:py-16 bg-cream"> {/* ou une autre couleur de fond pour la distinguer */}
      <div className="container mx-auto px-4">
        <SearchVerriers />
      </div>
  </section>
  );
}

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
      <section className="py-12 md:py-16 bg-white">
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
    <section className="py-12 md:py-16 bg-white">
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

async function getHistoiresRecentes(): Promise<HistoirePourCarte[]> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/histoires?sort=-updatedAt&limit=3&depth=1`;
    const response = await fetch(apiUrl, { cache: 'no-store' });

    if (!response.ok) {
      console.error(`[getHistoiresRecentes] Erreur API (${response.status}): ${await response.text()}`);
      return [];
    }
    const data = await response.json();
    
    // On s'assure que les données retournées correspondent à notre type simplifié
    return data.docs as HistoirePourCarte[];

  } catch (error) {
    console.error('[getHistoiresRecentes] Exception:', error);
    return [];
  }
}

const HistoiresSection = async () => {
  const histoires = await getHistoiresRecentes();
  if (histoires.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-cream">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-blueGray-800 mb-10 text-center font-serif">
          Dernières Histoires
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {histoires.map(histoire => (
            <HistoireCard key={histoire.id} histoire={histoire} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Composant Page Principal ---
export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream">
      <HeroSection />
      <MapAndFiltersSection />
      <SearchVerriersSection />
      <FeaturedVerreries />
      <HistoiresSection />
    </main>
  );
}