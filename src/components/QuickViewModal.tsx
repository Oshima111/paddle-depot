import type { Product } from "../data/products";

const PESO_SIGN = "\u20B1";

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

const stockColors = {
  "In Stock": "bg-emerald-100 text-emerald-800",
  "Low Stock": "bg-amber-100 text-amber-800",
  "Out of Stock": "bg-red-100 text-red-800",
};

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 transition z-10 p-1 bg-white/50 rounded-full">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-4 relative">
          <img src={product.image} alt={product.name} className="max-h-[70vh] w-auto object-contain" />
        </div>

        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{product.brand}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{product.name}</h2>

          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-bold text-gray-900">{PESO_SIGN}{(product.price).toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-lg text-gray-400 line-through">{PESO_SIGN}{(product.originalPrice).toLocaleString()}</span>
            )}
          </div>

          <div className="mt-4">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${stockColors[product.stockStatus]}`}>
              {product.stockStatus}
            </span>
          </div>

          <p className="mt-6 text-gray-600 leading-relaxed flex-grow">{product.description}</p>

          <p className="mt-6 text-xs text-gray-400">Product ID: {product.id}</p>
        </div>
      </div>
    </div>
  );
}