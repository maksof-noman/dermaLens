import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Search, Filter, Loader2 } from 'lucide-react';
import { fetchProducts, Product } from '../lib/supabase';
import { concernLabels } from '../lib/skinAnalysis';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedConcern, setSelectedConcern] = useState<string>('all');

  const categories = ['all', 'cleanser', 'serum', 'moisturizer', 'treatment', 'sunscreen', 'mask', 'toner', 'eye_cream'];
  const concerns = ['all', 'acne', 'wrinkles', 'dark_spots', 'dryness', 'oiliness', 'redness', 'sensitivity'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, selectedConcern, products]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error }:any = await fetchProducts();

    if (error) {
      console.error('Error fetching products:', error);
    } else if (data) {
      setProducts(data);
      setFilteredProducts(data);
    }
    setLoading(false);
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (selectedConcern !== 'all') {
      filtered = filtered.filter((p) => p.skin_concerns.includes(selectedConcern));
    }

    setFilteredProducts(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <section className="relative py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Dermatologist-Approved Products
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Discover premium skincare products carefully selected by dermatology experts
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, brands, or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex gap-4 flex-wrap lg:flex-nowrap">
              <div className="relative flex-1 lg:flex-none lg:w-48">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none appearance-none bg-white cursor-pointer transition-colors"
                >
                  <option value="all">All Categories</option>
                  {categories.slice(1).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 lg:flex-none lg:w-48">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={selectedConcern}
                  onChange={(e) => setSelectedConcern(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none appearance-none bg-white cursor-pointer transition-colors"
                >
                  <option value="all">All Concerns</option>
                  {concerns.slice(1).map((concern) => (
                    <option key={concern} value={concern}>
                      {concernLabels[concern] || concern}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white border-2 border-gray-100 rounded-3xl overflow-hidden hover:border-emerald-200 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-900">{product.rating}</span>
                    </div>
                    <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                      {product.category.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-3">
                      <p className="text-sm font-medium text-emerald-600 mb-1">{product.brand}</p>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Targets:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.skin_concerns.slice(0, 3).map((concern) => (
                          <span
                            key={concern}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium"
                          >
                            {concernLabels[concern] || concern}
                          </span>
                        ))}
                        {product.skin_concerns.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                            +{product.skin_concerns.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                      <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all group-hover:scale-105">
                        <ShoppingCart className="w-4 h-4" />
                        <span className="hidden sm:inline">Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Not Sure What You Need?</h2>
          <p className="text-xl mb-8 text-emerald-50">
            Get personalized product recommendations based on your unique skin analysis
          </p>
          <a
            href="/"
            className="inline-block bg-white text-emerald-600 px-10 py-5 rounded-full text-lg font-semibold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
          >
            Analyze Your Skin Now
          </a>
        </div>
      </section>
    </div>
  );
}
