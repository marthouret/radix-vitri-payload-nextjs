import { getPayload } from 'payload';
import configPromise from '@payload-config';
import type { FeaturedVerrerieType } from '@/types/verrerie';
import { extractPlainTextFromLexical } from '@/utils/extractText';

export async function getFeaturedVerreries(limit = 6): Promise<FeaturedVerrerieType[]> {
  try {
    const payload = await getPayload({ config: configPromise });
    const { docs } = await payload.find({
      collection: 'verreries',
      sort: '-updatedAt',
      limit,
      depth: 1,
    });

    return docs.map((doc: any): FeaturedVerrerieType => {
      let imageUrl, imageAlt;
      if (
        doc.imagesEtMedias &&
        doc.imagesEtMedias.length > 0 &&
        typeof doc.imagesEtMedias[0] === 'object' &&
        doc.imagesEtMedias[0] !== null
      ) {
        const mediaFile = doc.imagesEtMedias[0];
        if (mediaFile.url) {
          imageUrl = `${process.env.NEXT_PUBLIC_PAYLOAD_URL || ''}${mediaFile.url}`;
          imageAlt = mediaFile.alt || doc.nomPrincipal;
        }
      }
      return {
        id: String(doc.id),
        slug: doc.slug,
        nomPrincipal: doc.nomPrincipal,
        resumeOuExtrait: extractPlainTextFromLexical(doc.histoire, 120),
        imageEnAvant: imageUrl ? { url: imageUrl, alt: imageAlt } : undefined,
      };
    });
  } catch (error) {
    console.error('[getFeaturedVerreries] Exception:', error);
    return [];
  }
}