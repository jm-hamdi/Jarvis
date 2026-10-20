import { Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import type { CartItem } from "../App";

interface Props {
  cart: CartItem[];
  onUpdate: (id: number, qty: number) => void;
  onShop: () => void;
  onCheckout: () => void;
}

export default function CartPage({ cart, onUpdate, onShop, onCheckout }: Props) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 100 ? 0 : 5.99;
  const total    = subtotal + shipping;

  if (cart.length === 0) return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" strokeWidth={1} />
      <h2 className="text-xl font-semibold text-slate-700 mb-2">Your cart is empty</h2>
      <p className="text-slate-400 mb-6">Add some products to get started.</p>
      <button onClick={onShop} className="px-6 py-2.5 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-blue-600 transition">
        Browse Shop
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button onClick={onShop} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6 transition">
        <ArrowLeft size={15} /> Continue shopping
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Items */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {cart.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
                {item.image}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{item.name}</p>
                <p className="text-slate-500 text-sm">{item.price.toFixed(2)} €</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onUpdate(item.id, item.qty - 1)} className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition flex items-center justify-center font-bold text-sm">−</button>
                <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                <button onClick={() => onUpdate(item.id, item.qty + 1)} className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition flex items-center justify-center font-bold text-sm">+</button>
              </div>
              <p className="font-bold text-slate-900 w-16 text-right text-sm">{(item.price * item.qty).toFixed(2)} €</p>
              <button onClick={() => onUpdate(item.id, 0)} className="text-slate-300 hover:text-red-500 transition ml-1">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-fit">
          <h2 className="font-semibold text-slate-800 mb-4">Order Summary</h2>
          <div className="flex flex-col gap-2 text-sm mb-4">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `${shipping.toFixed(2)} €`}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900 text-base">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>
          {subtotal < 100 && (
            <p className="text-xs text-slate-400 mb-4">Add {(100 - subtotal).toFixed(2)} € more for free shipping.</p>
          )}
          <button
            onClick={onCheckout}
            className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-blue-600 transition"
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}
