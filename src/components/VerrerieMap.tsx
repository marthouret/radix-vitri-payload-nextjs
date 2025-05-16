// src/components/VerrerieMap.tsx
'use client'; 

import React, { useRef } from 'react'; // Retiré useEffect, useState pour simplification
import { JSX } from 'react/jsx-runtime'; 
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression, Map as LeafletMap } from 'leaflet'; 
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

console.log('[VerrerieMap] Script VerrerieMap.tsx est en cours d\'exécution (niveau module)');

// Correction pour les icônes de marqueur par défaut
if (typeof window !== 'undefined') {
  if (L.Icon.Default && L.Icon.Default.prototype) {
    // delete (L.Icon.Default.prototype as any)._getIconUrl; // Gardons commenté
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }
}

interface VerrerieMapProps {
  coordinates: [number, number]; 
  nom: string;
  zoomLevel?: number;
}

const VerrerieMap: React.FC<VerrerieMapProps> = ({ coordinates, nom, zoomLevel = 14 }) => {
  const mapRef = useRef<LeafletMap | null>(null); 
  const position: LatLngExpression = [coordinates[1], coordinates[0]]; 
  
  console.log('[VerrerieMap Component] Rendu. Position pour Leaflet (lat, lon):', position);

  const handleMapReady = () => {
    console.log('[VerrerieMap] Map prête (whenReady).');
    const map = mapRef.current;
    if (map) {
      console.log('[VerrerieMap] Instance de la carte disponible via ref:', map);
      // On peut appeler invalidateSize ici si on constate toujours des problèmes après le premier rendu
      // avec une hauteur de 100%, mais avec une hauteur fixe, ce n'est souvent pas nécessaire pour le rendu initial.
      setTimeout(() => {
        if (map.getContainer()){ // Vérifier si la carte est toujours montée
            map.invalidateSize();
            console.log('[VerrerieMap] map.invalidateSize() appelée après délai.');
        }
      }, 150);
    } else {
      console.warn('[VerrerieMap] mapRef.current est null dans handleMapReady.');
    }
  };
  
  const mapKey = coordinates.join(',');

  return (
    <MapContainer 
      key={mapKey} 
      ref={mapRef} 
      center={position} 
      zoom={zoomLevel} 
      scrollWheelZoom={true} 
      // Application d'une hauteur fixe en pixels directement ici
      // style={{ height: '320px', width: '100%' }} 
      style={{ height: '100%', width: '100%' }}
      whenReady={handleMapReady} 
      placeholder={ 
        <div 
          style={{height: "100%", width: "100%", backgroundColor: "#e0e0e0", display: 'flex', alignItems: 'center', justifyContent: 'center'}} 
          aria-label="Carte en cours de chargement"
        >
          <p>Initialisation de la carte...</p>
        </div>
      }
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          {nom}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default VerrerieMap;
