// src/app/verreries/layout.tsx
import React from 'react';

// Ce fichier définit le layout spécifique pour toutes les pages
// qui se trouvent dans le dossier /app/verreries/*
// Il est imbriqué à l'intérieur du layout racine (src/app/layout.tsx).

// Vous pouvez ajouter des métadonnées spécifiques à ce segment si nécessaire.
// Ces métadonnées peuvent surcharger ou compléter celles du layout racine.
export const metadata = {
  title: 'Les Verreries - Radix Vitri', // Exemple de titre spécifique pour cette section
};

export default function VerreriesSegmentLayout({ // Renommé pour plus de clarté
  children,
}: {
  children: React.ReactNode;
}) {
  // Pour un layout de segment, on retourne généralement les enfants.
  // On peut les envelopper dans des éléments de structure spécifiques à cette section
  // si nécessaire (par exemple, une barre latérale de navigation pour les verreries, un conteneur spécifique).
  // Pour l'instant, nous retournons simplement les enfants pour minimiser les interférences
  // et aider à diagnostiquer les problèmes d'hydratation.
  return (
    <>
      {/* Si vous avez besoin d'un conteneur ou d'éléments spécifiques 
        UNIQUEMENT pour les pages de la section "verreries", 
        vous pouvez les ajouter ici. Par exemple:
        <div className="verreries-section-wrapper">
          {children}
        </div>
        Sinon, retourner <>{children}</> est le plus simple.
      */}
      {children}
    </>
  );
}

