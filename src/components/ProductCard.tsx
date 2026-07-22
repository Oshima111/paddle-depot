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
    <div className="group bg-white rounded-xl border border-gray-200/80 overflow-hidden hover:shadow-lg hover:border-transparent hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        {product.originalPrice && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            SALE
          </span>
        )}
        {/* Quick View Button */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={() => onQuickView(product)}
            className="flex items-center gap-2 bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Quick View
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {product.brand}
        </span>
        <h3 className="mt-1 text-base font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors leading-tight h-12 line-clamp-2">
          {product.name}
        </h3>
        <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 flex-grow h-10">
          {product.description}
        </p>

        <div className="mt-4 pt-3 border-t border-gray-100 flex-grow flex flex-col justify-end">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-gray-900">
                {PESO_SIGN}{(product.price).toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {PESO_SIGN}{(product.originalPrice).toLocaleString()}
                </span>
              )}
            </div>
            <span className={"text-xs font-semibold px-2.5 py-1 rounded-full " + stockColors[product.stockStatus]}>
              {product.stockStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
