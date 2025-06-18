import Link from 'next/link';
import type { Page } from '@/payload-types';

const Footer = ({ footerPages }: { footerPages: Page[] }) => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-blueGray-800 text-blueGray-300 mt-auto pt-8 pb-6">
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