import { getVerreriesForMap } from '@/lib/getVerreriesForMap';
import MapAndFiltersClientWrapper from '@/components/MapAndFiltersClientWrapper';

const MapAndFiltersSection = async () => {
  const verreriesForMap = await getVerreriesForMap();
  return (
    <section
      id="carte-interactive"
      className="scroll-mt-8 py-6 md:py-16 bg-white"
    >
      <div className="container mx-auto px-4">
        <MapAndFiltersClientWrapper initialVerreries={verreriesForMap} />
      </div>
    </section>
  );
};

export default MapAndFiltersSection;