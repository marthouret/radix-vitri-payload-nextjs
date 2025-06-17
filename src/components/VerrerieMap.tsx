// src/components/VerrerieMap.tsx
'use client';
import React, { useEffect, useRef } from 'react'; // Ajout de useEffect
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression, Map as LeafletMap, LatLngBoundsLiteral } from 'leaflet'; // Ajout de LatLngBoundsLiteral
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'; // Ajout de useMap
import Link from 'next/link'; // Pour les liens dans les popups

import { MapPoint } from '@/types/map';

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
  points: MapPoint[]; // Maintenant un tableau de points
  // center?: [number, number]; // Optionnel, on peut le calculer
  defaultZoomLevel?: number; // Zoom par défaut si un seul point ou si pas de fitBounds
  singlePointZoomLevel?: number; // Zoom spécifique pour quand il n'y a qu'un seul point
  disableMapAnimation?: boolean;
}

interface FitBoundsToMarkersProps { // Pour le recentrage/zoom dynamique
  points: MapPoint[];
  singlePointZoomLevel: number; 
  disableAnimation: boolean;
}

// Un petit composant pour ajuster les limites de la carte
const FitBoundsToMarkers: React.FC<FitBoundsToMarkersProps> = ({ points, singlePointZoomLevel, disableAnimation }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return; // S'assurer que la carte est initialisée
    if (points && points.length === 1) {
      const [singlePoint] = points;
      // Leaflet attend [latitude, longitude]
      const latLng: LatLngExpression = [singlePoint.coordonnees[1], singlePoint.coordonnees[0]];
      if (disableAnimation) {
        map.setView(latLng, singlePointZoomLevel); // Transition instantanée
      } else {
        map.flyTo(latLng, singlePointZoomLevel, { duration: 2.5 }); // Animation (durée ajustée)
      }
    } else if (points && points.length > 1) {
      const boundsArray = points.map(point => [point.coordonnees[1], point.coordonnees[0]] as [number, number]);
      // Vérifier que boundsArray n'est pas vide avant d'appeler fitBounds
      if (boundsArray.length > 0) {
        map.fitBounds(boundsArray as LatLngBoundsLiteral, { padding: [50, 50], animate: !disableAnimation });
      }
    } else if (points && points.length === 0) {
        // Optionnel : si aucun point n'est sélectionné (après avoir été filtré),
        // revenir à une vue par défaut. MapLoader gère déjà un message,
        // mais si VerrerieMap est toujours rendu, il faut décider quoi afficher.
        // Par exemple, la vue initiale de la France.
        if (disableAnimation) {
          map.setView([46.603354, 1.888334], 6);
        } else {
          map.flyTo([46.603354, 1.888334], 6, { duration: 0.5 }); // Vue par défaut (France)
        }
     }
  }, [points, map, singlePointZoomLevel, disableAnimation]);
  return null;
};

const VerrerieMap: React.FC<VerrerieMapProps> = ({ 
  points, 
  defaultZoomLevel = 6, // Zoom pour la carte avec plusieurs points avant fitBounds
  singlePointZoomLevel = 14, // Zoom spécifique pour quand il n'y a qu'un seul point
  disableMapAnimation = false 
}) => { 
  const mapRef = useRef<LeafletMap | null>(null);

  let initialCenter: LatLngExpression;
  let currentZoomLevel: number;

  if (points && points.length === 1) {  // Cas où il n'y a qu'un seul point (localisation d'une verrerie par exemple).
    initialCenter = [points[0].coordonnees[1], points[0].coordonnees[0]]; // Centre sur l'unique point.
    currentZoomLevel = singlePointZoomLevel; // Utilise le niveau de zoom pour un seul point.
  } else {
    initialCenter = [46.603354, 1.888334]; // Centre approximatif de la France (pour plusieurs points avant fitBounds).
    currentZoomLevel = defaultZoomLevel;
  }

  if (!points || points.length === 0) { // Cas d'erreur où il n'y a aucun point.
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
            {/* Liste des engagements à cet endroit */}
            {point.popupDetails?.allEngagementsAtThisLocation && point.popupDetails.allEngagementsAtThisLocation?.map((engagementDetail, index, array) => (
              <div key={index} className={index > 0 ? "border-t border-blueGray-200" : ""}> {/* Séparateur si plusieurs engagements */}
                {engagementDetail.fonction && (
                  <div className="text-sm text-blueGray-800 font-semibold">{engagementDetail.fonction}</div>
                )}
                {engagementDetail.periode && (
                  <div className="text-sm text-blueGray-600">{engagementDetail.periode}</div>
                )}
                {/* Vous pouvez aussi afficher engagementDetail.typeEvenement si c'est pertinent ici */}
                {index === array.length - 1 && (
                  <hr className="my-2 border-blueGray-300" />
                )}
              </div>
            ))}
            <Link href={`/verreries/${point.slug}`} className="text-sm font-semibold text-gold hover:underline">
              {point.nomPrincipal}
            </Link>
            {(point.nomDuLieu || point.villeOuCommune) && <div className="text-sm text-blueGray-600">{point.nomDuLieu || point.villeOuCommune}</div>}
          </Popup>
        </Marker>
      ))}
      {/* Ce composant ajustera la vue pour montrer tous les marqueurs */}
      <FitBoundsToMarkers points={points} singlePointZoomLevel={singlePointZoomLevel} disableAnimation={disableMapAnimation} />
    </MapContainer>
  );
};

export default VerrerieMap;
