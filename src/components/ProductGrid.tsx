import { useMemo, useState, useEffect } from "react";
import { products } from "../data/products";
import ProductCard from "./ProductCard";
import QuickViewModal from "./QuickViewModal";
import { brandsData } from "./brands";

const BRAND_ORDER = ["All", "RPM", "CRBN", "JOOLA", "Honolulu", "Franklin", "Kamito", "Selkirk", "Bread and Butter", "Sypik", "Luzz", "Friday"];

interface ProductGridProps {
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
}

export default function ProductGrid({ selectedBrand, setSelectedBrand }: ProductGridProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState(() => {
    const prices = products.map((p) => p.price);
    return { min: 0, max: Math.max(...prices) };
  });
  const [selectedStock] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [quickViewProduct, setQuickViewProduct] = useState<typeof products[0] | null>(null);

  useEffect(() => {
    // Simulate network request
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 750);
    return () => clearTimeout(timer);
  }, []);

  const brands = useMemo(() => {
    const brandSet = new Set(products.map((p) => p.brand));
    return BRAND_ORDER.filter((b) => b === "All" || brandSet.has(b));
  }, []);

  const sortedProducts = useMemo(() => {
    let filteredProducts = products.filter((p) => {
      // Search Query Filter
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());

      // Brand Filter
      const matchesBrand =
        selectedBrand === "All" || p.brand === selectedBrand;

      // Price Filter
      const matchesPrice =
        p.price >= priceRange.min && p.price <= priceRange.max;

      // Stock Status Filter
      const matchesStock =
        selectedStock.length === 0 || selectedStock.includes(p.stockStatus);

      return matchesSearch && matchesBrand && matchesPrice && matchesStock;
    });

    switch (sortBy) {
      case "price-asc":
        return [...filteredProducts].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...filteredProducts].sort((a, b) => b.price - a.price);
      case "name-asc":
        return [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
      case "featured":
      default:
        return [...filteredProducts].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }, [searchQuery, selectedBrand, priceRange, selectedStock, sortBy]);

  const featuredPaddles = useMemo(() => products.filter(p => p.featured).slice(0, 4), []);
  const newArrivals = useMemo(() => products.slice(0, 8), []); // Assuming newest are at the top

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedBrand("All");
    // You could also reset priceRange and selectedStock here if desired
  };

  return (
    <>
      {/* Featured Paddles Section */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Featured Paddles</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredPaddles.map((product) => (
              <ProductCard key={`featured-${product.id}`} product={product} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Brand Section */}
      <section id="brands" className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Shop by Brand</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {brandsData.map((brand) => (
              <a key={brand.name} href="#products" onClick={() => setSelectedBrand(brand.name)} className="group block text-center">
                <div className="h-[120px] sm:h-[140px] bg-white border border-gray-200/80 rounded-xl flex items-center justify-center p-4 overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:border-transparent group-hover:-translate-y-1">
                  <img 
                    src={brand.logoUrl} 
                    alt={`${brand.name} logo`} 
                    className="max-h-[60px] sm:max-h-[70px] max-w-[140px] w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback to hide broken images
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('items-center', 'justify-center');
                      // The brand name is already displayed below, so we just show a placeholder text if image fails
                      e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', `<span class="font-semibold text-gray-500 text-base">${brand.name}</span>`);
                    }}
                  />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">{brand.name}</h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section id="new-arrivals" className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">New Arrivals</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={`new-${product.id}`} product={product} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        </div>
      </section>

      {/* All Paddles Section */}
      <section id="products" className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">All Paddles</h2>
          </div>

          {/* Filters */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
            {/* Search */}
            <div className="relative sm:col-span-2 md:col-span-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
          </div>
          <input
            type="text"
              placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
          />
        </div>
            {/* Brand Filter */}
            <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className="w-full py-2.5 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition">
              {brands.map(b => <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>)}
            </select>
            {/* Price Filter (simplified for catalog) */}
            <select onChange={e => setPriceRange({ min: Number(e.target.value.split('-')[0]), max: Number(e.target.value.split('-')[1]) || 99999 })} className="w-full py-2.5 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition">
              <option value="0-99999">All Prices</option>
              <option value="0-10000">Under ₱10,000</option>
              <option value="10000-15000">₱10,000 - ₱15,000</option>
              <option value="15000-99999">Over ₱15,000</option>
            </select>
            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full py-2.5 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition">
              <option value="featured">Sort by: Featured</option>
              <option value="price-asc">Sort by: Price Low-High</option>
              <option value="price-desc">Sort by: Price High-Low</option>
              <option value="name-asc">Sort by: Name A-Z</option>
            </select>
          </div>

        <main>
          {!isLoading && (
            <p className="text-sm text-gray-500 mb-4 text-center lg:text-left">
              {sortedProducts.length} paddle{sortedProducts.length !== 1 ? "s" : ""} found
            </p>
          )}

          {isLoading ? (
            // Skeleton Loader
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="bg-white rounded-xl p-4">
                  <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="mt-4 h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  <div className="mt-2 h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="mt-2 h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            // Empty State
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <h3 className="text-xl font-semibold text-gray-800">No Paddles Found</h3>
              <p className="text-gray-500 mt-2">Your search and filter combination didn't return any results.</p>
              <button onClick={clearFilters} className="mt-6 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg shadow-sm hover:bg-emerald-700 transition-all transform hover:shadow-md hover:-translate-y-0.5">
                Clear Filters
              </button>
            </div>
          ) : (
            // Product Grid
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
              ))}
            </div>
          )}
        </main>
        </div>
      </section>
    {quickViewProduct && (
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    )}
    </>
  );
}
