// src/components/ArticleContentRenderer.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { JSX } from 'react/jsx-runtime';

interface LexicalUploadNodeValue {
  id: string;
  url?: string;
  alt?: string;
  filename?: string;
  width?: number;
  height?: number;
  caption?: any; 
}

interface LexicalUploadNodeInstanceFields {
  alt?: string;
  caption?: any;
}

interface ArticleContentRendererProps {
  content: any; 
}

// Interface pour les données du document lié dans un nœud 'relationship'
interface LexicalRelationshipNodeValue {
  id: string | number;
  slug?: string; // Le slug du document lié
  // Essayons d'être générique pour le "nom à afficher"
  // Payload stocke souvent le champ utilisé comme 'useAsTitle' de la collection liée,
  // ou des champs communs comme 'nom', 'nomPrincipal', 'nomComplet'.
  // Nous allons essayer de les trouver.
  nom?: string;           // Pour Personnalites, Verriers si vous avez un champ 'nom' simple
  nomComplet?: string;    // Pour Personnalites, Verriers
  nomPrincipal?: string;  // Pour Verreries
  // Ajoutez d'autres champs potentiels que vous voudriez utiliser comme texte de lien
}

const ArticleContentRenderer: React.FC<ArticleContentRendererProps> = ({ content }) => {
  const payloadBaseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';

  if (!content || !content.root || !content.root.children || content.root.children.length === 0) {
    // Si vous préférez ne rien afficher plutôt qu'un message, retournez null
    // return <p className="italic text-blueGray-500">Contenu non disponible.</p>;
    return null; 
  }

  const renderNodes = (nodes: any[], parentKey: string = 'acr-node'): (JSX.Element | string | null)[] => {
    if (!nodes || nodes.length === 0) { // Sécurité supplémentaire
      return [];
    }
    return nodes.map((node, index) => {
      const key = `${parentKey}-${node.type || 'unknown'}-${index}-${node.id || Math.random().toString(36).substring(2, 9)}`;

      if (node.type === 'paragraph') {
        const children = node.children ? renderNodes(node.children, `${key}-p`) : [];
        if (children.length === 0 || children.every(child => typeof child === 'string' && child.trim() === '')) {
          // Si le paragraphe est le dernier de son parent (ou s'il n'y a que des paragraphes vides), 
          // on peut retourner null. S'il est suivi d'autres contenus, un <br /> ou <p className="h-4" /> (pour un saut de ligne) 
          // pourrait être nécessaire pour préserver l'espacement voulu par plusieurs <p> vides successifs.
          // Pour l'instant, on omet les paragraphes sémantiquement vides.
          return null;
        }
        return <p key={key} className="mb-4 last:mb-0">{children}</p>;
      }

      if (node.type === 'heading') {
        const Tag = node.tag as keyof JSX.IntrinsicElements;
        const children = node.children ? renderNodes(node.children, `${key}-h`) : [];
        return <Tag key={key} className={`font-serif text-blueGray-800 ${
          node.tag === 'h1' ? 'text-4xl font-bold my-6' : 
          node.tag === 'h2' ? 'text-3xl font-semibold my-5' : 
          node.tag === 'h3' ? 'text-2xl font-semibold my-4' : 
          node.tag === 'h4' ? 'text-xl font-medium my-3' : 
          'text-lg my-2' // h5, h6
        }`}>{children}</Tag>;
      }

      if (node.type === 'list') {
        const ListTag = node.tag === 'ol' ? 'ol' : 'ul';
        const children = node.children ? renderNodes(node.children, `${key}-l`) : [];
        return <ListTag key={key} className={`pl-6 mb-4 ${ListTag === 'ol' ? 'list-decimal' : 'list-disc'}`}>{children}</ListTag>;
      }

      if (node.type === 'listitem') {
        const children = node.children ? renderNodes(node.children, `${key}-li`) : [];
        return <li key={key} className="mb-1">{children}</li>;
      }
      
      if (node.type === 'quote') {
        // Les enfants d'une citation sont souvent des nœuds texte, mais peuvent être des paragraphes.
        // Notre renderNodes gérera cela récursivement.
        const children = node.children ? renderNodes(node.children, `${key}-q`) : [];
        return (
          <blockquote key={key} className="border-l-4 border-gold pl-4 pr-2 py-2 my-4 italic text-blueGray-600 bg-gold bg-opacity-10"> {/* bg-opacity-10 pour un fond léger */}
            {children}
          </blockquote>
        );
      }

      if (node.type === 'upload' && node.relationTo === 'media') {
        const imageData = node.value as LexicalUploadNodeValue | null;
        const fieldsOverride = node.fields as LexicalUploadNodeInstanceFields | null; // Votre JSON montre fields: null

        if (imageData && imageData.url) {
          const imageUrl = imageData.url.startsWith('http') ? imageData.url : `${payloadBaseUrl}${imageData.url}`;
          // Priorité à l'alt text de l'instance, puis celui du média, puis le nom de fichier
          const altText = fieldsOverride?.alt || imageData.alt || imageData.filename || "Image illustrative";
          // Pour la légende, priorité à celle de l'instance, puis celle du média.
          // Votre JSON pour 'upload' n'a pas de 'caption' dans 'fields' ou 'value'.
          // Si votre collection 'media' a un champ 'caption', il serait dans imageData.caption
          const captionData = fieldsOverride?.caption || imageData.caption; 

          const imageWidth = typeof imageData.width === 'number' && imageData.width > 0 ? imageData.width : undefined;
          const imageHeight = typeof imageData.height === 'number' && imageData.height > 0 ? imageData.height : undefined;
          // Calculer l'aspect ratio pour le conteneur, ou utiliser des dimensions fixes/max
          const aspectRatio = imageWidth && imageHeight ? `${imageWidth}/${imageHeight}` : 'auto'; // 'auto' ou un fallback comme '16/9'

          return (
            <figure key={key} className="my-6 mx-auto max-w-xl group">
              <div 
                className="relative w-full rounded-lg overflow-hidden shadow-md border border-blueGray-200" 
                style={{ aspectRatio: aspectRatio, height: aspectRatio === 'auto' ? (imageHeight || 'auto') : undefined }} // Gérer la hauteur si pas d'aspect ratio
              >
                <Image
                  src={imageUrl}
                  alt={altText}
                  fill // 'fill' est pratique si le parent a des dimensions ou un aspect-ratio
                  className="object-contain" // 'object-contain' pour voir toute l'image
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 600px"
                />
              </div>
              {captionData && (
                <figcaption className="mt-2 text-sm text-center text-blueGray-600 italic font-sans">
                  {typeof captionData === 'object' && captionData.root?.children 
                    ? renderNodes(captionData.root.children, `${key}-caption`)
                    : typeof captionData === 'string' 
                      ? captionData
                      : null}
                </figcaption>
              )}
            </figure>
          );
        }

        /* if (node.type === 'relationship') {
          console.log('[ArticleContentRenderer] Noeud Relationship trouvé:', JSON.stringify(node, null, 2));
          console.log('[ArticleContentRenderer] node.value:', node.value);
          console.log('[ArticleContentRenderer] typeof node.value.id:', typeof node.value?.id); // Utiliser optional chaining
          console.log('[ArticleContentRenderer] node.relationTo:', node.relationTo);
        } */
          
        // --- GESTION DES RELATIONS (node.type === 'relationship') ---
        if (node.type === 'relationship' && node.value && typeof node.value.id !== 'undefined' && node.relationTo) {
          const relatedDocData = node.value as LexicalRelationshipNodeValue;
          const collectionSlug = node.relationTo; // ex: "personnalites", "verreries"

          // Déterminer le texte à afficher pour le lien
          const displayText = relatedDocData.nomComplet || relatedDocData.nomPrincipal || relatedDocData.nom || `[${collectionSlug} ID: ${relatedDocData.id}]`;
          
          // Construire le lien si on a un slug
          if (relatedDocData.slug) {
            const href = `/${collectionSlug}/${relatedDocData.slug}`;
            return (
              <Link key={key} href={href} className="text-gold hover:text-gold-dark underline decoration-gold hover:decoration-gold-dark transition-colors">
                {displayText}
              </Link>
            );
          } else {
            // Fallback si pas de slug, afficher le texte mais pas comme un lien cliquable
            // ou un lien basé sur l'ID si vos URL le supportent (moins courant)
            return (
              <span key={key} title={`Relation vers ${collectionSlug} ID: ${relatedDocData.id}`}>
                {displayText} (Lien non disponible)
              </span>
            );
          }
        }
        // --- FIN GESTION RELATIONS ---

        return null;
      }

      if (node.type === 'link') {
        const childrenContent = node.children ? renderNodes(node.children, `${key}-a`) : [''];
        const linkClasses = "text-gold hover:text-gold-dark underline decoration-gold hover:decoration-gold-dark";
        // ... (votre logique de lien existante)
        const linkType = node.fields?.linkType;
        const doc = node.fields?.doc;
        const url = node.fields?.url;
        const newTab = node.fields?.newTab;

        if (linkType === 'internal' && doc?.value && typeof doc.value === 'object' && doc.value !== null && doc.value.slug && doc.relationTo) {
          const href = `/${doc.relationTo}/${doc.value.slug}`;
          return <Link key={key} href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined} className={linkClasses}>{childrenContent}</Link>;
        } else if (linkType === 'custom' && url) {
          return <a key={key} href={url} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined} className={linkClasses}>{childrenContent}</a>;
        }
        // Fallback pour les enfants de lien si le lien lui-même n'est pas valide
        return <span key={key}>{childrenContent}</span>;
      }

      if (node.type === 'text') {
        let currentTextNode: React.ReactNode = node.text;
        if ((node.format & 16) !== 0) currentTextNode = <s key={`${key}-s`}>{currentTextNode}</s>;
        if ((node.format & 8) !== 0) currentTextNode = <code key={`${key}-code`} className="bg-blueGray-100 text-blueGray-700 px-1 rounded text-sm font-mono">{currentTextNode}</code>;
        if ((node.format & 4) !== 0) currentTextNode = <u key={`${key}-u`}>{currentTextNode}</u>;
        if ((node.format & 2) !== 0) currentTextNode = <em key={`${key}-em`}>{currentTextNode}</em>;
        if ((node.format & 1) !== 0) currentTextNode = <strong key={`${key}-strong`}>{currentTextNode}</strong>;
        return <React.Fragment key={key}>{currentTextNode}</React.Fragment>;
      }

      if (node.type === 'linebreak') {
        return <br key={key} />;
      }
      
      // Si c'est un nœud racine ou un autre type de nœud conteneur non explicitement géré mais avec des enfants
      if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        // Ne pas logguer pour le type 'root' qui est normal ici
        if (node.type !== 'root') {
          console.warn("[ArticleContentRenderer] Type de nœud non stylé spécifiquement mais avec enfants:", node.type, node);
        }
        return <React.Fragment key={key}>{renderNodes(node.children, `${key}-fallback`)}</React.Fragment>;
      }
      
      // Si le nœud a du texte mais n'est pas de type 'text' (peu probable pour Lexical JSON structuré)
      if (node.text) {
        return node.text;
      }

      // Si le nœud est d'un type inconnu et n'a ni enfants ni texte, ou si c'est un paragraphe vide déjà filtré.
      if (node.type !== 'root') { // Ne pas logguer le noeud root lui-même s'il est vide après que ses enfants aient retourné null
         // console.log("[ArticleContentRenderer] Nœud ignoré ou vide:", node.type, node);
      }
      return null;
    }).filter(item => item !== null && (typeof item !== 'string' || item.trim() !== ''));
  };

  const renderedNodes = renderNodes(content.root.children, 'root-acr');
  
  if (renderedNodes.length === 0) {
      return <p className="italic text-blueGray-500">Contenu non disponible.</p>;
  }

  return <>{renderedNodes}</>;
};

export default ArticleContentRenderer;