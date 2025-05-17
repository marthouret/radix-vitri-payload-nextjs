// src/components/MapLoader.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Importer le CSS de Leaflet ici aussi, pour s'assurer qu'il est chargé
// avant que VerrerieMap (chargé dynamiquement) ne tente de l'utiliser.
import 'leaflet/dist/leaflet.css';

console.log('[MapLoader] Script MapLoader.tsx est en cours d\'exécution (niveau module)');

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
  coordinates?: [number, number]; // [longitude, latitude]
  nom: string;
}

const MapLoader: React.FC<MapLoaderProps> = ({ coordinates, nom }) => {
  console.log('[MapLoader Component] Rendu avec props:', { coordinates, nom });

  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    console.log('[MapLoader Component] Coordonnées invalides ou manquantes. Affichage du message d\'erreur.');
    return (
      <div className="p-4 text-orange-700 bg-orange-100 border border-orange-500 rounded">
        <p className="font-semibold">Informations de localisation :</p>
        <p className="italic">
          {coordinates ? `Format des coordonnées incorrect. Reçu : ${JSON.stringify(coordinates)}` : 'Coordonnées non disponibles pour afficher la carte.'}
        </p>
      </div>
    );
  }

  console.log('[MapLoader Component] Coordonnées valides. Tentative de rendu de VerrerieMap.');
  return (
    // J'ai retiré les bordures de débogage violettes, remettez-les si besoin pour le layout.
    <div className="w-full h-full relative">
      <VerrerieMap coordinates={coordinates} nom={nom} />
    </div>
  );
};
// Optionnel mais bonne pratique pour les outils de dev React:
MapLoader.displayName = 'MapLoader';

export default MapLoader;