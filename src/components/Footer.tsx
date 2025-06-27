import Link from 'next/link'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const navLinks = [
    { id: 1, href: '/verreries', label: 'Les Verreries' },
    { id: 2, href: '/a-propos', label: 'À Propos' },
  ]
  return (
    <footer className="bg-blueGray-800 text-blueGray-300 mt-auto pt-8 pb-6">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">&copy; {currentYear} Radix Vitri. Tous droits réservés.</p>
          </div>
          <nav>
            <ul className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 text-sm list-none">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-blueGray-300 hover:text-gold transition-colors hover:underline no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default Footer
