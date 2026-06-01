import { useState, useEffect } from 'react';
import { Order, CartItem } from '../types';
import { CheckCircle2, Clock, MapPin, Receipt, CreditCard, Ban, Edit3, ShieldAlert, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface InvoiceViewProps {
  orders: Order[];
  onCancelOrder: (orderId: string) => void;
  onModifyOrder: (order: Order) => void; // Triggering modify which puts it back in cart
}

export default function InvoiceView({ orders, onCancelOrder, onModifyOrder }: InvoiceViewProps) {
  const [timeLeftList, setTimeLeftList] = useState<{ [orderId: string]: string }>({});
  const [canModifyList, setCanModifyList] = useState<{ [orderId: string]: boolean }>({});

  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date().getTime();
      const updatedTimes: { [orderId: string]: string } = {};
      const updatedCanModify: { [orderId: string]: boolean } = {};

      orders.forEach((order) => {
        const orderTime = new Date(order.createdAt).getTime();
        const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in ms
        const limitTime = orderTime + thirtyMinutes;
        const diff = limitTime - now;

        if (diff > 0 && order.status === 'Pendiente') {
          const minutes = Math.floor((diff / 1000 / 60) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          updatedTimes[order.id] = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          updatedCanModify[order.id] = true;
        } else {
          updatedTimes[order.id] = '00:00';
          updatedCanModify[order.id] = false;
        }
      });

      setTimeLeftList(updatedTimes);
      setCanModifyList(updatedCanModify);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [orders]);

  const formattedPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadgeColor = (status: string) => {
    if (status === 'Pendiente') return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
    if (status === 'En Preparación') return 'bg-indigo-500/10 border-indigo-505/30 text-indigo-400';
    if (status === 'Enviado') return 'bg-sky-505/10 border-sky-500/30 text-sky-400';
    if (status === 'Entregado') return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
  };

  return (
    <div id="invoice-view-container" className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 font-sans space-y-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">RF 6 y 8</p>
        <h2 className="text-3xl font-light tracking-tighter text-white uppercase leading-none mt-1">Mis Facturas Electrónicas</h2>
        <p className="text-[11px] text-white/50 mt-1">
          Consulta el estado de tus pedidos y facturas vigentes. Recuerda que tienes una ventana máxima de 30 minutos para modificar o cancelar servicios.
        </p>
      </div>

      {orders.length === 0 ? (
        <div id="no-invoices-state" className="p-8 text-center bg-white/5 border border-white/10 rounded-sm space-y-2">
          <Receipt className="h-10 w-10 text-white/20 mx-auto stroke-[1.5]" />
          <p className="text-sm font-semibold text-white">Aún no has realizado pedidos</p>
          <p className="text-xs text-white/40">Regresa al menú e inicia tu primer orden de comida premium.</p>
        </div>
      ) : (
        <div id="historical-invoices-stack" className="space-y-6">
          {orders.map((order) => {
            const countdown = timeLeftList[order.id] || '30:00';
            const canModify = canModifyList[order.id];

            return (
              <div
                key={order.id}
                id={`invoice-card-${order.id}`}
                className="bg-slate-900 border border-white/10 rounded-sm overflow-hidden shadow-xl"
              >
                {/* Invoice Header details */}
                <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-slate-900 border border-white/10 rounded-sm text-amber-500">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Factura electrónica</p>
                      <h4 className="text-sm font-bold text-white tracking-tight">{order.invoiceId}</h4>
                    </div>
                  </div>

                  {/* Order state badge */}
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-sm border text-[10px] font-bold tracking-wide uppercase ${getStatusBadgeColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Main Content Layout */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5 border-b border-white/10 text-xs">
                  {/* Detailed Items list */}
                  <div className="col-span-1 md:col-span-2 space-y-3">
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold pb-1 border-b border-white/10">
                      Platos Ordenados
                    </p>
                    <div className="space-y-2.5">
                      {order.items.map((item) => (
                        <div key={item.cartItemId} className="flex gap-2 p-2 bg-white/5 rounded-sm border border-white/5">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-10 w-10 object-cover rounded-sm shrink-0 border border-white/5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between font-bold text-white">
                              <p className="truncate pr-2">{item.product.name} (x{item.quantity})</p>
                              <span className="font-mono">{formattedPrice(item.totalPrice)}</span>
                            </div>

                            {/* Customize labels for recipe changes */}
                            {(item.removedIngredients.length > 0 || item.addedIngredients.length > 0) && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {item.removedIngredients.map((r) => (
                                  <span key={r} className="text-[8.5px] bg-rose-500/10 text-rose-400 px-1 py-0.2 rounded border border-rose-500/15">
                                    Sin {r}
                                  </span>
                                ))}
                                {item.addedIngredients.map((a) => (
                                  <span key={a.name} className="text-[8.5px] bg-emerald-500/10 text-emerald-450 px-1 py-0.2 rounded border border-emerald-500/15">
                                    + {a.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Logistics, payment and ETA details */}
                  <div className="space-y-4 bg-white/5 p-3.5 rounded-sm border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold pb-1 border-b border-white/10">
                      Detalles de Entrega
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-start gap-1.5 text-[11px]">
                        <MapPin className="h-4 w-4 text-white/30 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-300">Dirección</p>
                          <p className="text-white/60 text-[10px]">{order.customerAddress}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5 text-[11px]">
                        <CreditCard className="h-4 w-4 text-white/30 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-300">Medio de Pago</p>
                          <p className="text-white/50 text-[10px] font-mono">{order.paymentMethod}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5 text-[11px]">
                        <Clock className="h-4 w-4 text-white/30 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-300">Tiempo de Llegada</p>
                          <p className="text-amber-500 text-[10px] font-semibold">{order.estimatedArrivalMinutes} min aprox.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex justify-between items-baseline leading-none">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">Total Facturado</p>
                      <p className="text-base font-black text-amber-500 font-mono">{formattedPrice(order.total)}</p>
                    </div>
                  </div>
                </div>

                {/* RF 8: Limit action bar (30 minutes cancellation logic) */}
                <div className="p-4 bg-white/5 border-t border-white/10 px-5 flex flex-wrap gap-4 items-center justify-between">
                  {order.status === 'Cancelado' ? (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold">
                      <Ban className="h-4 w-4" />
                      <span>Este pedido ya fue cancelado.</span>
                    </div>
                  ) : canModify ? (
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between w-full">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-amber-500 animate-pulse">
                        <Clock className="h-4 w-4 text-amber-500 spin-mini" />
                        <span>Ventana de cambio disponible: <strong className="font-mono bg-[#0A0A0A] border border-white/10 px-1.5 py-0.5 rounded-sm ml-1 text-white">{countdown}</strong> min</span>
                      </div>
                      
                      <div className="flex gap-3 justify-end w-full sm:w-auto">
                        {/* Modify button (puts back to cart) */}
                        <button
                          id={`btn-modify-${order.id}`}
                          onClick={() => onModifyOrder(order)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-sm border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Modificar</span>
                        </button>

                        {/* Cancel button */}
                        <button
                          id={`btn-cancel-${order.id}`}
                          onClick={() => onCancelOrder(order.id)}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 rounded-sm transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          <span>Cancelar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 px-3 bg-[#0A0A0A] border border-white/10 rounded-sm w-full text-xs text-white/50 leading-tight">
                      <ShieldAlert className="h-4.5 w-4.5 text-white/40 shrink-0" />
                      <span>
                        Han transcurrido más de <strong className="text-white font-sans font-bold">30 minutos</strong> dende la confirmación. Tu pedido se encuentra asegurado en cocina y ya no puede ser cancelado ni editado por políticas de restaurante.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
