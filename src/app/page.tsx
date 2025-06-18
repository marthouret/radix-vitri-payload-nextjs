// src/app/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import HistoireCard from '@/components/HistoireCard';
import { getVerreriesForMap } from '@/lib/getVerreriesForMap';
import SearchVerriers from '@/components/SearchVerriers';
import MapAndFiltersClientWrapper from '@/components/MapAndFiltersClientWrapper';
import { getFeaturedVerreries } from '@/lib/getFeaturedVerreries';
import { getHistoiresRecentes } from '@/lib/getHistoiresRecentes';

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

const MapAndFiltersSection = async () => {
  const verreriesForMap = await getVerreriesForMap();
  return (
    <section id="carte-interactive" className="scroll-mt-28 py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
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
              {v.imageEnAvant && v.imageEnAvant.url ? (
                // Remplacé <img> par next/image
                <div className="relative w-full h-48"> 
                  <img 
                    src={v.imageEnAvant.url || undefined} 
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
      {/* Vous pouvez ajouter d'autres sections ici si nécessaire */}
    </main>
  );
}