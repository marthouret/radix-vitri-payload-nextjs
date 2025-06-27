// src/components/Header.tsx
'use client' // On le déclare Client car il a besoin d'état (useState) pour ouvrir/fermer le menu

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Header = () => {
  // État pour gérer l'ouverture/fermeture du menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Fonction pour fermer le menu lors d'un clic sur un lien, pour une meilleure UX mobile
  const closeMenu = () => setIsMobileMenuOpen(false)

  // On définit les liens dans un tableau pour ne pas se répéter
  const navLinks = [
    { href: '/#carte-interactive', label: 'Carte des verreries' },
    { href: '/verreries', label: 'Catalogue' },
    { href: '/histoires', label: 'Histoires' },
    { href: '/a-propos', label: 'À Propos' },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-[9999]">
      <div className="max-w-screen-xl mx-auto px-4 py-3 no-underline">
        <div className="flex h-20 items-center justify-between">
          {/* Logo cliquable qui ferme aussi le menu mobile */}
          <Link href="/" onClick={closeMenu} className="no-underline group shrink-0">
            <div className="flex items-center gap-x-3">
              <Image
                src="/images/radixvitri-logo-transparent.svg"
                alt="Radix Vitri - Accueil"
                width={120}
                height={75}
                className="object-contain h-10 w-auto"
              />
            </div>
          </Link>

          {/* Navigation Desktop : cachée sur mobile, visible sur grand écran (lg) */}
          <nav className="hidden lg:flex lg:gap-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg font-sans leading-6 transition-colors no-underline ${pathname === link.href ? 'text-gold' : 'text-blueGray-600 hover:text-gold'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Bouton Hamburger : visible sur mobile, caché sur grand écran (lg) */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-blueGray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Ouvrir le menu principal"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Panel du Menu Mobile : s'affiche uniquement si isMobileMenuOpen est true */}
      {isMobileMenuOpen && (
        <div className="lg:hidden" id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2 border-t border-blueGray-100">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu} // Ferme le menu quand on clique sur un lien
                className={`block rounded-lg px-3 py-2 text-lg font-sans leading-7 transition-colors no-underline ${pathname === link.href ? 'bg-gold text-white' : 'text-blueGray-700 hover:bg-cream-dark'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
