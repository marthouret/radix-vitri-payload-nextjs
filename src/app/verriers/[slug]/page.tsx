// src/app/verriers/[slug]/page.tsx
import { notFound } from 'next/navigation';
import React from 'react';
// NOUVEL IMPORT (ou vérification que le chemin est bon)
import ArticleContentRenderer from '@/components/ArticleContentRenderer'; 

// --- Définitions des Interfaces ---
interface LieuType {
  id: string;
  nomDuLieu?: string;
  adresse?: string;
  villeOuCommune?: string;
  codePostal?: string;
  departement?: string;
  region?: string;
  pays?: string;
  coordonnees?: [number, number];
  nomCompletAffichage?: string;
  slug?: string;
}

interface VerrierFromAPI {
  id: string;
  nom?: string;
  prenom?: string;
  nomComplet?: string;
  slug?: string;
  dateDeNaissance?: string;
  lieuDeNaissance?: LieuType | string;
  dateDeDeces?: string;
  lieuDeDeces?: LieuType | string;
  periodePrincipaleActivite?: string;
  specialisation?: string;
  notesBiographie?: any; // C'est le contenu RichText (Lexical JSON)
}

interface VerrierPageProps {
  params: { slug: string };
}

const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';

// --- Fonctions Utilitaires ---
const formatDateForDisplay = (dateString?: string | null): string => {
  // ... (votre code existant pour formatDateForDisplay)
  if (!dateString) return 'Date inconnue';
  if (isNaN(new Date(dateString).getTime()) && dateString.match(/\D/)) {
    return dateString;
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      const yearMatch = dateString.match(/\d{4}/);
      if (yearMatch) return yearMatch[0];
      return dateString;
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (_e) {
    return dateString;
  }
};

const displayLieu = (lieu: LieuType | string | undefined | null): React.ReactNode => {
  // ... (votre code existant pour displayLieu)
  if (!lieu) return <span className="italic">Non renseigné</span>;
  if (typeof lieu === 'string') return <span className="italic">Lieu (ID: {lieu})</span>;
  return <>{lieu.nomCompletAffichage || lieu.villeOuCommune || `ID: ${lieu.id}`}</>;
};

// --- Fonctions de Récupération de Données ---
async function fetchFullLieu(id: string): Promise<LieuType | null> {
  // ... (votre code existant pour fetchFullLieu, avec la correction de l'URL)
  try {
    const apiUrl = `${payloadUrl}/api/lieux/${id}?depth=0`; // Correction ici
    const response = await fetch(apiUrl, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`Erreur API Payload pour Lieu ID ${id} (${response.status}): ${await response.text()}`);
      return null;
    }
    return await response.json() as LieuType;
  } catch (error) {
    console.error(`[fetchFullLieu] Exception pour Lieu ID ${id}:`, error);
    return null;
  }
}

async function getVerrier(slug: string): Promise<VerrierFromAPI | null> {
  // ... (votre code existant pour getVerrier)
  try {
    const apiUrl = `${payloadUrl}/api/verriers?where[slug][equals]=${slug}&depth=1&limit=1`;
    const response = await fetch(apiUrl, { cache: 'no-store' });

    if (!response.ok) {
      console.error(`Erreur API Payload pour verrier (${response.status}): ${await response.text()}`);
      return null;
    }
    const data = await response.json();
    if (!data.docs || data.docs.length === 0) {
      console.warn(`[getVerrier] Aucun verrier trouvé pour le slug: ${slug}`);
      return null;
    }
    const verrier = data.docs[0] as VerrierFromAPI;

    if (verrier.lieuDeNaissance && typeof verrier.lieuDeNaissance === 'string') {
      const lieuDetails = await fetchFullLieu(verrier.lieuDeNaissance);
      if (lieuDetails) verrier.lieuDeNaissance = lieuDetails;
    }
    if (verrier.lieuDeDeces && typeof verrier.lieuDeDeces === 'string') {
      const lieuDetails = await fetchFullLieu(verrier.lieuDeDeces);
      if (lieuDetails) verrier.lieuDeDeces = lieuDetails;
    }
    return verrier;
  } catch (error) {
    console.error("[getVerrier]", error);
    return null;
  }
}

