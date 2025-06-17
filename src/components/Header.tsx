// src/components/Header.tsx
import Link from 'next/link';
import Image from 'next/image'; // Si vous voulez utiliser une version petite de votre logo

const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50"> {/* Fond clair, ombre discrète */}
      <nav className="container mx-auto px-4 py-3 flex items-center no-underline justify-between">
        <Link href="/" className="no-underline" legacyBehavior={false}>
            <div className="flex items-center cursor-pointer">
            {/* Option A: Petit logo image */}
            <Image
              src="/images/radixvitri-logo-transparent.svg" // Version simple du logo
              alt="Radix Vitri - Accueil"
              width={96} // Taille plus petite pour le header
              height={50} // Ajustez au ratio
              className="object-contain " // Peut-être rond ?
            />
          </div>
        </Link>

        {/* Liens de navigation principaux */}
        <div className="space-x-6 font-sans">
          <Link href="/#carte-interactive" className=" text-blueGray-600 hover:text-gold no-underline transition-colors">
            Carte des verreries
          </Link>
          <Link href="/verreries" className=" text-blueGray-600 hover:text-gold no-underline transition-colors">
            Catalogue des verreries
          </Link>
          <Link href="/histoires" className=" text-blueGray-600 hover:text-gold no-underline transition-colors">
            Histoires
          </Link>
          <Link href="/a-propos" className=" text-blueGray-600 hover:text-gold no-underline transition-colors">
            À Propos
          </Link>
          {/* Exemple pour de futurs articles :
          <Link href="/articles" className="text-blueGray-600 hover:text-gold transition-colors">
            Articles
          </Link>
          */}
        </div>
      </nav>
    </header>
  );
};

export default Header;