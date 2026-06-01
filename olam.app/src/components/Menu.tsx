import { useState } from 'react';
import { Product, CartItem, User } from '../types';
import { INITIAL_PRODUCTS } from '../data';
import { Search, ShoppingBag, Edit3, Key, AlertTriangle, ChevronRight } from 'lucide-react';
import ProductCustomizer from './ProductCustomizer';
import { motion, AnimatePresence } from 'motion/react';

interface MenuProps {
  currentUser: User | null;
  onAddToCart: (item: CartItem) => void;
  onOpenAuth: () => void;
}

const CATEGORIES = ['Todos', 'Hamburguesas', 'Pizzas', 'Perros Calientes', 'Desgranados', 'Salchipapas'];

export default function Menu({ currentUser, onAddToCart, onOpenAuth }: MenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [showAlertAuth, setShowAlertAuth] = useState(false);

  const filteredProducts = INITIAL_PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductAction = (product: Product) => {
    if (!currentUser) {
      setShowAlertAuth(true);
      return;
    }
    setSelectedProduct(product);
  };

  const formattedPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div id="menu-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      {/* Alert modal when guest tries to touch food */}
      <AnimatePresence>
        {showAlertAuth && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center space-y-4"
            >
              <div className="h-12 w-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Validación Requerida</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  RF 1 y 2: Para poder realizar pedidos y personalizar tus alimentos, debes registrarte y verificar tu mayoría de edad mediante foto de documento (CC).
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  id="modal-alert-cancel"
                  onClick={() => setShowAlertAuth(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Seguir Buscando
                </button>
                <button
                  id="modal-alert-login"
                  onClick={() => {
                    setShowAlertAuth(false);
                    onOpenAuth();
                  }}
                  className="flex-1 py-2 bg-amber-500 text-slate-950 text-xs font-black rounded-xl hover:bg-amber-450"
                >
                  Identificarse
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-8">
        {/* Title & info box */}
        <div className="md:col-span-2 space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Nuestra Carta</p>
          <h2 className="text-3xl font-light tracking-tighter text-white uppercase leading-none">Menú de Comida Rápida Premium</h2>
          <p className="text-[11px] text-white/50 mt-1">
            ¡Personaliza tus ingredientes base y extras favoritos! Quítale o agrégale ingredientes como prefieras.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
          <input
            id="menu-search-input"
            type="text"
            placeholder="Buscar hamburguesas, pizzas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white pl-10 pr-4 py-2 text-xs rounded-sm focus:outline-none focus:border-amber-500 font-sans uppercase tracking-wider"
          />
        </div>
      </div>

      {/* Category Horizontal Filter */}
      <div id="category-scroller" className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 text-xs uppercase tracking-wider rounded-sm transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-500 text-black font-semibold shadow-sm'
                : 'text-white/60 bg-white/5 border border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food Catalog List */}
      <div id="product-catalog-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            id={`product-card-${product.id}`}
            className="bg-slate-900 border border-white/10 rounded-sm overflow-hidden shadow-xl hover:border-amber-500/40 transition-all duration-300 group flex flex-col h-full"
          >
            {/* Image Box */}
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute top-3 right-3 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800 text-[10px] font-mono text-amber-550 font-extrabold shadow">
                {formattedPrice(product.basePrice)}
              </div>
            </div>

            {/* Context Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-amber-500 font-bold uppercase tracking-wider">
                  {product.category}
                </span>
                <h4 className="text-sm font-bold text-white tracking-tight leading-snug group-hover:text-amber-500 transition-colors">
                  {product.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
                  {product.description}
                </p>
              </div>

              {/* Show base ingredients mini bullet lists for preview */}
              <div className="p-2 bg-[#0A0A0A] rounded-sm border border-white/10">
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-semibold mb-1">
                  Ingredientes base:
                </p>
                <div className="flex flex-wrap gap-1">
                  {product.baseIngredients.map((ing) => (
                    <span
                      key={ing}
                      className="text-[9px] bg-white/5 text-white/70 px-1.5 py-0.5 rounded-sm border border-white/5"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Order/Customize Button */}
              <button
                id={`btn-customize-${product.id}`}
                onClick={() => handleProductAction(product)}
                className="w-full py-2 bg-white/5 hover:bg-amber-500 text-white hover:text-black font-semibold text-[10px] uppercase tracking-wider rounded-sm transition-all flex items-center justify-center space-x-1 border border-white/10 group-hover:border-amber-500/20"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Personalizar y Pedir</span>
                <ChevronRight className="h-3 w-3 inline opacity-50" />
              </button>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            <p className="text-sm">No encontramos ningún producto que coincida con tu búsqueda.</p>
          </div>
        )}
      </div>

      {/* Dynamic Item Customizer Overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductCustomizer
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={onAddToCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
