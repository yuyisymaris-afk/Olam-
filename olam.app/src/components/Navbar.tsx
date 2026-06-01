import { User } from '../types';
import { ShoppingBag, User as UserIcon, ShieldAlert, LogOut, Utensils, ClipboardList, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  currentUser: User | null;
  currentRole: 'client' | 'admin';
  onChangeRole: (role: 'client' | 'admin') => void;
  currentView: string;
  onChangeView: (view: 'menu' | 'profile' | 'orders' | 'admin') => void;
  cartCount: number;
  onOpenCart: () => void;
  onLogout: () => void;
}

export default function Navbar({
  currentUser,
  currentRole,
  onChangeRole,
  currentView,
  onChangeView,
  cartCount,
  onOpenCart,
  onLogout,
}: NavbarProps) {
  return (
    <header id="app-header" className="sticky top-0 z-40 w-full bg-slate-900 border-b border-white/10 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Branded Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onChangeView('menu')}>
            <div className="w-8 h-8 bg-amber-500 rounded-sm flex items-center justify-center font-bold text-black font-sans">
              D
            </div>
            <div>
              <h1 id="brand-title" className="font-sans font-light text-base tracking-widest uppercase text-white leading-none">
                Delicia<span className="text-amber-500 font-medium">Express</span>
              </h1>
              <p id="brand-tagline" className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5 font-sans">
                Sabor Premium
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-4">
            {/* Context/Role switcher (Client vs Admin Toggle for simulation) */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                id="role-client-toggle"
                onClick={() => {
                  onChangeRole('client');
                  onChangeView('menu');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  currentRole === 'client'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Cliente
              </button>
              <button
                id="role-admin-toggle"
                onClick={() => {
                  onChangeRole('admin');
                  onChangeView('admin');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1 ${
                  currentRole === 'admin'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="h-3 w-3" />
                Admin
              </button>
            </div>

            {/* Role Dependent Views */}
            {currentRole === 'client' && currentUser && (
              <div className="hidden md:flex items-center space-x-2">
                <button
                  id="nav-menu"
                  onClick={() => onChangeView('menu')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    currentView === 'menu'
                      ? 'text-amber-500 bg-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Menú
                </button>
                <button
                  id="nav-orders"
                  onClick={() => onChangeView('orders')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    currentView === 'orders'
                      ? 'text-amber-500 bg-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Mis Pedidos
                </button>
              </div>
            )}

            {/* Shopping Cart (Customer only) */}
            {currentRole === 'client' && (
              <motion.button
                id="navbar-cart-btn"
                whileTap={{ scale: 0.95 }}
                onClick={onOpenCart}
                className="relative p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-all"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span
                    id="cart-badge"
                    className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-md border-2 border-slate-900"
                  >
                    {cartCount}
                  </span>
                )}
              </motion.button>
            )}

            {/* User Details & Actions */}
            {currentUser ? (
              <div className="flex items-center space-x-3">
                {/* Profile Widget */}
                <div
                  id="user-profile-widget"
                  onClick={() => onChangeView('profile')}
                  className="flex items-center space-x-2 bg-slate-850 p-1.5 pr-3 rounded-xl border border-slate-800 hover:border-amber-500/30 transition-all cursor-pointer group"
                >
                  <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs ring-1 ring-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                    {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left leading-none">
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-white">
                      {currentUser.fullName.split(' ')[0]}
                    </p>
                    <span className="text-[9px] text-slate-550 font-mono">CC Verificada</span>
                  </div>
                </div>

                {/* Logout */}
                <button
                  id="logout-btn"
                  onClick={onLogout}
                  title="Cerrar sesión"
                  className="p-2 text-rose-450 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all border border-rose-500/15"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              currentRole === 'client' && (
                <button
                  id="login-register-trigger"
                  onClick={() => onChangeView('profile')}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-450 active:bg-amber-600 rounded-xl transition-all shadow-md shadow-amber-500/15 flex items-center space-x-1.5"
                >
                  <UserIcon className="h-4 w-4 stroke-[2.5]" />
                  <span>Ingresar</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Small screen mobile sub-nav for Client view */}
        {currentRole === 'client' && currentUser && (
          <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/60 pb-3">
            <button
              id="mobile-nav-menu"
              onClick={() => onChangeView('menu')}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
                currentView === 'menu' ? 'text-amber-500' : 'text-slate-400'
              }`}
            >
              <Utensils className="h-4 w-4" />
              <span>Menú</span>
            </button>
            <button
              id="mobile-nav-orders"
              onClick={() => onChangeView('orders')}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
                currentView === 'orders' ? 'text-amber-500' : 'text-slate-400'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              <span>Mis Pedidos</span>
            </button>
            <button
              id="mobile-nav-profile"
              onClick={() => onChangeView('profile')}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
                currentView === 'profile' ? 'text-amber-500' : 'text-slate-400'
              }`}
            >
              <UserIcon className="h-4 w-4" />
              <span>Mi Cuenta</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
