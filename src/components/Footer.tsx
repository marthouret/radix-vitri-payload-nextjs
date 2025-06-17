// src/components/Footer.tsx
import React from 'react';
import Link from 'next/link';
import type { Page } from '@/payload-types';

// Cette fonction va chercher les pages à afficher dans le footer depuis Payload
async function getFooterPages(): Promise<Page[]> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    // On récupère toutes les pages, avec tous leurs champs peuplés (impossible de récupérer seulement les champs title et slug)
    const response = await fetch(`${payloadUrl}/api/pages?limit=10&depth=0`, { cache: 'no-store' });
    if (!response.ok) {
        console.error(`[getFooterPages] Erreur API (${response.status}): ${await response.text()}`);
        return [];
    }
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des pages pour le footer:", error);
    return [];
  }
}

const Footer = async () => {
  const footerPages = await getFooterPages();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-blueGray-800 text-blueGray-300 mt-auto pt-8 pb-6"> {/* mt-auto pour le pousser en bas */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">&copy; {currentYear} Radix Vitri. Tous droits réservés.</p>
          </div>
          {footerPages.length > 0 && (
            <nav>
              <ul className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 text-sm list-none">
                {footerPages.map(page => (
                  <li key={page.id}>
                    <Link href={`/${page.slug}`} className="text-blueGray-300 hover:text-gold transition-colors hover:underline no-underline">
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;