import { Star, ShoppingCart, ExternalLink } from 'lucide-react';
import { Product } from '../lib/supabase';
import { concernLabels } from '../lib/skinAnalysis';

interface ProductRecommendationsProps {
  products: Product[];
}

export default function ProductRecommendations({ products }: ProductRecommendationsProps) {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Recommended Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Based on your skin analysis, here are our top dermatologist-approved recommendations
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group bg-white border-2 border-gray-100 rounded-3xl overflow-hidden hover:border-emerald-200 hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-gray-900">{product.rating}</span>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-3">
                  <p className="text-sm font-medium text-emerald-600 mb-1">{product.brand}</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {product.description}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Targets:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.skin_concerns.slice(0, 3).map((concern) => (
                      <span
                        key={concern}
                        className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium"
                      >
                        {concernLabels[concern] || concern}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all group">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden sm:inline">Add to Cart</span>
                  </button>
                </div>

                <button className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2 hover:bg-emerald-50 rounded-lg transition-colors">
                  <span>View Details</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found matching your skin concerns.</p>
          </div>
        )}
      </div>
    </div>
  );
}
