// src/utils/formatters.ts

// On définit les "formes" de nos objets de date pour que TypeScript nous aide
export interface DateDebut {
  anneeDebutSort?: number | null;
  typePrecisionDateDebut?: 'AnneeSeuleExacte' | 'CircaAnnee' | 'ApresAnnee' | 'AvantAnnee' | 'MoisAnneeExacts' | null;
}

export interface DateFin {
  anneeFinSort?: number | null;
  typePrecisionDateFin?: 'AnneeSeuleExacte' | 'CircaAnnee' | 'ApresAnnee' | 'AvantAnnee' | 'MoisAnneeExacts' | null;
}

/**
 * Formate une période textuelle à partir des objets de date structurée d'un engagement.
 * @param debut L'objet dateDebutStructurée
 * @param fin L'objet dateFinStructurée
 * @returns Une chaîne de caractères formatée (ex: "env. 1875 - après 1880") ou une chaîne vide.
 */
export function formatPeriode(
    debut?: DateDebut,
    fin?: DateFin
  ): string {

  // La logique interne de la fonction gère déjà correctement le cas 'null'
  // car !null est 'true', donc pas de changement nécessaire ici.
  const formatAnnee = (annee?: number | null, typePrecision?: string | null): string => {
    if (!annee) return '';
    switch (typePrecision) {
      case 'CircaAnnee': return `env. ${annee}`;
      case 'ApresAnnee': return `après ${annee}`;
      case 'AvantAnnee': return `avant ${annee}`;
      case 'AnneeSeuleExacte':
      case 'MoisAnneeExacts':
      default:
        return annee.toString();
    }
  };

  const debutStr = formatAnnee(debut?.anneeDebutSort, debut?.typePrecisionDateDebut);
  const finStr = formatAnnee(fin?.anneeFinSort, fin?.typePrecisionDateFin);

  if (debutStr && finStr && debutStr !== finStr) {
    return `${debutStr} - ${finStr}`;
  } else if (debutStr) {
    return debutStr;
  } else if (finStr) {
    return finStr;
  } else {
    return '';
  }
}