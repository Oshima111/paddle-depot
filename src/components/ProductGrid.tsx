import { useMemo, useState, useEffect } from "react";
import { products } from "../data/products";
import ProductCard from "./ProductCard";
import QuickViewModal from "./QuickViewModal";

const BRAND_ORDER = ["All", "Selkirk", "JOOLA", "Honolulu", "WIKA", "Sypik", "Friday", "RPM"];

export default function ProductGrid() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [priceRange] = useState(() => {
    const prices = products.map((p) => p.price);
    return { min: 0, max: Math.max(...prices) };
  });
  const [selectedStock] = useState<string[]>([]);
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

  const filtered = useMemo(() => {
    return products.filter((p) => {
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
  }, [searchQuery, selectedBrand, priceRange, selectedStock]);

  const featured = useMemo(() => filtered.filter((p) => p.featured), [filtered]);
  const regular = useMemo(() => filtered.filter((p) => !p.featured), [filtered]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedBrand("All");
    // You could also reset priceRange and selectedStock here if desired
  };

  return (
    <>
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Our Paddle Collection</h2>
          <p className="mt-2 text-gray-500 max-w-xl mx-auto">Find the perfect paddle for your playing style, from beginner to pro.</p>
        </div>

        <div className="mb-8 max-w-lg mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
          </div>
          <input
            type="text"
            placeholder="Search paddles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-shadow"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {brands.map((brand) => (
            <button key={brand} onClick={() => setSelectedBrand(brand)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${ selectedBrand === brand ? "bg-emerald-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm" }`}>
              {brand}
            </button>
          ))}
        </div>

        <main>
          {!isLoading && (
            <p className="text-sm text-gray-500 mb-4 text-center lg:text-left">
              {filtered.length} paddle{filtered.length !== 1 ? "s" : ""} found
            </p>
          )}

          {isLoading ? (
            // Skeleton Loader
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="bg-white rounded-xl border border-gray-200 p-4">
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
          ) : filtered.length === 0 ? (
            // Empty State
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
              <h3 className="text-xl font-semibold text-gray-800">No Paddles Found</h3>
              <p className="text-gray-500 mt-2">Your search and filter combination didn't return any results.</p>
              <button onClick={clearFilters} className="mt-6 px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg shadow-sm hover:bg-emerald-700 transition-all transform hover:shadow-md hover:-translate-y-0.5">
                Clear Filters
              </button>
            </div>
          ) : (
            // Product Grid
            <div className="space-y-12">
              {featured.length > 0 && (
                <div id="featured">
                  <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
                    <h3 className="text-xl font-semibold text-gray-800">Featured Paddles</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {featured.map((product) => (
                      <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                    ))}
                  </div>
                </div>
              )}

              {regular.length > 0 && (
                <div>
                  {featured.length > 0 && (
                    <div className="flex items-center gap-2 mb-6">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 11.625l2.25-2.25M12 11.625l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>
                      <h3 className="text-xl font-semibold text-gray-800">All Paddles</h3>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {regular.map((product) => (
                      <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
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
