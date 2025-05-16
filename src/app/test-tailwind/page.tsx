// src/app/test-tailwind/page.tsx
import React from 'react';
import { JSX } from 'react/jsx-runtime';

export default function TestTailwindPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
      <h1 className="text-2xl mb-4">Test Tailwind Responsif</h1>
      <div className="w-32 h-32 bg-purple-500 md:bg-pink-500 lg:bg-orange-500">
        Je devrais changer de couleur
      </div>
      <div className="mt-4 p-4 border md:border-4">
        <p className="text-black md:text-red-600 lg:text-blue-600">
          Ce texte devrait changer de couleur.
        </p>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-300 p-4 rounded">1</div>
        <div className="bg-gray-300 p-4 rounded">2</div>
        <div className="bg-gray-300 p-4 rounded">3</div>
        <div className="bg-gray-300 p-4 rounded">4</div>
      </div>
    </div>
  );
}