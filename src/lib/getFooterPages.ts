import { getPayload } from 'payload';
import configPromise from '@payload-config';
import type { Page } from '@/payload-types';

export async function getFooterPages(): Promise<Page[]> {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs: pages } = await payload.find({
      collection: 'pages',
      limit: 10,
    });
    return pages || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des pages pour le footer:", error);
    return [];
  }
}