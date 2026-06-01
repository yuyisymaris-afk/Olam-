import { useState, useEffect } from 'react';
import { CartItem, User, Order } from '../types';
import { Trash2, AlertCircle, ShoppingBag, MapPin, CreditCard, ChevronRight, X, Clock, Edit } from 'lucide-react';
import { motion } from 'motion/react';

interface CartProps {
  currentUser: User | null;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClose: () => void;
  onPlaceOrder: (order: Order) => void;
}

export default function Cart({
  currentUser,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClose,
  onPlaceOrder,
}: CartProps) {
  const [address, setAddress] = useState(currentUser?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta de Crédito' | 'Nequi' | 'Daviplata'>('Efectivo');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);

  // Sync address with user info when loaded
  useEffect(() => {
    if (currentUser) {
      setAddress(currentUser.address);
    }
  }, [currentUser]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const handleCheckout = () => {
    setErrorMsg('');

    if (!currentUser) {
      setErrorMsg('Debes estar autenticado para realizar el pedido.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMsg('Tu carrito está vacío.');
      return;
    }

    if (!address || address.trim().length < 5) {
      setErrorMsg('Por favor especifica una dirección de entrega válida.');
      return;
    }

    setIsOrdering(true);

    // Simulated network delay
    setTimeout(() => {
      const orderId = `o-${Date.now()}`;
      const mockArrivalMin = Math.floor(25 + Math.random() * 20); // 25-45 minutes estimate

      const newOrder: Order = {
        id: orderId,
        userId: currentUser.id,
        customerName: currentUser.fullName,
        customerPhone: currentUser.phone,
        customerAddress: address,
        items: [...cartItems],
        total: calculateSubtotal(),
        createdAt: new Date().toISOString(),
        status: 'Pendiente',
        paymentMethod: paymentMethod,
        estimatedArrivalMinutes: mockArrivalMin,
        invoiceId: `FAC-${Date.now().toString().slice(-6)}`
      };

      onPlaceOrder(newOrder);
      setIsOrdering(false);
      onClose();
    }, 1500);
  };

  const formattedPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-xs">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        id="cart-panel-container"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full max-w-md bg-slate-900 h-full shadow-2xl flex flex-col justify-between border-l border-white/10 z-10"
      >
        {/* Header Drawer */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShoppingBag className="h-5 w-5 text-amber-500" />
            <span className="text-xs uppercase tracking-[0.2em] text-white/80">Tu Carrito de Compras</span>
            <span className="px-2 py-0.5 bg-white/5 text-amber-500 rounded-sm text-[10px] font-mono leading-none border border-white/10 font-bold">
              {cartItems.length}
            </span>
          </div>
          <button
            id="cart-drawer-close"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* List of elements inside cart */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div id="cart-error-banner" className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl flex items-start gap-2 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="h-10 w-10 text-slate-600 mx-auto stroke-[1.5]" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Carrito vacío</p>
                <p className="text-[11px] text-slate-450 leading-relaxed px-5">
                  Agrega deliciosos platillos de nuestro catálogo y configure sus ingredientes a su preferencia.
                </p>
              </div>
            </div>
          ) : (
            <div id="cart-items-collection" className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3 bg-white/5 rounded-sm border border-white/10 flex gap-3 relative overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="h-14 w-14 rounded-sm overflow-hidden shrink-0 bg-[#0A0A0A] border border-white/10">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Description of customization */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.product.name}</p>
                    <p className="text-[11px] font-mono font-medium text-amber-500 mt-0.5">
                      {formattedPrice(item.pricePerUnit)} c/u
                    </p>

                    {/* Removals / Extras display layout */}
                    {(item.removedIngredients.length > 0 || item.addedIngredients.length > 0) && (
                      <div className="mt-1.5 space-y-1 p-1.5 bg-[#0A0A0A] rounded-sm border border-white/10">
                        {item.removedIngredients.map((rem) => (
                          <span
                            key={rem}
                            className="inline-flex items-center text-[9px] font-medium text-rose-400 mr-1.5 mb-0.5 leading-none bg-rose-950/20 border border-rose-900/30 px-1 py-0.5 rounded-sm"
                          >
                            Sin {rem}
                          </span>
                        ))}
                        {item.addedIngredients.map((add) => (
                          <span
                            key={add.name}
                            className="inline-flex items-center text-[9px] font-semibold text-emerald-400 mr-1.5 mb-0.5 leading-none bg-emerald-950/20 border border-emerald-900/30 px-1 py-0.5 rounded-sm"
                          >
                            + {add.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action buttons (Quantity, Delete) */}
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-900">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                          className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-350 rounded text-xs font-mono font-bold leading-none"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono text-white px-1 font-bold">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                          className="px-1.5 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-350 rounded text-xs font-mono font-bold leading-none"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-rose-400 hover:text-rose-300 p-1 bg-rose-500/5 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Eliminar artículo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Destination Checkout parameters */}
          {cartItems.length > 0 && (
            <div className="pt-4 border-t border-white/10 space-y-4 font-sans">
              {/* Delivery Address section */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  Dirección de Envío
                </span>
                <input
                  id="checkout-address-input"
                  type="text"
                  placeholder="Calle 100 #24-12, Bogotá"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/10 text-white px-3 py-2 text-xs rounded-sm focus:outline-none focus:border-amber-500 transition-colors placeholder:text-white/20"
                />
              </div>

              {/* Payment selection system */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-amber-500" />
                  Método de Pago
                </span>
                <div id="payment-methods-grid" className="grid grid-cols-2 gap-2">
                  {(['Efectivo', 'Tarjeta de Crédito', 'Nequi', 'Daviplata'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-3 text-xs rounded-sm font-semibold border text-left transition-colors cursor-pointer flex items-center justify-between ${
                        paymentMethod === method
                          ? 'bg-amber-500/10 border-amber-500 text-white font-extrabold'
                          : 'bg-[#0A0A0A] border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{method}</span>
                      <div className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                        paymentMethod === method ? 'border-amber-500 bg-amber-500' : 'border-white/10 bg-transparent'
                      }`}>
                        {paymentMethod === method && <div className="h-1 w-1 bg-[#0A0A0A] rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Arrival indicator */}
              <div className="p-3 bg-[#0A0A0A] border border-white/10 rounded-sm flex items-center gap-2 text-xs">
                <Clock className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <span className="text-white/60">
                  Tiempo estimado de entrega:{' '}
                  <span className="text-white font-bold font-sans">25 a 45 minutos</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing totals block */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 bg-[#0F0F0F] border-t border-white/10 space-y-4 font-sans">
            <div className="flex justify-between items-baseline leading-none">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Total a Pagar</span>
              <span id="checkout-drawer-total" className="text-xl font-black text-amber-500 font-mono">
                {formattedPrice(calculateSubtotal())}
              </span>
            </div>

            <button
              id="btn-checkout-submit"
              onClick={handleCheckout}
              disabled={isOrdering}
              className="w-full py-3 bg-amber-500 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-[#ff8c38] hover:text-black hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {isOrdering ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Procesando Pedido...</span>
                </>
              ) : (
                <>
                  <span>Enviar Pedido a Cocina</span>
                  <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
