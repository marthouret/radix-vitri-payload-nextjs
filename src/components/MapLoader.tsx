// src/components/MapLoader.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

console.log('[MapLoader] Script MapLoader.tsx est en cours d\'exécution (niveau module)');

// Importez l'interface MapPoint si elle est définie dans VerrerieMap.tsx ou un fichier partagé
// Pour l'instant, je la redéfinis ici pour la clarté.
interface MapPoint {
  id: string;
  slug: string;
  nomPrincipal: string;
  coordonnees: [number, number];
  villeOuCommune?: string;
}

// Définir un composant nommé pour le cas d'erreur de l'import dynamique
const DynamicImportErrorFallback: React.FC = () => {
  return (
    <div className="p-4 text-red-500 bg-red-100 border border-red-500 rounded">
      Erreur critique: Impossible de charger le composant de la carte.
    </div>
  );
};
// Optionnel mais bonne pratique pour les outils de dev React:
DynamicImportErrorFallback.displayName = 'VerrerieMapImportErrorFallback';

// Importer dynamiquement VerrerieMap avec ssr: false
const VerrerieMap = dynamic(() => {
  console.log('[MapLoader] Tentative d\'import dynamique de VerrerieMap...');
  return import('@/components/VerrerieMap').then(mod => {
    console.log('[MapLoader] VerrerieMap importé avec succès.');
    return mod.default; // Assurez-vous que VerrerieMap est exporté par défaut
  }).catch(err => {
    console.error('[MapLoader] Erreur lors de l\'import dynamique de VerrerieMap:', err);
    // Retourner le composant nommé
    return DynamicImportErrorFallback; // <--- MODIFIÉ ICI
  });
}, {
  ssr: false,
  loading: () => (
    <div className="h-64 md:h-80 flex items-center justify-center border rounded bg-slate-200 text-slate-600">
      <p>Chargement de la carte...</p>
    </div>
  ),
});

interface MapLoaderProps {
  points: MapPoint[]; // MODIFIÉ : Tableau de points
}

const MapLoader: React.FC<MapLoaderProps> = ({ points }) => {
  console.log('[MapLoader Component] Rendu avec props:', { points });

  if (!points || points.length === 0) {
    return (
      <div className="p-4 text-orange-700 bg-orange-100 border border-orange-500 rounded">
        <p className="font-semibold">Informations de localisation :</p>
        <p className="italic">Aucune verrerie avec coordonnées à afficher sur la carte.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <VerrerieMap points={points} /> {/* MODIFIÉ : Passe le tableau de points */}
    </div>
  );
};

// Optionnel mais bonne pratique pour les outils de dev React:
MapLoader.displayName = 'MapLoader';

export default MapLoader;