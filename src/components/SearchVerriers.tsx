// src/components/SearchVerriers.tsx

"use client"; // On déclare ce composant comme interactif

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Important : utiliser celui de 'navigation'

const SearchVerriers = () => {
  // On utilise useState pour garder en mémoire ce que l'utilisateur tape
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Empêche la page de se recharger à la soumission du formulaire
    if (query.trim() === '') return; // On ne lance pas de recherche si le champ est vide

    // On redirige l'utilisateur vers la page de résultats avec sa recherche dans l'URL
    router.push(`/recherche?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-blueGray-100">
      <h2 className="text-3xl font-bold text-blueGray-800 mb-4 font-serif">
        Rechercher une Personne
      </h2>
      <p className="text-blueGray-600 mb-6 max-w-2xl mx-auto">
        Retrouvez un verrier ou une personnalité par son nom pour découvrir son parcours professionnel et ses liens avec les verreries de France.
      </p>
      <form onSubmit={handleSearch} className="flex justify-center items-center gap-x-2 max-w-lg mx-auto">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: Haour, Neuvesel, Schmid..."
          className="w-full px-4 py-3 border border-blueGray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold transition-shadow shadow-sm"
          aria-label="Rechercher une personne"
        />
        <button
          type="submit"
          className="bg-everglade hover:bg-everglade-clear text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors shrink-0"
        >
          Rechercher
        </button>
      </form>
    </div>
  );
};

export default SearchVerriers;