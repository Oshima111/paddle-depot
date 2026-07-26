import { useMemo, useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import QuickViewModal from "./QuickViewModal";
import { brandsData } from "./brands";
import AnimatedSectionTitle from "./AnimatedSectionTitle";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Product, ProductVariant } from "../data/products";
import { products as localProducts } from "../data/products";

const BRAND_ORDER = ["All", "RPM", "CRBN", "JOOLA", "Honolulu", "Franklin", "Kamito", "Selkirk", "Bread and Butter", "Gearbox", "Sypik", "Luzz", "Friday"];

interface ProductGridProps {
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
}

export default function ProductGrid({ selectedBrand, setSelectedBrand }: ProductGridProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
const [priceRange, setPriceRange] = useState({ min: 0, max: 99999 });
  const [selectedStock] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<typeof products[0] | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);

      if (!isSupabaseConfigured) {
        setProducts(localProducts);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

if (error || !data || data.length === 0) {
        // If Supabase is unavailable or has no data, use the local product data
        if (error) console.error('Supabase error, falling back to local data:', error);
        setProducts(localProducts);
      } else {
        // Fetch variants for each product and attach them
        const productIds = data.map(p => p.id);
        const { data: allVariants, error: variantsError } = await supabase
          .from('product_variants')
          .select('*')
          .in('product_id', productIds)
          .order('id');

        if (variantsError) {
          console.error('Error fetching variants:', variantsError);
          setProducts(data as Product[]); // Fallback to products without variants
        } else {
          const variantsByProductId = (allVariants || []).reduce((acc, v) => {
            if (!acc[v.product_id]) acc[v.product_id] = [];
            acc[v.product_id].push(v);
            return acc;
          }, {} as Record<number, ProductVariant[]>);

          const productsWithVariants = data.map(p => ({
            ...p,
            variants: variantsByProductId[p.id] || [],
          }));
          setProducts(productsWithVariants as Product[]);
        }
      }
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileFiltersOpen]);

  const brands = useMemo(() => {
    const brandSet = new Set(products.map((p) => p.brand));
    return BRAND_ORDER.filter((b) => b === "All" || brandSet.has(b));
  }, [products]);

  const sortedProducts = useMemo(() => {
    let filteredProducts = products.filter((p) => {
      const stockStatus = p.stockStatus || p.stock_status || "In Stock";

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
        selectedStock.length === 0 || selectedStock.includes(stockStatus);

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
  }, [searchQuery, selectedBrand, priceRange, selectedStock, sortBy, products]);

  const featuredPaddles = useMemo(() => products.filter(p => p.featured).slice(0, 4), [products]);
  const newArrivals = useMemo(() => products.slice(0, 8), [products]); // Assuming newest are at the top

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedBrand("All");
    setPriceRange({ min: 0, max: 99999 });
  };

  return (
    <>
      {/* Featured Paddles Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <AnimatedSectionTitle>Featured Paddles</AnimatedSectionTitle>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredPaddles.map((product) => (
              <ProductCard key={`featured-${product.id}`} product={product} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Brand Section */}
      <section id="brands" className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <AnimatedSectionTitle>Shop by Brand</AnimatedSectionTitle>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
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
            <AnimatedSectionTitle>New Arrivals</AnimatedSectionTitle>
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
            <AnimatedSectionTitle>All Paddles</AnimatedSectionTitle>
          </div>

          {/* Filters */}
          <div className="mb-8 hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center p-4 bg-white rounded-lg border border-gray-200/80">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
              </div>
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 bg-gray-50 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition" />
            </div>
            {/* Brand Filter */}
            <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className="w-full py-2.5 border border-gray-300 bg-gray-50 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition">
              {brands.map(b => <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>)}
            </select>
            {/* Price Filter (simplified for catalog) */}
            <select value={`${priceRange.min}-${priceRange.max}`} onChange={e => setPriceRange({ min: Number(e.target.value.split('-')[0]), max: Number(e.target.value.split('-')[1]) || 99999 })} className="w-full py-2.5 border border-gray-300 bg-gray-50 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition">
              <option value="0-99999">All Prices</option>
              <option value="0-10000">Under ₱10,000</option>
              <option value="10000-15000">₱10,000 - ₱15,000</option>
              <option value="15000-99999">Over ₱15,000</option>
            </select>
            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full py-2.5 border border-gray-300 bg-gray-50 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition">
              <option value="featured">Sort by: Featured</option>
              <option value="price-asc">Sort by: Price Low-High</option>
              <option value="price-desc">Sort by: Price High-Low</option>
              <option value="name-asc">Sort by: Name A-Z</option>
            </select>
          </div>

          {/* Mobile Filter Button */}
          <div className="md:hidden mb-6">
            <button onClick={() => setMobileFiltersOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-300 rounded-lg font-semibold text-gray-800">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" /></svg>
              Filter & Sort
            </button>
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

        {/* Mobile Filter Drawer */}
        <div className={`fixed inset-0 z-[100] md:hidden transition-opacity ${mobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)}></div>
          <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-6 transition-transform duration-300 ease-in-out ${mobileFiltersOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Filter & Sort</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2 -mr-2" aria-label="Close filters">
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">Sort by</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full py-2.5 border border-gray-300 bg-gray-50 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition">
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">Brand</label>
                <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className="w-full py-2.5 border border-gray-300 bg-gray-50 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition">
                  {brands.map(b => <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">Price</label>
                <select onChange={e => setPriceRange({ min: Number(e.target.value.split('-')[0]), max: Number(e.target.value.split('-')[1]) || 99999 })} className="w-full py-2.5 border border-gray-300 bg-gray-50 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition">
                  <option value="0-99999">All Prices</option>
                  <option value="0-10000">Under ₱10,000</option>
                  <option value="10000-15000">₱10,000 - ₱15,000</option>
                  <option value="15000-99999">Over ₱15,000</option>
                </select>
              </div>
              <button onClick={() => setMobileFiltersOpen(false)} className="w-full py-3 mt-4 bg-emerald-600 text-white font-semibold rounded-lg">
                Done
              </button>
            </div>
          </div>
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
