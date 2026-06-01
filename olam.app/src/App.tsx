import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Menu from './components/Menu';
import Cart from './components/Cart';
import InvoiceView from './components/InvoiceView';
import ProfileUpdate from './components/ProfileUpdate';
import AdminPanel from './components/AdminPanel';
import { User, CartItem, Order, OrderStatus } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Star, Sparkles, UtensilsCrossed } from 'lucide-react';

const DEMO_USER: User = {
  id: 'u-demo',
  username: 'cocinero_delicia',
  fullName: 'Carlos Julio Gómez',
  email: 'carlos.gomez@delicia.com',
  phone: '3124567890',
  address: 'Calle 85 #11-32, Bogotá',
  isAgeVerified: true,
  ccNumber: '1014902111',
  birthDate: '1995-03-12',
  ccPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
};

const INITIAL_LOCAL_ORDERS: Order[] = [
  {
    id: 'o-demo-1',
    userId: 'u-demo',
    customerName: 'Carlos Julio Gómez',
    customerPhone: '3124567890',
    customerAddress: 'Calle 85 #11-32, Bogotá',
    items: [
      {
        cartItemId: 'c-demo-1',
        product: {
          id: 'p1',
          name: 'Hamburguesa Súper Delicia',
          description: 'Increíble carne Angus de 150g a la parrilla, delicioso queso cheddar fundido, lechuga fresca, rodajas de tomate y jugosa cebolla caramelizada con nuestra salsa especial de la casa.',
          category: 'Hamburguesas',
          basePrice: 18900,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800',
          baseIngredients: ['Carne Angus 150g', 'Queso Cheddar', 'Lechuga', 'Tomate', 'Cebolla Caramelizada', 'Salsa Especial'],
          extraIngredientsAvailable: [
            { name: 'Tocineta Crujiente', price: 3000 },
            { name: 'Queso Cheddar Extra', price: 2000 }
          ]
        },
        quantity: 2,
        removedIngredients: ['Tomate'],
        addedIngredients: [{ name: 'Tocineta Crujiente', price: 3000 }],
        pricePerUnit: 21900,
        totalPrice: 43800
      }
    ],
    total: 43800,
    createdAt: new Date().toISOString(), // Created right now to make it cancellable in demo
    status: 'Pendiente',
    paymentMethod: 'Nequi',
    estimatedArrivalMinutes: 35,
    invoiceId: 'FAC-789123'
  },
  {
    id: 'o-demo-2',
    userId: 'u-other',
    customerName: 'Clara Estrada Rojas',
    customerPhone: '3104321098',
    customerAddress: 'Carrera 7 #72-10, Bogotá',
    items: [
      {
        cartItemId: 'c-demo-2',
        product: {
          id: 'p2',
          name: 'Pizza Suprema Mediana',
          description: 'Tradicional salsa de pizza italiana, doble porción de queso mozzarella, rodajas de pepperoni americano, jamón seleccionado, champiñones frescos y un toque de orégano.',
          category: 'Pizzas',
          basePrice: 24900,
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800',
          baseIngredients: ['Salsa de Tomate', 'Queso Mozzarella', 'Jamón', 'Pepperoni', 'Champiñones', 'Orégano'],
          extraIngredientsAvailable: [
            { name: 'Extra Mozzarella', price: 3500 }
          ]
        },
        quantity: 1,
        removedIngredients: [],
        addedIngredients: [{ name: 'Extra Mozzarella', price: 3500 }],
        pricePerUnit: 28400,
        totalPrice: 28400
      }
    ],
    total: 28400,
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(), // 40 minutes old to show expired countdown/non-cancellable
    status: 'En Preparación',
    paymentMethod: 'Tarjeta de Crédito',
    estimatedArrivalMinutes: 15,
    invoiceId: 'FAC-456789'
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<'client' | 'admin'>('client');
  const [currentView, setCurrentView] = useState<'menu' | 'profile' | 'orders' | 'admin'>('menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([DEMO_USER]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('delicia_users');
    const savedOrders = localStorage.getItem('delicia_orders');
    const savedCurrentUser = localStorage.getItem('delicia_current_user');

    if (savedUsers) {
      setRegisteredUsers(JSON.parse(savedUsers));
    } else {
      localStorage.setItem('delicia_users', JSON.stringify([DEMO_USER]));
    }

    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      setOrders(INITIAL_LOCAL_ORDERS);
      localStorage.setItem('delicia_orders', JSON.stringify(INITIAL_LOCAL_ORDERS));
    }

    if (savedCurrentUser) {
      setCurrentUser(JSON.parse(savedCurrentUser));
    }
  }, []);

  // Save changes to localStorage
  const handleRegisterUser = (newUser: User) => {
    const updated = registeredUsers.some((u) => u.id === newUser.id)
      ? registeredUsers.map((u) => (u.id === newUser.id ? newUser : u))
      : [...registeredUsers, newUser];

    setRegisteredUsers(updated);
    localStorage.setItem('delicia_users', JSON.stringify(updated));
  };

  const handleUpdateCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('delicia_current_user', JSON.stringify(updatedUser));
    // Also sync in local users registry
    handleRegisterUser(updatedUser);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('delicia_current_user', JSON.stringify(user));
    setCurrentView('menu');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('delicia_current_user');
    setCart([]);
    setCurrentView('menu');
  };

  // Cart Management
  const handleAddToCart = (item: CartItem) => {
    // Check if item already in cart with EXACT same customization recipe
    const existingIndex = cart.findIndex((c) => {
      const matchProduct = c.product.id === item.product.id;
      const matchRemoved = c.removedIngredients.length === item.removedIngredients.length &&
        c.removedIngredients.every((r) => item.removedIngredients.includes(r));
      const matchAdded = c.addedIngredients.length === item.addedIngredients.length &&
        c.addedIngredients.every((a) => item.addedIngredients.some((itemA) => itemA.name === a.name));
      return matchProduct && matchRemoved && matchAdded;
    });

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += item.quantity;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].pricePerUnit;
      setCart(updated);
    } else {
      setCart([...cart, item]);
    }
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    setCart(
      cart.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: newQty, totalPrice: newQty * item.pricePerUnit }
          : item
      )
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart(cart.filter((item) => item.cartItemId !== cartItemId));
  };

  // Order Placement
  const handlePlaceOrder = (newOrder: Order) => {
    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem('delicia_orders', JSON.stringify(updated));
    setCart([]); // Clear completed cart
    setCurrentView('orders'); // Jump directly to invoice electronic records
  };

  // Cancel order within 30 mins
  const handleCancelOrder = (orderId: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: 'Cancelado' as OrderStatus } : o
    );
    setOrders(updated);
    localStorage.setItem('delicia_orders', JSON.stringify(updated));
  };

  // Modify order within 30 mins (takes order specs back into active shopping cart, and deletes the order)
  const handleModifyOrder = (orderToModify: Order) => {
    // 1. Put all order items back into cart
    setCart(orderToModify.items);
    
    // 2. Erase the old order registry so they don't get double billed
    const updated = orders.filter((o) => o.id !== orderToModify.id);
    setOrders(updated);
    localStorage.setItem('delicia_orders', JSON.stringify(updated));
    
    // 3. Open cart directly so they can modify details
    setIsCartOpen(true);
    setCurrentView('menu');
    alert('Hemos retornado los platillos de este pedido a tu carrito de compras activo. Puedes editarlos y reenviar el pedido.');
  };

  // Admin status update
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updated);
    localStorage.setItem('delicia_orders', JSON.stringify(updated));
  };

  // Filter client list to only show orders belonging to them
  const clientOrders = orders.filter((o) => o.userId === currentUser?.id);

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Header with Navigation and switches */}
      <Navbar
        currentUser={currentUser}
        currentRole={currentRole}
        onChangeRole={(role) => setCurrentRole(role)}
        currentView={currentView}
        onChangeView={(view) => {
          if (view === 'admin' && currentRole !== 'admin') {
            setCurrentRole('admin');
          } else if (view !== 'admin' && currentRole !== 'client') {
            setCurrentRole('client');
          }
          setCurrentView(view);
        }}
        cartCount={cart.reduce((tot, c) => tot + c.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onLogout={handleLogout}
      />

      {/* Hero promo ribbon context */}
      {currentRole === 'client' && currentView === 'menu' && (
        <div className="bg-amber-550/10 border-b border-amber-500/15 py-3 text-center px-4">
          <p className="text-[11px] font-sans font-semibold text-amber-500 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500 animate-[bounce_1s_infinite]" />
            ¡Prueba Nuestro Simulador! Realiza un pedido, ingresa al panel de Administrador y despáchalo en vivo.
          </p>
        </div>
      )}

      {/* Main View Manager */}
      <main id="main-content" className="flex-1 pb-16">
        <AnimatePresence mode="wait">
          {/* General Client Menu */}
          {currentRole === 'client' && currentView === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Menu
                currentUser={currentUser}
                onAddToCart={handleAddToCart}
                onOpenAuth={() => setCurrentView('profile')}
              />
            </motion.div>
          )}

          {/* Client Authentication Login & Verification */}
          {currentRole === 'client' && currentView === 'profile' && !currentUser && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-6"
            >
              <Auth
                onAuthSuccess={handleAuthSuccess}
                registeredUsers={registeredUsers}
                onRegisterUser={handleRegisterUser}
              />
            </motion.div>
          )}

          {/* Client Data Update Form (logged in profile) */}
          {currentRole === 'client' && currentView === 'profile' && currentUser && (
            <motion.div
              key="profile-update"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-6"
            >
              <ProfileUpdate
                currentUser={currentUser}
                onUpdateUser={handleUpdateCurrentUser}
              />
            </motion.div>
          )}

          {/* Client Invoices and relative time limits */}
          {currentRole === 'client' && currentView === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-6"
            >
              <InvoiceView
                orders={clientOrders}
                onCancelOrder={handleCancelOrder}
                onModifyOrder={handleModifyOrder}
              />
            </motion.div>
          )}

          {/* Master administrative console */}
          {currentRole === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-6"
            >
              <AdminPanel
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Core Slider Shopping Cart Drawer Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <Cart
            currentUser={currentUser}
            cartItems={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClose={() => setIsCartOpen(false)}
            onPlaceOrder={handlePlaceOrder}
          />
        )}
      </AnimatePresence>

      {/* Compact operational footer */}
      <footer id="app-footer" className="bg-slate-900 border-t border-white/10 py-5 text-center font-sans bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto px-4 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-1.5 justify-center">
            <UtensilsCrossed className="h-4 w-4 text-amber-500/80" />
            <span>© 2026 Restaurante Delicia Express. Hecho con React, Tailwind & Motion.</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-amber-500 transition-colors cursor-pointer font-mono text-[10px]">Políticas de CC</span>
            <span className="hover:text-amber-500 transition-colors cursor-pointer font-mono text-[10px]">Facturación electrónica certificada DIAN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
