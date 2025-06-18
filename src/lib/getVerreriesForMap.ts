import { getPayload } from 'payload';
import configPromise from '@payload-config';
import type { VerrerieMapPoint } from '@/types/verrerie';
import type { Verrery as VerrerieType } from '@/payload-types'; // On utilise le type corrigé

export async function getVerreriesForMap(): Promise<VerrerieMapPoint[]> {
  try {
    // On utilise l'API Locale
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'verreries',
      limit: 300,
      depth: 1,
      where: {
        'lieuPrincipal.coordonnees': { exists: true }
      }
    });

    // La logique de transformation des données reste la même
    return docs
      .map((doc: VerrerieType): VerrerieMapPoint | null => {
        if (doc.lieuPrincipal && typeof doc.lieuPrincipal === 'object' && doc.lieuPrincipal.coordonnees) {
          return {
            id: doc.id.toString(),
            slug: doc.slug,
            nomPrincipal: doc.nomPrincipal,
            coordonnees: doc.lieuPrincipal.coordonnees as [number, number],
            villeOuCommune: doc.lieuPrincipal.villeOuCommune,
            region: doc.lieuPrincipal.region ?? undefined,
            pays: doc.lieuPrincipal.pays,
            nomsHistoriquesEtRaisonsSociales: (doc.nomsHistoriquesEtRaisonsSociales || []).map((nh: any) => ({ nom: nh.nom })),
          };
        }
        return null;
      })
      .filter((item): item is VerrerieMapPoint => item !== null);

  } catch (error) {
    console.error('[getVerreriesForMap] Exception:', error);
    return [];
  }
}