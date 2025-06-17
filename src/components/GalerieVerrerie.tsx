// src/components/GalerieVerrerie.tsx
import React from 'react';

// On garde les types pour la communication avec la page
type ImageMedia = {
  url: string;
  alt?: string;
};

type GalerieVerrerieProps = {
  images: ImageMedia[];
};

const GalerieVerrerie: React.FC<GalerieVerrerieProps> = ({ images }) => {
  // Le garde-fou, au cas où
  if (!images || images.length === 0) {
    return <p className="italic text-blueGray-500">Aucune image dans la galerie.</p>;
  }

  return (
    // Une grille à 2 colonnes sur les écrans moyens et plus, 1 seule sur mobile
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {images.map((image) => (
        // 'group' permet de déclencher le hover sur les éléments enfants
        <div key={image.url} className="relative group overflow-hidden rounded-lg shadow-md">
          {/* On utilise la balise <img> simple dont nous savons qu'elle fonctionne */}
          <img
            src={image.url}
            alt={image.alt || 'Image de la galerie'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          {/* La légende qui apparaît au survol */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end p-4">
            <p className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {image.alt}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GalerieVerrerie;