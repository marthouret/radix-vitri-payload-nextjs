// src/components/TimelineClient.tsx
'use client';
import React from 'react';
import dynamic from 'next/dynamic';

// --- Vos interfaces FriseItem, ChronoMedia ---
interface ChronoMedia {
  type: 'IMAGE' | 'VIDEO';
  source: { url: string; };
  name?: string;
}

export interface FriseItem { // Exporter si utilisée par la page parente pour typer les données
  title?: string;
  cardTitle?: string;
  cardSubtitle?: string;
  cardDetailedText?: string | string[];
  media?: ChronoMedia;
  url?: string;
  _type: 'engagement' | 'evenementBiographique';
  _datePourTri: Date;
  _idOriginal: string | number;
}
// --- Fin des interfaces ---

// 1. Définir une interface pour les props du composant Chrono que nous utilisons
interface ReactChronoProps {
  items: FriseItem[];
  mode: "VERTICAL_ALTERNATING" | "VERTICAL" | "HORIZONTAL"; // Ajoutez d'autres modes si vous les utilisez
  theme?: {
    primary?: string;
    secondary?: string;
    cardBgColor?: string;
    cardForeColor?: string;
    titleColor?: string;
    titleColorActive?: string;
  };
  disableToolbar?: boolean;
  useReadMore?: boolean;
  cardHeight?: number;
  // Ajoutez d'autres props de react-chrono que vous pourriez utiliser
  // par exemple: scrollable, allowDynamicUpdate, fontSizes, etc.
  // Consultez la documentation de react-chrono pour les props exactes
}

// 2. Utiliser cette interface avec l'import dynamique
const Chrono = dynamic<ReactChronoProps>( // <<<< Spécifiez le type des props ici
  () => import('react-chrono').then(mod => mod.Chrono as React.ComponentType<ReactChronoProps>), // Assertion de type ici aussi
  {
    ssr: false,
    loading: () => <p className="italic text-blueGray-500 p-4">Chargement de la frise...</p>
  }
);

interface TimelineClientProps {
  items: FriseItem[];
}

const TimelineClient: React.FC<TimelineClientProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div style={{ width: "100%", minHeight: "400px" }}>
      <Chrono
        items={items}
        mode="VERTICAL_ALTERNATING"
        theme={{
          primary: '#DAA520',
          secondary: 'rgba(218, 165, 32, 0.1)',
          cardBgColor: '#FFFFFF',
          cardForeColor: '#475569',
          titleColor: '#DAA520',
          titleColorActive: '#b8860b',
        }}
        disableToolbar={true}
        useReadMore={false}
        cardHeight={100}
      />
    </div>
  );
};

export default TimelineClient;