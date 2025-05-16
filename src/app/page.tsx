// src/app/page.tsx
import Link from 'next/link';
import React from 'react';
import { JSX } from 'react/jsx-runtime'; // Import JSX si votre configuration le nécessite

// Import de composants.
import ArticleContentRenderer from '@/components/ArticleContentRenderer'; 

// --- Composants de Section (Placeholders pour l'instant) ---
// Nous allons créer ces composants dans des fichiers séparés par la suite
// ou les définir directement dans ce fichier s'ils sont très simples au début.

const HeroSection = () => {
  // Styles inspirés de votre maquette
  return (
    <section className="bg-blueGray-800 text-white py-16 md:py-24 text-center">
      <div className="container mx-auto px-4">
        {/* Emplacement pour un futur logo ici si besoin */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
          Radix Vitri
        </h1>
        <p className="text-lg md:text-xl text-blueGray-300 max-w-3xl mx-auto">
          Un catalogue des verreries, de leurs fondateurs et ouvriers, pour préserver la mémoire de cet artisanat et de mes ancêtres verriers.
          {/* Vous vouliez un texte plus étoffé ici, nous pourrons l'ajouter */}
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
          Explorez l'histoire des usines de la vallée du Gier, de Lyon et d'ailleurs, avec des détails sur leurs productions et acteurs.
        </p>
        <button
          type="button"
          className="bg-everglade hover:bg-everglade-clear text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale- text-lg"
        >
          Explorer le catalogue
        </button>
      </div>
    </section>
  );
};

const MapAndFiltersSection = () => {
  // Ici, nous intégrerons la carte et les placeholders pour les filtres
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 flex flex-col">
            <h3 className="text-2xl font-semibold text-blueGray-800 mb-4 font-serif">Carte des verreries</h3>
            {/* MODIFICATION ICI : Retrait de h-96, ajout de flex-grow et min-h-[X] pour une hauteur minimale */}
            {/* min-h-[400px] ou une autre valeur (ex: md:min-h-[500px]) comme hauteur de base / minimale */}
            <div className="bg-blueGray-100 rounded-lg shadow border border-blueGray-200 flex-grow min-h-[450px] md:min-h-[500px] lg:min-h-[600px] flex items-center justify-center text-blueGray-500 relative overflow-hidden">
              {/* Le MapLoader viendra ici. Pour l'instant, un placeholder. */}
              {/* Quand vous intégrerez MapLoader, assurez-vous que son conteneur interne prend aussi 100% de hauteur/largeur */}
              <div className="absolute inset-0">
                {/* <MapLoader coordinates={...} nom={...} />  Nous ajouterons les props plus tard */}
                <span className="italic">Carte Interactive (Conteneur Prêt)</span>
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
                  {/* Les options seront chargées dynamiquement */}
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
             {/* Placeholder pour la recherche de verrier */}
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
  resumeOuExtrait?: any; // Pour stocker l'objet RichText (Lexical JSON) de 'histoire'
  imageEnAvant?: {
    url?: string;
    alt?: string;
  };
}

async function getFeaturedVerreries(): Promise<FeaturedVerrerieType[]> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/verreries?sort=-updatedAt&limit=3&depth=1`; // depth=1 est souvent suffisant ici
    const response = await fetch(apiUrl, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`[getFeaturedVerreries] Erreur API (${response.status}): ${await response.text()}`);
      return [];
    }
    const data = await response.json();

    return data.docs.map((doc: any): FeaturedVerrerieType => {
      let imageUrl, imageAlt;
      if (doc.imagesEtMedias && doc.imagesEtMedias.length > 0 && typeof doc.imagesEtMedias[0] === 'object' && doc.imagesEtMedias[0] !== null && doc.imagesEtMedias[0].url) {
        // Supposant que imagesEtMedias[0] est l'ID de l'upload, et que depth=1 a populé l'objet media
        const mediaFile = doc.imagesEtMedias[0]; // Si c'est un objet Media populé
        if (mediaFile.url) { // Vérifie si l'objet media populé a une URL
            imageUrl = `${process.env.NEXT_PUBLIC_PAYLOAD_URL || ''}${mediaFile.url}`;
            imageAlt = mediaFile.alt || doc.nomPrincipal;
        }
      }
      // Si vous avez un champ 'imagePrincipale' qui est une relation vers 'media'
      // else if (doc.imagePrincipale && typeof doc.imagePrincipale === 'object' && doc.imagePrincipale.url) {
      //   imageUrl = `${process.env.NEXT_PUBLIC_PAYLOAD_URL || ''}${doc.imagePrincipale.url}`;
      //   imageAlt = doc.imagePrincipale.alt || doc.nomPrincipal;
      // }

      return {
        id: doc.id,
        slug: doc.slug,
        nomPrincipal: doc.nomPrincipal,
        resumeOuExtrait: doc.histoire, // Passer l'objet RichText 'histoire'
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
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 group"
            >
              {v.imageEnAvant ? (
                <img src={v.imageEnAvant.url} alt={v.imageEnAvant.alt || v.nomPrincipal} className="w-full h-48 object-cover"/>
              ) : (
                <div className="w-full h-48 bg-blueGray-100 flex items-center justify-center text-blueGray-400 font-sans">Image N/A</div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-blueGray-800 mb-2 font-serif">{v.nomPrincipal}</h3>
                {/* Utilisation de ArticleContentRenderer importé */}
                <div className="text-blueGray-600 font-sans text-sm mb-4 flex-grow line-clamp-3 overflow-hidden">
                  <ArticleContentRenderer content={v.resumeOuExtrait} />
                </div>
                  <span className="inline-block mt-auto font-semibold font-sans self-start">
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

// ... ContactFormSection et HomePage ...

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
    <main className="min-h-screen bg-cream"> {/* Couleur de fond générale si besoin */}
      <HeroSection />
      <CatalogueTeaser />
      <MapAndFiltersSection />
      <FeaturedVerreries />
      <ContactFormSection />
      {/* Nous ajouterons un Footer plus tard */}
    </main>
  );
}
