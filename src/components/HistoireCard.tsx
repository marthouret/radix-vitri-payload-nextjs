// src/components/HistoireCard.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// On utilise le même type simplifié que dans la page d'accueil
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

const HistoireCard = ({ histoire }: { histoire: HistoirePourCarte }) => {
  const link = `/histoires/${histoire.slug}`;
  const imageUrl = (histoire.imageMiseEnAvant?.url)
    ? `${process.env.NEXT_PUBLIC_PAYLOAD_URL || ''}${histoire.imageMiseEnAvant.url}`
    : 'https://placehold.co/600x400.png?text=Radix+Vitri';

  return (
    <Link
      href={link}
      className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 group text-blueGray-600 no-underline"
    >
      <div className="relative w-full h-48">
        <Image
          src={imageUrl}
          alt={histoire.title}
          fill
          className="object-cover"
          unoptimized={imageUrl.startsWith('https://placehold.co')}
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-blueGray-800 mb-2 font-serif group-hover:text-gold transition-colors">{histoire.title}</h3>
        {histoire.resume && (
          <p className="text-blueGray-600 font-sans text-sm mb-4 flex-grow line-clamp-3 overflow-hidden">
            {histoire.resume}
          </p>
        )}
        <span className="inline-block mt-auto text-gold group-hover:text-gold-dark font-semibold font-sans self-start">
          Lire l&apos;histoire &rarr;
        </span>
      </div>
    </Link>
  );
};

export default HistoireCard;