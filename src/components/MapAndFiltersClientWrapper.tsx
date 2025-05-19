// src/components/MapAndFiltersClientWrapper.tsx
'use client';
import { Combobox } from '@headlessui/react';
import React, { useState, useMemo, useEffect, Fragment } from 'react';
import MapLoader from '@/components/MapLoader'; // Assurez-vous que le chemin est correct
// Importez Headless UI ComboBox et d'autres composants nécessaires plus tard

// (VerrerieMapPoint interface - idéalement importée d'un fichier de types partagé)
interface VerrerieMapPoint {
  id: string;
  slug: string;
  nomPrincipal: string;
  nomsAlternatifs?: string[];
  coordonnees: [number, number];
  villeOuCommune?: string;
  region?: string; // Corrigé par vos soins
}

interface MapAndFiltersClientWrapperProps {
  initialVerreries: VerrerieMapPoint[];
}

function extractUniqueRegions(verreries: VerrerieMapPoint[]): string[] {
  if (!verreries || verreries.length === 0) return [];
  const regions = verreries
    .map(v => v.region) // Corrigé par vos soins
    .filter((region): region is string => typeof region === 'string' && region.trim() !== '');
  return Array.from(new Set(regions)).sort();
}

// Fonction pour extraire les villes uniques en fonction de la région sélectionnée
function extractUniqueCities(verreries: VerrerieMapPoint[], currentRegion: string): string[] {
  if (!currentRegion || !verreries || verreries.length === 0) {
    return [];
  }
  const cities = verreries
    .filter(v => v.region === currentRegion) // Filtrer par la région actuelle
    .map(v => v.villeOuCommune)
    .filter((city): city is string => typeof city === 'string' && city.trim() !== '');
  return Array.from(new Set(cities)).sort();
}