// SUPPRESSION de la définition locale de ArticleContentRenderer ici


// --- Composant de Page ---
export default async function VerrierPage({ params }: VerrierPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const verrier = await getVerrier(slug);

  if (!verrier) {
    notFound();
  }
  const nomCompletAffichage = verrier.nomComplet || `${verrier.prenom || ''} ${verrier.nom || ''}`.trim() || 'Verrier Inconnu';

  return (
    // ... (votre JSX existant, qui utilise déjà ArticleContentRenderer pour verrier.notesBiographie)
    // Assurez-vous que l'appel à <ArticleContentRenderer content={verrier.notesBiographie} />
    // utilise bien le composant importé.
    <div className="bg-cream text-blueGray-700 font-serif min-h-screen">
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <header className="mb-10 md:mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blueGray-800 mb-2 tracking-tight">
            {nomCompletAffichage}
          </h1>
          {verrier.specialisation && (
            <p className="text-2xl text-gold font-sans mt-1">{verrier.specialisation}</p>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-12 gap-y-10">
          <main className="lg:col-span-2 space-y-12">
            {verrier.notesBiographie && Object.keys(verrier.notesBiographie).length > 0 ? (
              <section id="biographie" className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-blueGray-800 prose-a:text-gold prose-strong:text-blueGray-800 prose-blockquote:border-gold prose-blockquote:text-blueGray-600">
                <h2 className="text-3xl !mb-6 !border-b-2 !border-blueGray-200 !pb-3">Biographie</h2>
                <ArticleContentRenderer content={verrier.notesBiographie} /> {/* Cet appel utilisera l'import */}
              </section>
            ) : (
              <p className="italic text-blueGray-500">Aucune note biographique disponible pour ce verrier.</p>
            )}
          </main>

          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              <div className="bg-white p-6 rounded-xl shadow-xl border border-blueGray-100">
                <h3 className="text-2xl font-semibold text-blueGray-800 mb-5 font-serif">Informations</h3>
                <dl className="space-y-3 text-blueGray-600 font-sans">
                  {nomCompletAffichage && (
                     <div>
                      <dt className="font-medium text-blueGray-500">Nom complet :</dt>
                      <dd className="ml-1">{nomCompletAffichage}</dd>
                    </div>
                  )}
                  {verrier.dateDeNaissance && (
                    <div>
                      <dt className="font-medium text-blueGray-500">Né(e) le :</dt>
                      <dd className="ml-1">{formatDateForDisplay(verrier.dateDeNaissance)}</dd>
                    </div>
                  )}
                  {(verrier.lieuDeNaissance || typeof verrier.lieuDeNaissance === 'object') && (
                    <div>
                      <dt className="font-medium text-blueGray-500">À :</dt>
                      <dd className="ml-1">{displayLieu(verrier.lieuDeNaissance)}</dd>
                    </div>
                  )}
                  {verrier.dateDeDeces && (
                    <div className="mt-3">
                      <dt className="font-medium text-blueGray-500">Décédé(e) le :</dt>
                      <dd className="ml-1">{formatDateForDisplay(verrier.dateDeDeces)}</dd>
                    </div>
                  )}
                  {(verrier.lieuDeDeces || typeof verrier.lieuDeDeces === 'object') && (
                    <div>
                      <dt className="font-medium text-blueGray-500">À :</dt>
                      <dd className="ml-1">{displayLieu(verrier.lieuDeDeces)}</dd>
                    </div>
                  )}
                  {verrier.periodePrincipaleActivite && (
                     <div>
                      <dt className="font-medium text-blueGray-500">Période d&apos;activité :</dt>
                      <dd className="ml-1">{verrier.periodePrincipaleActivite}</dd>
                    </div>
                  )}
                   {verrier.specialisation && (
                     <div>
                      <dt className="font-medium text-blueGray-500">Spécialisation :</dt>
                      <dd className="ml-1">{verrier.specialisation}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}