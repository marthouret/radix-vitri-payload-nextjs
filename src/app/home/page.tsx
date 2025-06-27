// src/app/home/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import SearchVerriers from '@/components/SearchVerriers'
import MapAndFiltersSection from 'src/app/_sections/MapAndFiltersSection'
import FeaturedVerreries from 'src/app/_sections/FeaturedVerreries'
import HistoiresSection from 'src/app/_sections/HistoiresSection'

export const dynamic = 'force-dynamic'
// export const revalidate = 300; // Revalidation la plus courte possible pour cette page, 5 minutes

// --- Composants de Section ---
const HeroSection = () => {
  return (
    <section className="py-16 md:py-20 lg:py-6 bg-cream text-blueGray-800">
      {' '}
      {/* Ajustement du padding vertical */}
      <div className="max-w-screen-xl mx-auto px-4 text-center">
        {' '}
        {/* Contenu centré */}
        {/* Logo SVG Principal (agissant comme titre H1 visuel) */}
        <div className="mb-6 max-w-2xl lg:max-w-3xl mx-auto">
          {' '}
          {/* Contrôle de la largeur max du logo */}
          <Image
            src="/images/radixvitri-main-transparent.svg" // Chemin vers votre SVG
            alt="Radix Vitri" // Texte alternatif essentiel pour l'accessibilité et SEO
            width={800} // Largeur de base (intrinsèque ou souhaitée) de votre SVG
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
        <div className="prose prose-bluegray lg:prose-lg max-w-3xl mx-auto text-blueGray-700 font-sans mb-10 text-center sm:text-left md:pl-4 lg:pl-12">
          {/* J'ai remis text-center sur mobile et text-left à partir de sm pour les paragraphes */}
          <p>
            Radix Vitri est un hommage à mes ancêtres verriers. Ce catalogue interactif vous invite
            à découvrir les nombreux établissements où, du XVIIe siècle à l&apos;aube de la Première
            Guerre Mondiale, ces artisans du verre – qu&apos;ils soient souffleurs, composeurs,
            tamiseurs, graveurs ou peintres sur verre – exercèrent leurs précieux talents.
          </p>
          <p>
            Explorez avec nous l&apos;évolution de ces lieux oubliés de savoir-faire : des verreries
            forestières éphémères, dévoreuses de bois, aux premières grandes manufactures
            prestigieuses, jusqu&apos;à l&apos;essor de l&apos;industrie verrière transformée par le
            charbon puis la mécanisation.
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
  )
}

const SearchVerriersSection = () => {
  return (
    <section className="py-12 md:py-16 bg-cream">
      {' '}
      {/* ou une autre couleur de fond pour la distinguer */}
      <div className="max-w-screen-lg mx-auto px-4">
        <SearchVerriers />
      </div>
    </section>
  )
}

// --- Composant Page Principal ---
export default async function HomePage() {
  return (
    <main className="min-h-screen bg-cream">
      <HeroSection />
      {await MapAndFiltersSection()}
      <SearchVerriersSection />
      {await FeaturedVerreries()}
      {await HistoiresSection()}
      {/* Vous pouvez ajouter d'autres sections ici si nécessaire */}
      {/* Note : Si vous avez besoin de revalidation, utilisez l'API de revalidation de Next.js */}
    </main>
  )
}
