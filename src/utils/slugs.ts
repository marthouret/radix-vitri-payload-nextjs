// src/utils/slugs.ts
import slugifyExternal from 'slugify'; // Importer la librairie

export const generateBaseSlug = (text: string): string => {
  if (!text) return '';
  return slugifyExternal(text, {
    replacement: '-',
    remove: /[!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~]/g,
    lower: true,
    strict: true,
    locale: 'fr',
    trim: true
  });
};