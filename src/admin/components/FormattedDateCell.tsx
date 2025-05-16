// src/admin/components/FormattedDateCell.tsx
import React from 'react';
import { JSX } from 'react/jsx-runtime'; // Nécessaire pour les types JSX

// --- Fonction utilitaire de formatage de date ---
const formatDateForAdminDisplay = (dateString?: string | null): string | null => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) { 
      const yearMatch = dateString.match(/\d{4}/);
      if (yearMatch) return yearMatch[0];
      return null; 
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) {
    console.error("Erreur de formatage de date pour l'admin:", e);
    return null; 
  }
};

// --- Interface pour les props du composant de cellule interne ---
interface FormattedDateCellInternalProps {
  cellData?: { [key: string]: string | null | undefined };
  preciseFieldKey: string;
  descriptionFieldKey: string;
}

const FormattedDateCellInternal: React.FC<FormattedDateCellInternalProps> = ({ cellData, preciseFieldKey, descriptionFieldKey }) => {
  if (!cellData) {
    return <span>N/A</span>;
  }

  const preciseDateValue = cellData[preciseFieldKey];
  const descriptionValue = cellData[descriptionFieldKey];
  const formattedPrecise = formatDateForAdminDisplay(preciseDateValue);

  if (formattedPrecise) {
    return <span>{formattedPrecise}</span>; 
  }
  if (descriptionValue) {
    return <span style={{ fontStyle: 'italic' }}>{descriptionValue}</span>;
  }
  return <span>N/A</span>; 
};

// --- Interface pour les props que Payload passe à un composant Cell ---
export interface PayloadCellProps {
  cellData?: any;
  rowData?: any;
  // field?: any; // Non utilisé pour l'instant mais fourni par Payload
  // colIndex?: number; // Non utilisé pour l'instant mais fourni par Payload
}

// --- Composant Wrapper pour la Date de Création ---
export const DateDeCreationCell: React.FC<PayloadCellProps> = ({ cellData }) => {
  return (
    <FormattedDateCellInternal 
      cellData={cellData} 
      preciseFieldKey="datePreciseCreation" 
      descriptionFieldKey="descriptionDateCreation" 
    />
  );
};

// --- Composant Wrapper pour la Date de Fermeture ---
export const DateDeFermetureCell: React.FC<PayloadCellProps> = ({ cellData }) => {
  return (
    <FormattedDateCellInternal 
      cellData={cellData} 
      preciseFieldKey="datePreciseFermeture" 
      descriptionFieldKey="descriptionDateFermeture" 
    />
  );
};

// Exporter FormattedDateCellInternal si vous voulez l'utiliser ailleurs,
// mais pour la collection, nous utilisons les wrappers.
// export default FormattedDateCellInternal; // Ou ne pas l'exporter par défaut
