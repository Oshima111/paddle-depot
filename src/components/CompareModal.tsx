import type { Product } from "../data/products";
import { getProductImageUrl, handleImageError } from "../lib/image";

const PESO_SIGN = "\u20B1";

interface CompareModalProps {
  products: Product[];
  onRemove: (product: Product) => void;
  onClose: () => void;
}

const getSpec = (description: string, keyword: string) => {
  const match = description.match(new RegExp(`(Gen\\. \\d)|(${keyword})`, 'i'));
  return match ? match[0] : 'Standard';
};

export default function CompareModal({ products, onRemove, onClose }: CompareModalProps) {
  const specs = [
    { label: 'Brand', getValue: (p: Product) => p.brand },
    { label: 'Price', getValue: (p: Product) => `${PESO_SIGN}${p.price.toLocaleString()}` },
    { label: 'Stock', getValue: (p: Product) => p.stockStatus || p.stock_status || 'In Stock' },
    { label: 'Shape', getValue: (p: Product) => getSpec(p.description, 'hybrid|elongated|wide-body') },
    { label: 'Generation', getValue: (p: Product) => getSpec(p.description, 'Gen\\. \\d') },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Compare Paddles</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-800 transition" aria-label="Close comparison">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="overflow-x-auto flex-grow">
          <div className="min-w-[700px] md:min-w-full">
            <div className="grid grid-cols-3 divide-x divide-gray-200">
              {products.map(product => (
                <div key={product.id} className="p-4 text-center relative">
                  <button onClick={() => onRemove(product)} className="absolute top-2 right-2 p-1.5 text-gray-400 hover:bg-gray-100 rounded-full" aria-label={`Remove ${product.name}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                  </button>
                  <div className="h-40 flex items-center justify-center">
                    <img src={getProductImageUrl(product.image)} alt={product.name} className="max-h-full max-w-full object-contain" onError={handleImageError} />
                  </div>
                  <h3 className="mt-4 font-bold text-gray-800 h-12 line-clamp-2">{product.name}</h3>
                </div>
              ))}
              {Array.from({ length: 3 - products.length }).map((_, i) => (
                <div key={`placeholder-${i}`} className="p-4 text-center flex items-center justify-center h-full">
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <span className="text-gray-400 text-sm">Add a paddle to compare</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t">
              {specs.map(spec => (
                <div key={spec.label} className="grid grid-cols-3 divide-x divide-gray-200">
                  {products.map(product => (
                    <div key={`${product.id}-${spec.label}`} className="p-4 text-center">
                      <p className="text-xs text-gray-500 mb-1">{spec.label}</p>
                      <p className="font-semibold text-gray-800">{spec.getValue(product)}</p>
                    </div>
                  ))}
                  {Array.from({ length: 3 - products.length }).map((_, i) => (
                    <div key={`placeholder-spec-${i}`} className="p-4 text-center">
                      <p className="text-xs text-gray-500 mb-1">{spec.label}</p>
                      <p className="font-semibold text-gray-400">-</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t bg-gray-50 rounded-b-xl">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Interested in a paddle?</h4>
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
  );
}

