import { getHistoiresRecentes } from '@/lib/getHistoiresRecentes';
import HistoireCard from '@/components/HistoireCard';

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

export default HistoiresSection;