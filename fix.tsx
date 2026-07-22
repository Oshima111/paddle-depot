import { useMemo, useState } from "react";
import { products } from "../data/products";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  searchQuery: string;
}

const BRAND_ORDER = ["All", "Selkirk", "JOOLA", "Honolulu", "WIKA", "Sypik", "Friday", "RPM"];

export default function ProductGrid({ searchQuery }: ProductGridProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>("All");

  const brands = useMemo(() => {
    const brandSet = new Set(products.map((p) => p.brand));
    return BRAND_ORDER.filter((b) => b === "All" || brandSet.has(b));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBrand =
        selectedBrand === "All" || p.brand === selectedBrand;

      return matchesSearch && matchesBrand;
    });
  }, [searchQuery, selectedBrand]);

  const featured = useMemo(() => filtered.filter((p) => p.featured), [filtered]);
  const regular = useMemo(() => filtered.filter((p) => !p.featured), [filtered]);

  return (
    <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Our Paddle Collection</h2>
        <p className="mt-2 text-gray-500 max-w-xl mx-auto">Find the perfect paddle for your playing style, from beginner to pro.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => setSelectedBrand(brand)}
            className={~px-4 py-2 rounded-full text-sm font-medium transition ~~}
          >
            {brand}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-400 mb-4 text-center">
        {filtered.length} paddle{filtered.length !== 1 ? "s" : ""} found
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-600">No paddles found</h3>
          <p className="text-gray-400 mt-1">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {featured.length > 0 && (
            <div id="featured">
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-800">Featured Paddles</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
          )}

          {regular.length > 0 && (
            <div>
              {featured.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 11.625l2.25-2.25M12 11.625l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-800">All Paddles</h3>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {regular.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
          )}
        </div>
      )}
    </section>
  );
}
