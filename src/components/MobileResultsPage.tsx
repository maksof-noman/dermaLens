import { useState } from 'react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Product } from '../lib/supabase';
import FaceMeshOverlay from './FaceMeshOverlay';
import ProductDetailModal from './ProductDetailModal';

interface MobileResultsPageProps {
  imageData: string;
  products: Product[];
  onBack: () => void;
}

export default function MobileResultsPage({ imageData, products, onBack }: MobileResultsPageProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  console.log('MobileResultsPage rendering with imageData:', imageData ? `${imageData.substring(0, 50)}...` : 'NO IMAGE');
  console.log('Products count:', products?.length || 0);
  console.log('Products:', products);

  const handleAddToCart = (product: Product) => {
    console.log('Added to cart:', product);
  };

  const handleImageError = (productId: string) => {
    console.error('Failed to load image for product:', productId);
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Skin type indicator</h1>
      </div>

      <div className="relative w-full aspect-[3/4] overflow-hidden">
        {imageData ? (
          <FaceMeshOverlay
            imageData={imageData}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <p className="text-white text-lg">No image captured</p>
          </div>
        )}
      </div>

      <div className="px-4 py-6 bg-white rounded-t-3xl -mt-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Special for you</h2>
          <button className="text-orange-600 font-medium text-sm hover:text-orange-700">
            See all
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {products.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="relative bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
            >
              <div
                onClick={() => setSelectedProduct(product)}
                className="relative aspect-square cursor-pointer bg-gray-100"
              >
                {product.image_url && !imageErrors[product.id] ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(product.id)}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                    <svg className="w-24 h-24 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                className="absolute bottom-4 right-4 w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
              >
                <ShoppingCart className="w-6 h-6 text-white" />
              </button>
            </div>
          ))}
        </div>

        {products.length > 4 && (
          <button className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all">
            View All Recommendations ({products.length})
          </button>
        )}
      </div>

      <div className="px-4 pb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3 text-lg">Recommendation</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Based on your skin analysis, we've curated personalized product recommendations to address your specific concerns and enhance your natural beauty.
          </p>
          <button className="text-orange-600 font-medium text-sm hover:text-orange-700 flex items-center gap-1">
            Learn more about your results
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={() => {
            handleAddToCart(selectedProduct);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
