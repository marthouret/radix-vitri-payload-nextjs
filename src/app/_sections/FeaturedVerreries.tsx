import Image from 'next/image';
import Link from 'next/link';
import { getFeaturedVerreries } from '@/lib/getFeaturedVerreries';

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
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 group text-blueGray-600 no-underline"
            >
              {v.imageEnAvant && v.imageEnAvant.url ? (
                <div className="relative w-full h-48">
                  <Image
                    src={v.imageEnAvant.url}
                    alt={v.imageEnAvant.alt || v.nomPrincipal}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    // unoptimized // à activer si images externes non autorisées dans next.config.js
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-blueGray-100 flex items-center justify-center text-blueGray-400 font-sans">Image N/A</div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-blueGray-800 mb-2 font-serif group-hover:text-gold transition-colors">{v.nomPrincipal}</h3>
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

export default FeaturedVerreries;