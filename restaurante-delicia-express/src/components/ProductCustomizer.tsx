import { useState, useEffect } from 'react';
import { Product, CartItem, ExtraIngredient } from '../types';
import { Plus, Minus, Check, X, ShoppingBag, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCustomizerProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  initialCartItem?: CartItem | null; // If editing an existing cart item within 30 mins
}

export default function ProductCustomizer({
  product,
  onClose,
  onAddToCart,
  initialCartItem = null,
}: ProductCustomizerProps) {
  const [quantity, setQuantity] = useState(initialCartItem ? initialCartItem.quantity : 1);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>(
    initialCartItem ? initialCartItem.removedIngredients : []
  );
  const [addedIngredients, setAddedIngredients] = useState<ExtraIngredient[]>(
    initialCartItem ? initialCartItem.addedIngredients : []
  );

  const [customPrice, setCustomPrice] = useState(product.basePrice);

  // Recalculate price when custom additions are changed
  useEffect(() => {
    const extraPrice = addedIngredients.reduce((total, ing) => total + ing.price, 0);
    setCustomPrice(product.basePrice + extraPrice);
  }, [addedIngredients, product.basePrice]);

  const toggleBaseIngredient = (ing: string) => {
    if (removedIngredients.includes(ing)) {
      setRemovedIngredients(removedIngredients.filter((item) => item !== ing));
    } else {
      setRemovedIngredients([...removedIngredients, ing]);
    }
  };

  const toggleExtraIngredient = (ing: ExtraIngredient) => {
    const exists = addedIngredients.some((item) => item.name === ing.name);
    if (exists) {
      setAddedIngredients(addedIngredients.filter((item) => item.name !== ing.name));
    } else {
      setAddedIngredients([...addedIngredients, ing]);
    }
  };

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      cartItemId: initialCartItem ? initialCartItem.cartItemId : `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      product,
      quantity,
      removedIngredients,
      addedIngredients,
      pricePerUnit: customPrice,
      totalPrice: customPrice * quantity,
    };

    onAddToCart(cartItem);
    onClose();
  };

  const formattedPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div id="customizer-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        id="customizer-panel"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        {/* Banner with Close button */}
        <div className="relative h-48 bg-black">
          <img
            id="customizer-product-img"
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <button
            id="customizer-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-950/80 hover:bg-slate-950 rounded-full text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content details */}
        <div className="p-5 sm:p-6 space-y-5">
          <div>
            <span id="customizer-category" className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">
              {product.category}
            </span>
            <h3 id="customizer-title" className="text-lg font-bold text-white tracking-tight mt-0.5 leading-snug">
              {product.name}
            </h3>
            <p id="customizer-description" className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="border-t border-slate-805/80 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Base Ingredients System to ADD/REMOVE */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="text-xs font-bold text-white tracking-wide uppercase">Ingredientes Base</span>
                <span className="text-[9px] font-mono text-slate-500 font-medium tracking-wider uppercase">(Desmarcar para Quitar)</span>
              </div>
              <div id="base-ingredients-list" className="space-y-1.5">
                {product.baseIngredients.map((ing) => {
                  const isRemoved = removedIngredients.includes(ing);
                  return (
                    <button
                      key={ing}
                      onClick={() => toggleBaseIngredient(ing)}
                      className={`w-full flex items-center justify-between p-2 pl-3 rounded-sm border text-left text-xs transition-colors cursor-pointer ${
                        isRemoved
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : 'bg-white/5 border-white/10 text-white/90 hover:border-white/20'
                      }`}
                    >
                      <span className={isRemoved ? 'line-through text-white/40' : ''}>{ing}</span>
                      <div className={`h-4 w-4 rounded-sm flex items-center justify-center border transition-all ${
                        isRemoved
                          ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                          : 'border-white/20 bg-transparent text-white/60'
                      }`}>
                        {isRemoved ? <X className="h-3 w-3 stroke-[2.5]" /> : <Check className="h-3 w-3 stroke-[2.5]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Extra Ingredients System to ADD */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="text-xs font-bold text-white tracking-wide uppercase">Adiciones Extra</span>
                <span className="text-[9px] font-mono text-slate-500 font-medium tracking-wider uppercase">(Costo Adicional)</span>
              </div>
              <div id="extra-ingredients-list" className="space-y-1.5">
                {product.extraIngredientsAvailable.map((ing) => {
                  const isAdded = addedIngredients.some((item) => item.name === ing.name);
                  return (
                    <button
                      key={ing.name}
                      onClick={() => toggleExtraIngredient(ing)}
                      className={`w-full flex items-center justify-between p-2 pl-3 rounded-sm border text-left text-xs transition-colors cursor-pointer ${
                        isAdded
                          ? 'bg-amber-500/10 border-amber-500 text-white font-semibold'
                          : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <span>{ing.name}</span>
                        <span className="block text-[9px] font-mono text-amber-500 font-normal mt-0.5">
                          +{formattedPrice(ing.price)}
                        </span>
                      </div>
                      <div className={`h-4 w-4 rounded-sm flex items-center justify-center border transition-all ${
                        isAdded
                          ? 'border-amber-500 bg-amber-500 text-black'
                          : 'border-white/10 bg-transparent text-white/40'
                      }`}>
                        {isAdded ? <Check className="h-3 w-3 stroke-[3]" /> : <Plus className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Footer: Quantity selector, total and add */}
          <div className="border-t border-slate-805/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
            <div className="flex items-center space-x-3 bg-white/5 p-1.5 rounded-sm border border-white/10">
              <button
                id="qty-decrement"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-sm transition-colors cursor-pointer"
                title="Reducir"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span id="qty-indicator" className="text-xs font-bold font-mono text-white text-center w-8">
                {quantity}
              </span>
              <button
                id="qty-increment"
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-sm transition-colors cursor-pointer"
                title="Aumentar"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="text-center sm:text-right leading-none">
              <span className="text-[10px] font-mono text-slate-450 uppercase tracking-widest">Total Personalizado</span>
              <p id="customizer-total-price" className="text-xl font-black text-amber-500 mt-0.5 font-mono">
                {formattedPrice(customPrice * quantity)}
              </p>
              {quantity > 1 && (
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  ({formattedPrice(customPrice)} c/u)
                </span>
              )}
            </div>

            <button
              id="customizer-add-btn"
              onClick={handleAddToCart}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 text-black font-semibold text-xs rounded-sm hover:bg-amber-450 active:bg-amber-600 transition-all flex items-center justify-center space-x-2 uppercase tracking-[0.1em] cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4 stroke-[2.5]" />
              <span>{initialCartItem ? 'Actualizar en Carrito' : 'Agregar al Carrito'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
