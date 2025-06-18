// src/components/MapAndFiltersClientWrapper.tsx
'use client';
import Link from 'next/link';
import { Combobox } from '@headlessui/react';
import React, { useState, useMemo, useEffect, Fragment } from 'react';
import { VerrerieMapPoint } from '@/types/verrerie';
import dynamic from 'next/dynamic';
import type { VerrerieMapProps } from '@/components/VerrerieMap';

const VerrerieMap = dynamic<VerrerieMapProps>(
  () => import('@/components/VerrerieMap').then(mod => mod.default),
  { ssr: false, loading: () => <div className="w-full h-full bg-blueGray-200 animate-pulse" /> }
);
  
interface MapAndFiltersClientWrapperProps {
  initialVerreries: VerrerieMapPoint[];
}

interface ComboBoxOption {
  verrerieData: VerrerieMapPoint; // L'objet verrerie original
  displayLabel: string;         // Le texte à afficher dans l'option
}

// Nouvelle fonction pour regrouper les régions par pays
function extractRegionsGroupedByCountry(verreries: VerrerieMapPoint[]): Record<string, string[]> {
  const grouped: Record<string, Set<string>> = {};
  for (const v of verreries) {
    if (typeof v.pays === 'string' && v.pays.trim() !== '' && typeof v.region === 'string' && v.region.trim() !== '') {
      if (!grouped[v.pays]) grouped[v.pays] = new Set();
      grouped[v.pays].add(v.region);
    }
  }
  // Convertit les Set en Array trié
  const result: Record<string, string[]> = {};
  for (const pays of Object.keys(grouped).sort()) {
    result[pays] = Array.from(grouped[pays]).sort();
  }
  return result;
}

