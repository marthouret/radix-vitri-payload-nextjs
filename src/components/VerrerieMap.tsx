// src/components/VerrerieMap.tsx
'use client';
import React, { useEffect, useRef } from 'react'; // Ajout de useEffect
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression, Map as LeafletMap, LatLngBoundsLiteral } from 'leaflet'; // Ajout de LatLngBoundsLiteral
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'; // Ajout de useMap
import Link from 'next/link'; // Pour les liens dans les popups

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

// Interface pour chaque point sur la carte
interface MapPoint {
  id: string;
  slug: string;
  nomPrincipal: string;
  coordonnees: [number, number]; // [longitude, latitude]
  villeOuCommune?: string;
}

interface VerrerieMapProps {
  points: MapPoint[]; // Maintenant un tableau de points
  // center?: [number, number]; // Optionnel, on peut le calculer
  defaultZoomLevel?: number; // Zoom par défaut si un seul point ou si pas de fitBounds
  singlePointZoomLevel?: number; // Zoom spécifique pour quand il n'y a qu'un seul point
}

// Un petit composant pour ajuster les limites de la carte
const FitBoundsToMarkers: React.FC<{ points: MapPoint[] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 1) { // CHANGEMENT : > 1 au lieu de > 0
      const bounds = points.map(point => [point.coordonnees[1], point.coordonnees[0]] as [number, number]);
      if (bounds.length > 0) {
        map.fitBounds(bounds as LatLngBoundsLiteral, { padding: [50, 50] });
      }
    } else if (points && points.length === 1) {
      // Pour un seul point, on peut juste centrer la carte sur ce point
      // Le zoom sera géré par la prop 'zoom' du MapContainer
      map.setView([points[0].coordonnees[1], points[0].coordonnees[0]]);
    }
  }, [points, map]);
  return null;
};

const VerrerieMap: React.FC<VerrerieMapProps> = ({ 
  points, 
  defaultZoomLevel = 6, // Zoom pour la carte avec plusieurs points avant fitBounds
  singlePointZoomLevel = 14 // Zoom spécifique pour quand il n'y a qu'un seul point
}) => { 
  const mapRef = useRef<LeafletMap | null>(null);

  let initialCenter: LatLngExpression;
  let currentZoomLevel: number;

  if (points && points.length === 1) {
    initialCenter = [points[0].coordonnees[1], points[0].coordonnees[0]]; // Centre sur l'unique point
    currentZoomLevel = singlePointZoomLevel; // Utilise le zoom pour un seul point
  } else {
    initialCenter = [46.603354, 1.888334]; // Centre approximatif de la France (pour plusieurs points avant fitBounds)
    currentZoomLevel = defaultZoomLevel;
  }

  if (!points || points.length === 0) {
    return <div className="p-4 text-orange-700 bg-orange-100 border border-orange-500 rounded">Aucun point à afficher sur la carte.</div>;
  }

  return (
    <MapContainer
      ref={mapRef}
      center={initialCenter}
      zoom={currentZoomLevel}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
      // whenReady est toujours utile pour invalidateSize si besoin
      whenReady={() => setTimeout(() => mapRef.current?.invalidateSize(), 0)} 
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
      {points.map(point => (
        <Marker key={point.id} position={[point.coordonnees[1], point.coordonnees[0]] /* Leaflet: Lat, Lon */}>
          <Popup>
            <Link href={`/verreries/${point.slug}`} className="font-semibold text-gold hover:underline">
              {point.nomPrincipal}
            </Link>
            {point.villeOuCommune && <div className="text-sm text-blueGray-600">{point.villeOuCommune}</div>}
          </Popup>
        </Marker>
      ))}
      {/* Ce composant ajustera la vue pour montrer tous les marqueurs */}
      <FitBoundsToMarkers points={points} />
    </MapContainer>
  );
};

export default VerrerieMap;
