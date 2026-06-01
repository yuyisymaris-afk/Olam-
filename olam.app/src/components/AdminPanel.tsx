import { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { ClipboardList, Shield, RefreshCw, Layers, TrendingUp, Users, DollarSign, Package, ChefHat, CheckSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminPanelProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export default function AdminPanel({ orders, onUpdateOrderStatus }: AdminPanelProps) {
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  const filteredOrders = orders.filter((order) => {
    return filterStatus === 'Todos' || order.status === filterStatus;
  });

  const calculateTotalSales = () => {
    return orders
      .filter((o) => o.status !== 'Cancelado')
      .reduce((total, o) => total + o.total, 0);
  };

  const calculateSalesByStatus = (status: OrderStatus) => {
    return orders.filter((o) => o.status === status).length;
  };

  const formattedPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadgeColor = (status: OrderStatus) => {
    if (status === 'Pendiente') return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
    if (status === 'En Preparación') return 'bg-indigo-500/10 border-indigo-505/30 text-indigo-400';
    if (status === 'Enviado') return 'bg-sky-505/10 border-sky-500/30 text-sky-400';
    if (status === 'Entregado') return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    return 'bg-rose-500/10 border-rose-500/30 text-rose-450';
  };

  // Build some custom statistic counts for the Bento metrics cards
  const totalCompleted = calculateSalesByStatus('Entregado');
  const totalPending = calculateSalesByStatus('Pendiente');
  const totalPreparing = calculateSalesByStatus('En Preparación');
  const totalCancelled = calculateSalesByStatus('Cancelado');

  return (
    <div id="admin-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans space-y-8">
      {/* Admin Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold uppercase tracking-wider font-mono">
            <Shield className="h-4 w-4 text-indigo-400" />
            Panel de Operaciones de Administración
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Consola de Pedidos y Cocina</h2>
          <p className="text-xs text-slate-400">
            RF 7: Facturación administrativa y despacho en lote. Control integral de recetas personalizadas de clientes.
          </p>
        </div>

        {/* Status statistics tracker bar */}
        <div className="flex flex-wrap gap-2">
          {['Todos', 'Pendiente', 'En Preparación', 'Enviado', 'Entregado', 'Cancelado'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filterStatus === st
                  ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow'
                  : 'bg-slate-950/80 border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Admin metrics bento stack */}
      <div id="admin-bento-metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales metric card */}
        <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Ventas Aseguradas</span>
            <p className="text-sm sm:text-base font-extrabold text-white mt-1 font-mono">{formattedPrice(calculateTotalSales())}</p>
          </div>
        </div>

        {/* Pending metric card */}
        <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex items-center space-x-3.5">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Package className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Nuevos Pendientes</span>
            <p className="text-sm sm:text-base font-extrabold text-white mt-1 font-mono">{totalPending} órdenes</p>
          </div>
        </div>

        {/* Cooking metric card */}
        <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex items-center space-x-3.5">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">En Preparación</span>
            <p className="text-sm sm:text-base font-extrabold text-white mt-1 font-mono">{totalPreparing} platos</p>
          </div>
        </div>

        {/* Cancellation metric card */}
        <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl flex items-center space-x-3.5">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Cancelados</span>
            <p className="text-sm sm:text-base font-extrabold text-white mt-1 font-mono">{totalCancelled} pedidos</p>
          </div>
        </div>
      </div>

      {/* Orders List Queue */}
      <div id="orders-admin-stack" className="space-y-4">
        <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-800">
          <ClipboardList className="h-4.5 w-4.5 text-slate-400" />
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">Cola de Trabajo de Despacho</h3>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-850 rounded-2xl text-slate-550">
            Ninguna orden coincide con el estado seleccionado en el filtro.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                id={`admin-order-card-${order.id}`}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                {/* Header detail */}
                <div className="p-4 bg-slate-950/40 border-b border-slate-850/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9.5px] font-mono text-slate-500 font-bold block mb-0.5">ORDEN: {order.id.toUpperCase()}</span>
                    <h4 className="font-extrabold text-white">{order.customerName}</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5 font-mono">{order.customerPhone}</p>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md border text-[9px] font-black tracking-wider uppercase ${getStatusBadgeColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Sub contents (Recipe items customized specifically) */}
                <div className="p-4 flex-1 space-y-3.5 text-xs">
                  <div className="space-y-2">
                    <p className="text-[8.5px] font-mono text-slate-500 uppercase tracking-widest font-bold">Instrucciones de Cocina / Receta</p>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.cartItemId} className="p-2.5 bg-slate-950 rounded-xl border border-slate-850/60 leading-tight">
                          <div className="flex justify-between font-bold text-white items-baseline">
                            <span className="pr-3 text-slate-200">{item.product.name} (Cantidad: {item.quantity})</span>
                            <span className="font-mono text-[11px] text-slate-450 shrink-0">{formattedPrice(item.totalPrice)}</span>
                          </div>

                          {/* Detail of removes/addons */}
                          {(item.removedIngredients.length > 0 || item.addedIngredients.length > 0) && (
                            <div className="mt-2 space-y-1 p-1.5 bg-slate-900 border border-slate-850 rounded-lg">
                              {item.removedIngredients.map((rem) => (
                                <p key={rem} className="text-[9px] text-rose-450 font-medium">
                                  ⚠️ QUITAR: {rem}
                                </p>
                              ))}
                              {item.addedIngredients.map((add) => (
                                <p key={add.name} className="text-[9px] text-emerald-400 font-semibold">
                                  ➕ AGREGAR: {add.name}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operational Logistics details */}
                  <div className="pt-3 border-t border-slate-850 grid grid-cols-2 gap-3 text-[10.5px]">
                    <div>
                      <p className="text-slate-500 uppercase tracking-wider font-mono text-[8px]">Dirección de Envío</p>
                      <p className="text-slate-300 truncate mt-0.5 font-medium">{order.customerAddress}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 uppercase tracking-wider font-mono text-[8px]">Pago / Total</p>
                      <p className="text-white font-bold font-mono mt-0.5">{order.paymentMethod} - <span className="text-amber-500 font-black">{formattedPrice(order.total)}</span></p>
                    </div>
                  </div>
                </div>

                {/* Status modifier footer */}
                {order.status !== 'Cancelado' && order.status !== 'Entregado' && (
                  <div className="p-3 bg-slate-950/60 border-t border-slate-850/80 flex gap-2 font-sans overflow-x-auto">
                    <span className="text-[9.5px] font-mono text-slate-500 uppercase font-bold self-center mr-1">Avanzar a:</span>
                    {order.status === 'Pendiente' && (
                      <button
                        id={`btn-status-prepare-${order.id}`}
                        onClick={() => onUpdateOrderStatus(order.id, 'En Preparación')}
                        className="flex-1 py-1 px-2.5 bg-indigo-600 hover:bg-indigo-550 text-white text-[10px] font-extrabold rounded-lg transition-transform hover:scale-102 uppercase"
                      >
                        Preparación
                      </button>
                    )}
                    {order.status === 'En Preparación' && (
                      <button
                        id={`btn-status-ship-${order.id}`}
                        onClick={() => onUpdateOrderStatus(order.id, 'Enviado')}
                        className="flex-1 py-1 px-2.5 bg-sky-500 hover:bg-sky-450 text-slate-950 text-[10px] font-extrabold rounded-lg transition-transform hover:scale-102 uppercase"
                      >
                        Enviado (Domicilio)
                      </button>
                    )}
                    {order.status === 'Enviado' && (
                      <button
                        id={`btn-status-deliver-${order.id}`}
                        onClick={() => onUpdateOrderStatus(order.id, 'Entregado')}
                        className="flex-1 py-1 px-2.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-[10px] font-extrabold rounded-lg transition-transform hover:scale-102 uppercase flex items-center justify-center gap-1"
                      >
                        <CheckSquare className="h-3.5 w-3.5" />
                        Completar
                      </button>
                    )}

                    {/* Quick cancel by admin option */}
                    <button
                      id={`btn-status-cancel-${order.id}`}
                      onClick={() => onUpdateOrderStatus(order.id, 'Cancelado')}
                      className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 text-[10px] font-bold border border-rose-500/15 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
