import { getPayload } from 'payload';
import configPromise from '@payload-config';
import type { HistoirePourCarte } from '@/types/HistoirePourCarte';
import type { Histoire } from '@/payload-types';

export async function getHistoiresRecentes(limit = 3): Promise<HistoirePourCarte[]> {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs: histoires } = await payload.find({
      collection: 'histoires',
      sort: '-updatedAt',
      limit,
      depth: 1,
    });

    // Mappe chaque Histoire en HistoirePourCarte
    return (histoires || []).map((histoire: Histoire) => {
    let imageMiseEnAvant = null;
    const img = histoire.imageMiseEnAvant;
    if (img && typeof img === 'object' && 'url' in img) {
        imageMiseEnAvant = {
        url: img.url ?? null,
        alt: img.alt ?? null,
        };
    }
    return {
        id: String(histoire.id),
        slug: histoire.slug ?? null,
        title: histoire.title,
        resume: histoire.resume ?? null,
        imageMiseEnAvant,
    };
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des histoires récentes:", error);
    return [];
  }
}