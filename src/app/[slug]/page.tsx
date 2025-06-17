// src/app/[slug]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Page } from '@/payload-types';
import ArticleContentRenderer from '@/components/ArticleContentRenderer'; // Votre composant pour le RichText

export const dynamic = 'force-dynamic';

const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';

// --- Fonction pour récupérer les données de la page ---
async function getPage(slug: string): Promise<Page | null> {
  try {
    const response = await fetch(`${payloadUrl}/api/pages?where[slug][equals]=${slug}&limit=1&depth=0`, { 
      next: { revalidate: 60 } // Met en cache les pages pendant 60 secondes
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.docs[0] || null;
  } catch (error) {
    console.error("Error fetching page:", error);
    return null;
  }
}

// --- Fonction pour générer les métadonnées (titre de l'onglet) ---
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const page = await getPage(params.slug);
    // Si la page n'est pas trouvée, on retourne un titre générique
  if (!page) {
    return { title: 'Page non trouvée' }
  }
  return {
    title: page.title, // ex: "À Propos | Radix Vitri"
  }
}

// --- Le composant de la page ---
export default async function PageTemplate({ params }: { params: any }) {
  const page = await getPage(params.slug);

  // Si la page n'est pas trouvée dans Payload, on affiche une page 404
  if (!page) {
    return notFound();
  }

  return (
    <div className="bg-cream">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <header className="mb-8 md:mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-blueGray-800 font-serif">{page.title}</h1>
        </header>
        <main className="prose lg:prose-xl max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-md">
          {/* On utilise votre composant existant pour afficher le contenu riche */}
          <ArticleContentRenderer content={page.content} />
        </main>
      </div>
    </div>
  );
}