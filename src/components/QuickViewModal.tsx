import type { Product } from "../data/products";
import { getProductImageUrl, handleImageError } from "../lib/image";

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
  const stockStatus = product.stockStatus || product.stock_status || "In Stock";
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 transition z-10 p-1 bg-white/50 rounded-full">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="md:w-1/2 bg-white flex items-center justify-center p-4 relative">
          <img
            src={getProductImageUrl(product.image)}
            alt={product.name}
            className="max-h-[40vh] md:max-h-[70vh] w-auto object-contain"
            onError={handleImageError}
          />
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
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${stockColors[stockStatus] || "bg-gray-100 text-gray-800"}`}>
              {stockStatus}
            </span>
          </div>

          <p className="mt-6 text-gray-600 leading-relaxed flex-grow border-t pt-6">{product.description}</p>

          <div className="mt-8 pt-6 border-t">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Interested in this paddle?</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=61586918030050"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm text-white font-semibold rounded-lg shadow-sm transition-colors bg-blue-600 hover:bg-blue-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.563V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                Message on Facebook
              </a>
              <a
                href="https://www.instagram.com/thepaddledepot/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm text-white font-semibold rounded-lg shadow-sm transition-colors bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                DM on Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