export default function MapAndFiltersClientWrapper({ initialVerreries }: MapAndFiltersClientWrapperProps) {
  const [allVerreriesData] = useState<VerrerieMapPoint[]>(initialVerreries);
  const [filteredVerreriesForMap, setFilteredVerreriesForMap] = useState<VerrerieMapPoint[]>(initialVerreries);

  const uniqueRegions = useMemo(() => extractUniqueRegions(allVerreriesData), [allVerreriesData]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  const [verrerieQuery, setVerrerieQuery] = useState(''); // Texte saisi par l'utilisateur pour la recherche
  const [selectedVerrerie, setSelectedVerrerie] = useState<VerrerieMapPoint | null>(null);
  
  // État pour la ville sélectionnée
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Calculer les villes uniques basées sur la région sélectionnée
  const uniqueCities = useMemo(() => {
    if (!selectedRegion) return []; // Pas de villes si aucune région n'est sélectionnée
    return extractUniqueCities(allVerreriesData, selectedRegion);
  }, [allVerreriesData, selectedRegion]);

  const filteredVerreriesForComboboxOptions = useMemo(() => {
    let options = allVerreriesData;

    if (selectedRegion) {
      options = options.filter(v => v.region === selectedRegion);
    }
    if (selectedCity) {
      options = options.filter(v => v.villeOuCommune === selectedCity);
    }

    if (verrerieQuery === '') {
      return options.slice(0, 20); // Limiter l'affichage initial si beaucoup d'options, ou afficher tout
    }

    return options.filter(verrerie => {
      const queryLower = verrerieQuery.toLowerCase().trim();
      const nomPrincipalMatch = verrerie.nomPrincipal.toLowerCase().includes(queryLower);

      // DEBUG: Inspecter les noms alternatifs
      if (verrerie.nomsAlternatifs && !verrerie.nomsAlternatifs.every(name => typeof name === 'string')) {
        console.warn('Noms alternatifs non-string pour:', verrerie.nomPrincipal, verrerie.nomsAlternatifs);
      }

      const nomsAlternatifsMatch = verrerie.nomsAlternatifs?.some(altName =>
        typeof altName === 'string' && altName.toLowerCase().includes(queryLower)
      );
      return nomPrincipalMatch || nomsAlternatifsMatch;
    }).slice(0, 20); // Limiter aussi les résultats de recherche, par défaut : 20 lignes maximum.
  }, [allVerreriesData, selectedRegion, selectedCity, verrerieQuery]);

  useEffect(() => {
    let VerreriesToDisplay = allVerreriesData;

    if (selectedVerrerie) { // Si une verrerie spécifique est sélectionnée
      VerreriesToDisplay = [selectedVerrerie];
    } else { // Sinon, appliquer les filtres région et ville
      if (selectedRegion) {
        VerreriesToDisplay = VerreriesToDisplay.filter(v => v.region === selectedRegion);
      }
      if (selectedCity) { // Filtrer par ville si une ville est sélectionnée
        VerreriesToDisplay = VerreriesToDisplay.filter(v => v.villeOuCommune === selectedCity);
      }
    }
    setFilteredVerreriesForMap(VerreriesToDisplay);
  }, [selectedRegion, selectedCity, selectedVerrerie, allVerreriesData]); // selectedCity ajouté aux dépendances

  // Mise à jour des gestionnaires de changement pour réinitialiser le filtre verrerie
  const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(event.target.value);
    setSelectedCity('');
    setSelectedVerrerie(null); // Réinitialiser la verrerie sélectionnée
    setVerrerieQuery('');      // Réinitialiser le texte de recherche
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
    setSelectedVerrerie(null); // Réinitialiser la verrerie sélectionnée
    setVerrerieQuery('');      // Réinitialiser le texte de recherche
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Colonne de la Carte (Gauche) */}
      <div className="lg:col-span-2 flex flex-col">
        <h3 className="text-2xl font-semibold text-blueGray-800 mb-4 font-serif">Carte des verreries</h3>
        <div className="bg-blueGray-100 rounded-lg shadow border border-blueGray-200 flex-grow min-h-[450px] md:min-h-[500px] lg:min-h-[600px] flex items-center justify-center text-blueGray-500 relative overflow-hidden">
          <div className="absolute inset-0">
            {filteredVerreriesForMap.length > 0 ? (
              <MapLoader points={filteredVerreriesForMap} />
            ) : (
              <span className="italic p-4">Aucune verrerie ne correspond à vos critères.</span>
            )}
          </div>
        </div>
      </div>

      {/* Colonne des Filtres (Droite) */}
      <div className="lg:col-span-1">
        <h3 className="text-2xl font-semibold text-blueGray-800 mb-4 font-serif">Rechercher des verreries</h3>
        <div className="space-y-4 p-6 bg-blueGray-50 rounded-lg shadow">
          {/* Filtre Région */}
          <div className="mb-4"> {/* Ajout de mb-4 pour espacement cohérent */}
            <label htmlFor="region-select" className="block text-sm font-medium text-blueGray-700 font-sans">Région</label>
            <select
              id="region-select"
              name="region"
              value={selectedRegion}
              onChange={handleRegionChange}
              className="mt-1 block w-full p-2 border border-blueGray-300 rounded-md shadow-sm focus:ring-gold focus:border-gold font-sans"
            >
              <option value="">Toutes les régions</option>
              {uniqueRegions.map(regionItem => ( // regionItem pour éviter conflit de nom avec la props 'region' de VerrerieMapPoint
                <option key={regionItem} value={regionItem}>{regionItem}</option>
              ))}
            </select>
          </div>

          {/* Filtre Ville */}
          <div className="mb-4">
            <label htmlFor="ville-select" className="block text-sm font-medium text-blueGray-700 font-sans">Ville</label>
            <select
              id="ville-select"
              name="ville"
              value={selectedCity}
              onChange={handleCityChange}
              disabled={!selectedRegion || uniqueCities.length === 0}
              className="mt-1 block w-full p-2 border border-blueGray-300 rounded-md shadow-sm focus:ring-gold focus:border-gold font-sans disabled:bg-gray-100"
            >
              <option value="">Toutes les villes</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Filtre Verrerie (ComboBox) */}
          <div className="mb-4 relative">
            <Combobox value={selectedVerrerie} onChange={setSelectedVerrerie}>
              <Combobox.Label className="block text-sm font-medium text-blueGray-700 font-sans">
                Verrerie
              </Combobox.Label>
              <div className="relative mt-1">
                <Combobox.Input
                  className="w-full p-2 border border-blueGray-300 rounded-md shadow-sm focus:ring-gold focus:border-gold font-sans"
                  onChange={(event) => setVerrerieQuery(event.target.value)}
                  displayValue={(verrerie: VerrerieMapPoint | null) => verrerie?.nomPrincipal || ''}
                  placeholder="Nom de la verrerie..."
                  autoComplete="off"
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  {/* Icône de sélecteur (chevron), vous pouvez utiliser une lib d'icônes ou un SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                    <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.24a.75.75 0 011.06 0L10 14.148l2.7-2.908a.75.75 0 111.06 1.06l-3.25 3.5a.75.75 0 01-1.06 0l-3.25-3.5a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </Combobox.Button>
              </div>
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {verrerieQuery.length > 0 && filteredVerreriesForComboboxOptions.length === 0 ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                    Aucune verrerie trouvée.
                  </div>
                ) : (
                  filteredVerreriesForComboboxOptions.map((verrerie) => (
                    <Combobox.Option
                      key={verrerie.id}
                      value={verrerie}
                      as={Fragment} // Permet un rendu personnalisé sans wrapper div inutile
                    >
                      {({ active, selected }) => (
                        <li
                          className={`cursor-default select-none py-2 px-4 flex items-center ${
                            active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                          }`}
                        >
                          <span className="w-7 flex-shrink-0 flex items-center justify-start"> {/* Largeur fixe pour l'icône, ajustez w-7 (1.75rem) si besoin */}
                            {selected && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-600"> {/* Couleur ajoutée directement ici */}
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {verrerie.nomPrincipal}
                            {/* Ici, nous ajouterons la logique pour "Aussi connue sous..." à l'étape suivante */}
                          </span>
                        </li>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Combobox>
          </div>
          {/* TODO: Bouton "Voir la liste" - que fait-il ? Navigue vers une page catalogue avec les filtres appliqués ? */}
        </div>

        {/* Bloc "Rechercher un verrier" (peut rester tel quel pour l'instant ou être intégré différemment) */}
        <h3 className="text-2xl font-semibold text-blueGray-800 mb-4 mt-8 font-serif">Rechercher un verrier</h3>
        <div className="space-y-4 p-6 bg-blueGray-50 rounded-lg shadow">
          <input type="text" placeholder="Nom du verrier" className="mt-1 block w-full p-2 border border-blueGray-300 rounded-md shadow-sm focus:ring-gold focus:border-gold font-sans" />
          <button type="button" className="w-full bg-everglade hover:bg-everglade-clear text-white font-semibold py-2.5 px-6 rounded-lg shadow transition duration-300">Rechercher</button>
        </div>
      </div>
    </div>
  );
}