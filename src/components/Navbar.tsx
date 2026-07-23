const navLinks = [
  { name: "Paddles", href: "#products" },
  { name: "Brands", href: "#brands" },
  { name: "New Arrivals", href: "#new-arrivals" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center gap-2">
            <img src="/paddle-depot-logo.png" alt="Paddle Depot Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">Paddle Depot</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center">
            <a href="#products" className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Search">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