function extractUniqueRegions(verreries: VerrerieMapPoint[], currentCountry: string): string[] {
  if (!verreries || verreries.length === 0) return [];
  
  let verreriesPourRegions = verreries;

  // Si un pays spécifique est sélectionné (et que ce n'est PAS "Tous les pays")
  if (currentCountry && currentCountry !== '') {
    verreriesPourRegions = verreries.filter(v => v.pays === currentCountry);
  }
  // Si currentCountry est "" (Tous les pays), on considère toutes les verreries
  // pour la liste des régions (donc verreriesPourRegions reste verreries).

  const regions = verreriesPourRegions
    .map(v => v.region)
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
  // DEBUG: Log des données initiales pour vérifier la présence de nomsHistoriquesEtRaisonsSociales
  useEffect(() => {
    console.log('[ClientWrapper] Initial Verreries Data (les 2 premiers):', JSON.stringify(initialVerreries.slice(0,2), null, 2));
  }, [initialVerreries]);

  const [allVerreriesData] = useState<VerrerieMapPoint[]>(initialVerreries);
  const [filteredVerreriesForMap, setFilteredVerreriesForMap] = useState<VerrerieMapPoint[]>(initialVerreries);

  const [selectedCountry, setSelectedCountry] = useState<string>('France'); // France par défaut
  const availableCountries = ['France', 'Allemagne', 'Suisse', 'Italie']; // Notre liste en dur

  const uniqueRegions = useMemo(() => {
    console.log(`[useMemo uniqueRegions] Calcul pour pays: "${selectedCountry || 'Tous'}"`);
    return extractUniqueRegions(allVerreriesData, selectedCountry);
  }, [allVerreriesData, selectedCountry]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  // État pour la ville sélectionnée
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Calculer les villes uniques basées sur la région sélectionnée
  const uniqueCities = useMemo(() => {
    if (!selectedRegion) return []; // Pas de villes si aucune région n'est sélectionnée
    return extractUniqueCities(allVerreriesData, selectedRegion);
  }, [allVerreriesData, selectedRegion]);

  const [verrerieQuery, setVerrerieQuery] = useState(''); // Texte saisi par l'utilisateur pour la recherche
  const [selectedVerrerie, setSelectedVerrerie] = useState<VerrerieMapPoint | null>(null);

const filteredVerreriesForComboboxOptions = useMemo((): ComboBoxOption[] => {
    let VerreriesToConsider = allVerreriesData;

    if (selectedCountry && selectedCountry !== '') {
      VerreriesToConsider = VerreriesToConsider.filter(v => v.pays === selectedCountry);
    }
    if (selectedRegion) {
      VerreriesToConsider = VerreriesToConsider.filter(v => v.region === selectedRegion);
    }
    if (selectedCity) {
      VerreriesToConsider = VerreriesToConsider.filter(v => v.villeOuCommune === selectedCity);
    }
    
    // --- AJOUTEZ OU VÉRIFIEZ CE BLOC DE LOGS DE DÉBOGAGE ---
    console.log('[ComboBox Options DEBUG] UseMemo calcul. États :');
    console.log('  selectedCountry:', JSON.stringify(selectedCountry));
    console.log('  selectedRegion:', JSON.stringify(selectedRegion));
    console.log('  selectedCity:', JSON.stringify(selectedCity));
    console.log('  verrerieQuery:', JSON.stringify(verrerieQuery));
    // Affichons les pays des 5 premières verreries dans allVerreriesData pour confirmer son contenu
    console.log('  allVerreriesData (premières 5 - pays):', allVerreriesData.slice(0, 5).map(v => v.pays));
    // Affichons les pays des 5 premières verreries dans VerreriesToConsider APRÈS les filtres initiaux
    console.log('  VerreriesToConsider (après filtres initiaux, premières 5 - pays):', VerreriesToConsider.slice(0, 5).map(v => `${v.nomPrincipal} (${v.pays})`));
    console.log('  Nombre total dans VerreriesToConsider:', VerreriesToConsider.length);
    // --- FIN DU BLOC DE LOGS ---

    if (verrerieQuery.trim() === '') {
      // Retourne les 50 premières verreries (filtrées par région/ville) avec leur nom principal si pas de query
      return VerreriesToConsider.slice(0, 50).map(v => ({
        verrerieData: v,
        displayLabel: v.nomPrincipal,
      }));
    }
    
    const queryLower = verrerieQuery.toLowerCase().trim();
    const results: ComboBoxOption[] = [];

    console.log(`[ComboBoxFilter] Début du filtrage pour query: "${queryLower}" sur ${VerreriesToConsider.length} verreries.`); // Vous voyez ce log

    for (const verrerie of VerreriesToConsider) {
      // Log pour CHAQUE verrerie en cours de test
      console.log(`[ComboBoxFilter] Test de: ${verrerie.nomPrincipal}`);

      const nomPrincipalLower = verrerie.nomPrincipal.toLowerCase();
      let displayLabel = verrerie.nomPrincipal;
      let matched = false; // Réinitialiser matched pour chaque verrerie
      
      if (nomPrincipalLower.includes(queryLower)) {
        matched = true;
        console.log(`[ComboBoxFilter] ----> MATCH sur nomPrincipal: ${verrerie.nomPrincipal} pour query "${queryLower}"`);
      }
      
      let firstMatchedDistinctAltName: string | undefined = undefined;
      const verrerieNomsHistoriques = Array.isArray(verrerie.nomsHistoriquesEtRaisonsSociales) 
                                      ? verrerie.nomsHistoriquesEtRaisonsSociales 
                                      : [];
      
      if (verrerieNomsHistoriques.length > 0) {
        console.log(`[ComboBoxFilter] Noms Historiques pour ${verrerie.nomPrincipal}:`, verrerieNomsHistoriques.map(nh => nh.nom));
      }

      for (const nomHist of verrerieNomsHistoriques) {
        if (nomHist.nom && typeof nomHist.nom === 'string') {
          const altNameLower = nomHist.nom.toLowerCase();
          // Log pour chaque nom alternatif testé
          console.log(`[ComboBoxFilter] ... Test nom alt: "${nomHist.nom}" (en minuscule: "${altNameLower}")`);
          if (altNameLower.includes(queryLower)) {
            console.log(`[ComboBoxFilter] ----> MATCH sur nom alternatif: "${nomHist.nom}" pour verrerie ${verrerie.nomPrincipal}`);
            matched = true; // Un match a eu lieu (soit principal, soit alternatif)
            if (altNameLower !== nomPrincipalLower && !firstMatchedDistinctAltName) {
              firstMatchedDistinctAltName = nomHist.nom;
            }
            // Prioriser si la query EST le nom alternatif
            if (queryLower === altNameLower && altNameLower !== nomPrincipalLower) {
               firstMatchedDistinctAltName = nomHist.nom; 
               break; // On a trouvé le meilleur match alternatif, on peut arrêter pour CETTE verrerie
            }
          }
        }
      }
      
      if (matched) {
        // Si un nom alternatif a matché ET (la query EST ce nom alternatif OU le nom principal ne matchait pas)
        if (firstMatchedDistinctAltName && 
            (verrerieNomsHistoriques.some(nh => nh.nom?.toLowerCase() === queryLower && nh.nom.toLowerCase() !== nomPrincipalLower) || 
             !nomPrincipalLower.includes(queryLower))) {
          displayLabel = `${verrerie.nomPrincipal} (${firstMatchedDistinctAltName})`;
        }
        console.log(`[ComboBoxFilter] AJOUT aux résultats: Verrerie: ${verrerie.nomPrincipal}, Label affiché: ${displayLabel}`);
        results.push({ verrerieData: verrerie, displayLabel });
      } else {
        console.log(`[ComboBoxFilter] AUCUN MATCH pour ${verrerie.nomPrincipal}`);
      }
    }
    console.log(`[ComboBoxFilter] Fin du filtrage, ${results.length} résultats trouvés:`, results.map(r => r.displayLabel));
    return results.slice(0, 20); // Toujours limiter le nombre de résultats
  }, [allVerreriesData, selectedCountry, selectedRegion, selectedCity, verrerieQuery]);

  useEffect(() => {
    let VerreriesToDisplay = allVerreriesData;

    if (selectedVerrerie) { // Si une verrerie spécifique est sélectionnée
      VerreriesToDisplay = [selectedVerrerie];
    } else { // Sinon, appliquer les filtres pays, région et ville
      if (selectedCountry && selectedCountry !== '') {
        VerreriesToDisplay = VerreriesToDisplay.filter(v => v.pays === selectedCountry);
      }
      if (selectedRegion) {
        VerreriesToDisplay = VerreriesToDisplay.filter(v => v.region === selectedRegion);
      }
      if (selectedCity) { // Filtrer par ville si une ville est sélectionnée
        VerreriesToDisplay = VerreriesToDisplay.filter(v => v.villeOuCommune === selectedCity);
      }
    }
    setFilteredVerreriesForMap(VerreriesToDisplay);
  }, [selectedCountry, selectedRegion, selectedCity, selectedVerrerie, allVerreriesData]); // selectedCity ajouté aux dépendances

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
              <VerrerieMap points={filteredVerreriesForMap} />
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

          {/* Filtre Pays */}
          <div className="mb-4"> {/* Ajout de mb-4 pour espacement cohérent */}
            <label htmlFor="country-select" className="block text-sm font-medium text-blueGray-700 font-sans">Pays</label>
            <select
              id="country-select"
              name="country"
              value={selectedCountry}
              onChange={(e) => {
                const newCountry = e.target.value;
                console.log(`[CountryChange] Nouveau pays sélectionné: "${newCountry}"`);
                setSelectedCountry(newCountry);
                setSelectedRegion(''); // Réinitialiser la région sélectionnée
                setSelectedCity('');   // Réinitialiser la ville sélectionnée
                setSelectedVerrerie(null); // Optionnel mais cohérent : réinitialiser la verrerie du ComboBox
                setVerrerieQuery('');      // Optionnel mais cohérent : réinitialiser la recherche du ComboBox
              }}
              className="mt-1 block w-full p-2 border border-blueGray-300 rounded-md shadow-sm focus:ring-gold focus:border-gold font-sans"
            >
              <option value="">Tous les pays</option>
              {availableCountries.map(countryItem => (
                <option key={countryItem} value={countryItem}>{countryItem}</option>
              ))}
            </select>
          </div>

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
              {selectedCountry === '' ? (
                // Cas "Tous les pays" : régions groupées par pays
                Object.entries(extractRegionsGroupedByCountry(allVerreriesData)).map(([pays, regions]) => (
                  <optgroup key={pays} label={pays}>
                    {regions.map(regionItem => (
                      <option key={pays + '-' + regionItem} value={regionItem}>{regionItem}</option>
                    ))}
                  </optgroup>
                ))
              ) : (
                // Cas pays sélectionné : liste simple
                uniqueRegions.map(regionItem => (
                  <option key={regionItem} value={regionItem}>{regionItem}</option>
                ))
              )}
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
                    onChange={(event) => {
                      console.log('[ComboBox Input onChange] Nouvelle valeur:', event.target.value);
                      setVerrerieQuery(event.target.value);
                    }}
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
                      key={verrerie.verrerieData.id}
                      value={verrerie.verrerieData}
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
                            {verrerie.displayLabel}
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

        {/* Bloc "Le Projet Radix Vitri" */}
        <div className="mt-6 pt-6 border-t border-blueGray-200">
          <h3 className="text-xl font-semibold text-blueGray-800 mb-3 font-serif">
            Le Projet Radix Vitri
          </h3>
          <p className="text-sm text-blueGray-600 mb-4">
            Un hommage à nos ancêtres verriers et à leur histoire. Découvrez les lieux et les parcours qui ont façonné cette industrie.
          </p>
          <Link href="/a-propos" className="text-sm font-semibold text-gold hover:text-gold-dark hover:underline">
            En savoir plus sur le projet &rarr;
          </Link>
        </div>

        {/* Bloc "Rechercher un verrier" (peut rester tel quel pour l'instant ou être intégré différemment) 
        <h3 className="text-2xl font-semibold text-blueGray-800 mb-4 mt-8 font-serif">Rechercher un verrier</h3>
        <div className="space-y-4 p-6 bg-blueGray-50 rounded-lg shadow">
          <input type="text" placeholder="Nom du verrier" className="mt-1 block w-full p-2 border border-blueGray-300 rounded-md shadow-sm focus:ring-gold focus:border-gold font-sans" />
          <button type="button" className="w-full bg-everglade hover:bg-everglade-clear text-white font-semibold py-2.5 px-6 rounded-lg shadow transition duration-300">Rechercher</button>
        </div> */}
      </div>
    </div>
  );
}