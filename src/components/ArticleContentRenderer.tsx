// src/components/ArticleContentRenderer.tsx
import React from 'react';
import Link from 'next/link';
import { JSX } from 'react/jsx-runtime'; // Import JSX si votre configuration le nécessite

interface ArticleContentRendererProps {
  content: any; // Le type Lexical JSON de Payload
}

const ArticleContentRenderer: React.FC<ArticleContentRendererProps> = ({ content }) => {
  if (!content || !content.root || !content.root.children || content.root.children.length === 0) {
    return <p className="italic text-blueGray-500">Contenu non disponible.</p>;
  }

  const renderNodes = (nodes: any[], parentKey: string = 'acr-node'): (JSX.Element | string)[] => {
    return nodes.map((node, index) => {
      const key = `<span class="math-inline">\{parentKey\}\-</span>{node.type || 'unknown'}-<span class="math-inline">\{index\}\-</span>{node.format || ''}-${Math.random().toString(36).substr(2, 9)}`;

      if (node.type === 'paragraph') {
        const children = node.children ? renderNodes(node.children, key) : [];
        // Ne pas rendre les <p> qui seraient visuellement vides
        if (children.every(child => typeof child === 'string' && child.trim() === '')) {
          // Si le paragraphe est le dernier de son parent et est vide, on peut l'omettre.
          // S'il a un frère après lui, on pourrait vouloir un <br> ou un <p>&nbsp;</p> pour garder l'espacement,
          // mais pour l'instant, on omet les paragraphes "vides".
          return null;
        }
        return <p key={key} className="mb-4 last:mb-0">{children}</p>;
      }

      if (node.type === 'heading') {
        const Tag = node.tag as keyof JSX.IntrinsicElements; // ex: h1, h2, etc.
        return <Tag key={key} className={`font-serif text-blueGray-800 ${
          node.tag === 'h1' ? 'text-4xl font-bold my-6' : 
          node.tag === 'h2' ? 'text-3xl font-semibold my-5' : 
          node.tag === 'h3' ? 'text-2xl font-semibold my-4' : 
          node.tag === 'h4' ? 'text-xl font-medium my-3' : 
          'text-lg my-2' // h5, h6 ou défaut
        }`}>{renderNodes(node.children || [], key)}</Tag>;
      }

      if (node.type === 'list') {
        const ListTag = node.tag === 'ol' ? 'ol' : 'ul'; // ol ou ul
        return <ListTag key={key} className={`pl-5 mb-4 ${ListTag === 'ol' ? 'list-decimal' : 'list-disc'}`}>{renderNodes(node.children || [], key)}</ListTag>;
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
        const linkClasses = "text-gold hover:text-gold-dark underline decoration-gold hover:decoration-gold-dark";

        if (linkType === 'internal' && doc?.value && typeof doc.value === 'object' && doc.value !== null && doc.value.slug && doc.relationTo) {
          const href = `/<span class="math-inline">\{doc\.relationTo\}/</span>{doc.value.slug}`;
          return <Link key={key} href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined} className={linkClasses}>{childrenContent}</Link>;
        } else if (linkType === 'custom' && url) {
          return <a key={key} href={url} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined} className={linkClasses}>{childrenContent}</a>;
        }
        // Fallback pour les liens mal formés ou contenu de lien simple
        return <span key={key} className={linkClasses}>{childrenContent}</span>; // ou juste React.Fragment si pas de style par défaut
      }

      if (node.type === 'text') {
        let textElement: JSX.Element | string = <React.Fragment key={`text-${key}`}>{node.text}</React.Fragment>;
        if (node.format === 1) textElement = <strong key={`strong-${key}`}>{textElement}</strong>; // Bold
        if (node.format === 2) textElement = <em key={`em-${key}`}>{textElement}</em>;     // Italic
        if ((node.format & 4) !== 0) textElement = <u key={`u-${key}`}>{textElement}</u>; // Underline
        if ((node.format & 8) !== 0) textElement = <code key={`code-${key}`} className="bg-blueGray-100 text-blueGray-700 px-1 rounded text-sm">{textElement}</code>;   // Code
        if ((node.format & 16) !== 0) textElement = <s key={`s-${key}`}>{textElement}</s>; // Strikethrough
        // Note: Lexical gère `format` comme un bitmask. node.format === 1 (gras), node.format === 2 (italique), node.format === 3 (gras et italique).
        // Pour gérer les combinaisons, il faudrait décomposer le bitmask.
        // L'approche ci-dessus est simplifiée et ne gère pas correctement les combinaisons (gras + italique par ex.).
        // Une approche plus robuste pour les formats combinés serait plus complexe.
        return textElement;
      }

      if (node.type === 'linebreak') {
        return <br key={key} />;
      }

      // Fallback pour les types de nœuds inconnus ou non gérés
      return node.text || ''; // Ou un message d'erreur, ou null
    }).filter(item => item !== null); // Retirer les paragraphes vides rendus comme null
  };

  const renderedNodes = renderNodes(content.root.children, 'root-acr');
  // Vérifier si tous les nœuds de haut niveau sont des chaînes vides ou des nulls après filtrage
  if (renderedNodes.every(node => typeof node === 'string' && node.trim() === '')) {
      return <p className="italic text-blueGray-500">Contenu non disponible.</p>;
  }

  return <>{renderedNodes}</>;
};

export default ArticleContentRenderer;