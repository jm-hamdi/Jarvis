import { CheckCircle, Package } from "lucide-react";
import type { Order } from "../App";

interface Props {
  order: Order;
  onShop: () => void;
}

export default function ConfirmPage({ order, onShop }: Props) {
  return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6">
        <CheckCircle size={32} className="text-emerald-600" strokeWidth={1.5} />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
      <p className="text-slate-500 mb-1">Thank you for your purchase.</p>
      <p className="text-xs text-slate-400 font-mono mb-8">Order ID: {order.id}</p>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-left mb-6">
        <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm">
          <Package size={15} className="text-blue-600" /> Items ordered
        </h2>
        <div className="flex flex-col gap-2">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-3 text-sm">
              <span className="text-xl">{item.image}</span>
              <span className="flex-1 text-slate-700">{item.name} × {item.qty}</span>
              <span className="font-semibold text-slate-900">{(item.price * item.qty).toFixed(2)} €</span>
            </div>
          ))}
          <div className="border-t border-slate-100 pt-2 mt-1 flex justify-between font-bold text-slate-900">
            <span>Total paid</span>
            <span>{order.total.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      <button
        onClick={onShop}
        className="px-8 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-blue-600 transition"
      >
        Continue Shopping
      </button>
    </div>
  );
}
