// src/app/personnalites/[slug]/page.tsx

import React from 'react';
import { notFound } from 'next/navigation';
import { JSX } from 'react/jsx-runtime';
import Link from 'next/link'; 
import ArticleContentRenderer from '@/components/ArticleContentRenderer'; 
// Importer les options partagées
import { rolePrincipalOptions } from '@/config/selectOptions'; 

// --- Définitions des Interfaces ---
interface MediaItem { 
  id: string; 
  url?: string; 
  filename?: string; 
  alt?: string; 
}

interface PersonnaliteDetailType {
  id: string | number;
  nom?: string; 
  prenom?: string;
  nomComplet?: string; 
  rolePrincipal?: string; // La valeur stockée, ex: "maitre_verrier"
  slug?: string; 
  dateDeNaissance?: string | null; 
  lieuDeNaissance?: string | null;
  dateDeDeces?: string | null;   
  lieuDeDeces?: string | null;
  biographie?: any; 
}

interface PersonnalitePageProps {
  params: {
    slug: string;
  };
}

// --- Fonctions Utilitaires ---
const formatDateForDisplay = (dateString?: string | null): string => {
  if (!dateString) return 'Date inconnue';
  // Si c'est déjà une description textuelle (ex: "vers 1850", "actif en 1780")
  if (isNaN(new Date(dateString).getTime()) && dateString.match(/\D/)) {
    return dateString;
  }
  // Si c'est une date parsable ou juste une année
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) { // Si toujours pas valide après new Date()
      const yearMatch = dateString.match(/\d{4}/);
      if (yearMatch) return yearMatch[0]; // Juste l'année
      return dateString; // Retourne la chaîne originale
    }
    // Pour un affichage plus lisible (ex: 12 mars 1850)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) {
    return dateString; // Fallback
  }
};

// Fonction pour obtenir le label de rolePrincipal (utilise les options importées)
const getRolePrincipalLabel = (value?: string): string => {
  if (!value) return 'Rôle non spécifié';
  const option = rolePrincipalOptions.find(opt => opt.value === value);
  return option ? option.label : value; // Retourne la valeur brute si le label n'est pas trouvé
};

// Composant pour le RichText (Biographie)
/*
const ArticleContentRenderer: React.FC<{ content: any }> = ({ content }) => {
  if (!content || !content.root || !content.root.children) {
    return <p className="italic text-blueGray-500">Biographie non disponible.</p>;
  }
  const renderNodes = (nodes: any[], parentKey: string = 'bio-node'): (JSX.Element | string)[] => {
    return nodes.map((node, index) => {
      const key = `${parentKey}-${node.type || 'unknown'}-${index}-${node.format || ''}-${Math.random().toString(36).substr(2, 5)}`;
      if (node.type === 'paragraph') {
        return <p key={key} className="mb-4 last:mb-0">{renderNodes(node.children || [], key)}</p>;
      }
      if (node.type === 'heading') {
        const Tag = node.tag as keyof JSX.IntrinsicElements;
        return <Tag key={key}>{renderNodes(node.children || [], key)}</Tag>;
      }
      if (node.type === 'list') {
        const ListTag = node.tag === 'ol' ? 'ol' : 'ul';
        return <ListTag key={key} className={ListTag === 'ol' ? 'list-decimal pl-5 mb-4' : 'list-disc pl-5 mb-4'}>{renderNodes(node.children || [], key)}</ListTag>;
      }
      if (node.type === 'listitem') {
        return <li key={key} className="mb-1">{renderNodes(node.children || [], key)}</li>;
      }
      if (node.type === 'link') {
        const linkType = node.fields?.linkType;
        const doc = node.fields?.doc;
        const url = node.fields?.url;
        const newTab = node.fields?.newTab;
        const childrenContent = renderNodes(node.children || [], key);

        if (linkType === 'internal' && doc?.value && typeof doc.value === 'object' && doc.value !== null && doc.value.slug) {
          const href = `/${doc.relationTo}/${doc.value.slug}`;
          return <Link key={key} href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined} className="text-gold hover:text-gold-dark underline">{childrenContent}</Link>;
        } else if (linkType === 'custom' && url) {
          return <a key={key} href={url} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined} className="text-gold hover:text-gold-dark underline">{childrenContent}</a>;
        }
        return <React.Fragment key={key}>{childrenContent}</React.Fragment>;
      }
      if (node.type === 'text') {
        let textElement: JSX.Element | string = <React.Fragment key={`text-${key}`}>{node.text}</React.Fragment>;
        if (node.format === 1) textElement = <strong key={`strong-${key}`}>{textElement}</strong>;
        if (node.format === 2) textElement = <em key={`em-${key}`}>{textElement}</em>;
        if (node.format === 8) textElement = <code key={`code-${key}`}>{textElement}</code>;
        return textElement;
      }
      if (node.type === 'linebreak') { return <br key={key} />; }
      return node.text || ''; 
    }).filter(item => item !== null && item !== ''); 
  };
  return <>{renderNodes(content.root.children, 'root')}</>;
}; */

