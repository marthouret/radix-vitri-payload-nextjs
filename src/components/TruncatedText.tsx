// src/components/TruncatedText.tsx
"use client";
import React from 'react';

type TruncatedTextProps = {
  text: string;
  charLimit: number;
  lineLimitForClamp: number;
};

const TruncatedText: React.FC<TruncatedTextProps> = ({ text, charLimit, lineLimitForClamp }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const requiresTruncation = text.length > charLimit;

  return (
    <div>
      <p className={`whitespace-pre-line text-sm ${!isExpanded && requiresTruncation ? `line-clamp-${lineLimitForClamp}` : ''}`}>
        {text}
      </p>
      {requiresTruncation && (
        // On enveloppe le bouton dans un div avec flex et justify-end pour l'aligner à droite
        <div className="flex justify-end">
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            // Style un peu plus discret
            className="text-blueGray-500 hover:text-gold text-sm font-semibold mt-1 hover:underline"
          >
            {isExpanded ? 'Voir moins' : 'Voir plus'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TruncatedText; // On exporte le composant
// pour qu'il puisse être utilisé dans d'autres fichiers
// Il utilise la classe line-clamp de Tailwind CSS pour tronquer le texte
// et un état local pour gérer l'affichage complet ou tronqué du texte.
// Le bouton permet à l'utilisateur de basculer entre les deux états.
// Assurez-vous que Tailwind CSS est configuré pour utiliser line-clamp dans votre projet.
// Vous pouvez l'utiliser dans vos pages ou composants comme suit :
// <TruncatedText text="Votre texte ici" lineLimit={3} />
