// src/utils/payloadHooks.ts
import { FieldHook } from 'payload';
import { generateBaseSlug } from './slugs'; // Assurez-vous que ce chemin et cette fonction sont corrects

export const createSimplifiedSlugHook = (): FieldHook => {
  const simplifiedSlugHook: FieldHook = ({ value, data, originalDoc, operation }) => {
    let sourceForSlug: string | undefined;

    // 1. Si l'utilisateur a modifié ou fourni une valeur pour le slug, on l'utilise.
    if (typeof value === 'string' && value.length > 0) {
      // Si c'est une mise à jour et que le slug n'a pas changé par rapport à l'original,
      // on pourrait être tenté de retourner 'value' directement, mais il vaut mieux
      // le re-slugifier pour assurer la propreté au cas où il contiendrait des caractères non voulus.
      // Cependant, si le slug original était déjà parfait, on veut peut-être le garder.
      // Pour la simplicité et la robustesse du format, on re-slugifie ce que l'utilisateur a mis.
      sourceForSlug = value;
    } else {
      // 2. Sinon, on essaie de construire à partir de nomComplet, ou prenom/nom
      const nomCompletSource = data?.nomComplet ?? originalDoc?.nomComplet;
      const prenomSource = data?.prenom ?? originalDoc?.prenom;
      const nomSource = data?.nom ?? originalDoc?.nom;

      if (nomCompletSource) {
        sourceForSlug = nomCompletSource;
      } else if (prenomSource || nomSource) {
        sourceForSlug = `${prenomSource || ''} ${nomSource || ''}`.trim();
      }
    }
    
    // 3. Si toujours aucune source, et qu'un slug original existe (en cas d'update où les champs de nom seraient vides),
    // on garde l'ancien slug.
    if (!sourceForSlug && operation === 'update' && originalDoc?.slug) {
        return originalDoc.slug;
    }

    // 4. Si on a une source, on la slugifie. Sinon, on retourne undefined (Payload gérera la validation si requis).
    if (sourceForSlug) {
      return generateBaseSlug(sourceForSlug);
    }

    // console.warn(`[simplifiedSlugHook] Aucune source trouvée pour générer le slug.`);
    return undefined; 
  };
  return simplifiedSlugHook;
};