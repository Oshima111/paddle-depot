import type { Product } from "../data/products";

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

const PESO_SIGN = "\u20B1";

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const stockColors = {
    "In Stock": "bg-emerald-100 text-emerald-800",
    "Low Stock": "bg-amber-100 text-amber-800",
    "Out of Stock": "bg-red-100 text-red-800",
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-2"
          loading="lazy"
          onError={(e) => {
            // Simple fallback to prevent broken image icons
            e.currentTarget.src = "/paddle-depot-logo.png"; // Fallback to your main logo
          }}
        />
        {product.featured && (
          <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            FEATURED
          </span>
        )}
        {/* Quick View Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => onQuickView(product)}
            className="flex items-center gap-2 bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Quick View
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {product.brand}
        </span>
        <h3 className="mt-1 text-base font-bold text-gray-800 leading-tight h-10 line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">
            {PESO_SIGN}{(product.price).toLocaleString()}
          </span>
          <span className={"text-xs font-semibold px-2.5 py-1 rounded-full " + stockColors[product.stockStatus]}>
            {product.stockStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
