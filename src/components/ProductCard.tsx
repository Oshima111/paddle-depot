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
    <div className="group relative bg-white rounded-xl overflow-hidden border border-gray-200/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-t-4 border-transparent hover:border-emerald-500">
      {/* Image */}
      <div className="relative aspect-square bg-white overflow-hidden">
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
          <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full tracking-wider">
            FEATURED
          </span>
        )}
        {product.id <= 8 && !product.featured && ( // Use product ID for more reliable "NEW" logic
          <span className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full tracking-wider">
            NEW
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {product.brand}
        </span>
        <h3 className="mt-1 text-sm sm:text-base font-bold text-gray-800 leading-tight min-h-[2.5rem] line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">
            {PESO_SIGN}{(product.price).toLocaleString()}
          </span>
          <span className={"text-xs font-semibold px-2.5 py-1 rounded-full " + stockColors[product.stockStatus]}>
            {product.stockStatus}
          </span>
        </div>
        <button onClick={() => onQuickView(product)} className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-300">
          View Paddle
        </button>
      </div>
    </div>
  );
}