// --- Fonction de Récupération des Données ---
const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';

async function getPersonnalite(slug: string): Promise<PersonnaliteDetailType | null> { 
  try {
    const apiUrl = `${payloadUrl}/api/personnalites?where[slug][equals]=${slug}&depth=1&locale=fr&fallback-locale=fr&limit=1`;
    const response = await fetch(apiUrl, { cache: 'no-store' }); 
    if (!response.ok) { 
      console.error(`[getPersonnalite] Erreur API Payload (${response.status}): ${await response.text()}`);
      throw new Error(`Failed to fetch personnalite: ${response.status}`); 
    }
    const data = await response.json(); 
    if (data.docs && data.docs.length > 0) {
      return data.docs[0] as PersonnaliteDetailType;
    } else {
      console.warn(`[getPersonnalite] Aucune personnalité trouvée pour le slug: ${slug}`);
      return null;
    }
  } catch (error) { 
    console.error("[getPersonnalite]", error); 
    return null; 
  }
}

// --- Composant de Page ---
export default async function PersonnalitePage({ params }: PersonnalitePageProps) {
  const resolvedParams = await params; 
  const { slug } = resolvedParams; 
  const personnalite = await getPersonnalite(slug);

  if (!personnalite) {
    notFound(); 
  }
  
  const nomCompletAffichage = personnalite.nomComplet || `${personnalite.prenom || ''} ${personnalite.nom || ''}`.trim() || 'Personnalité Inconnue';

  return (
    <div className="bg-cream text-blueGray-700 font-serif min-h-screen"> 
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12"> 
        <header className="mb-10 md:mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blueGray-800 mb-2 tracking-tight">
            {nomCompletAffichage}
          </h1>
          {personnalite.rolePrincipal && (
            <p className="text-2xl text-gold font-sans mt-1">{getRolePrincipalLabel(personnalite.rolePrincipal)}</p>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-12 gap-y-10">
          <main className="lg:col-span-2 space-y-12">
            {personnalite.biographie && (
              <section id="biographie" className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-blueGray-800 prose-a:text-gold prose-strong:text-blueGray-800 prose-blockquote:border-gold prose-blockquote:text-blueGray-600">
                <h2 className="text-3xl !mb-6 !border-b-2 !border-blueGray-200 !pb-3">Biographie</h2>
                <ArticleContentRenderer content={personnalite.biographie} />
              </section>
            )}
          </main>

          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              <div className="bg-white p-6 rounded-xl shadow-xl border border-blueGray-100">
                <h3 className="text-2xl font-semibold text-blueGray-800 mb-5 font-serif">Informations Personnelles</h3>
                <dl className="space-y-3 text-blueGray-600 font-sans">
                  {personnalite.dateDeNaissance && (
                    <div>
                      <dt className="font-medium text-blueGray-500">Né(e) le :</dt>
                      <dd className="ml-1">{formatDateForDisplay(personnalite.dateDeNaissance)}</dd>
                    </div>
                  )}
                  {personnalite.lieuDeNaissance && (
                    <div>
                      <dt className="font-medium text-blueGray-500">À :</dt>
                      <dd className="ml-1">{personnalite.lieuDeNaissance}</dd>
                    </div>
                  )}
                  {personnalite.dateDeDeces && (
                    <div className="mt-3">
                      <dt className="font-medium text-blueGray-500">Décédé(e) le :</dt>
                      <dd className="ml-1">{formatDateForDisplay(personnalite.dateDeDeces)}</dd>
                    </div>
                  )}
                  {personnalite.lieuDeDeces && (
                    <div>
                      <dt className="font-medium text-blueGray-500">À :</dt>
                      <dd className="ml-1">{personnalite.lieuDeDeces}</dd>
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