import { ShoppingCart, Star } from "lucide-react";
import type { CartItem } from "../App";

const PRODUCTS: Omit<CartItem, "qty">[] = [
  { id: 1, name: "Wireless Headphones",  price: 89.99,  image: "🎧" },
  { id: 2, name: "Mechanical Keyboard",  price: 129.00, image: "⌨️" },
  { id: 3, name: "USB-C Hub 7-in-1",     price: 49.99,  image: "🔌" },
  { id: 4, name: "Webcam 4K Pro",        price: 199.00, image: "📷" },
  { id: 5, name: "Desk Lamp LED",        price: 34.99,  image: "💡" },
  { id: 6, name: "Mouse Ergonomic",      price: 59.99,  image: "🖱️" },
  { id: 7, name: "Monitor Stand",        price: 44.00,  image: "🖥️" },
  { id: 8, name: "Laptop Backpack",      price: 79.99,  image: "🎒" },
];

interface Props {
  onAdd: (item: Omit<CartItem, "qty">) => void;
  onCart: () => void;
}

export default function ShopPage({ onAdd, onCart }: Props) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">New Arrivals</h1>
        <p className="text-slate-500">Premium tech accessories, delivered fast.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {PRODUCTS.map(product => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition group"
          >
            {/* Image area */}
            <div className="h-36 bg-slate-50 flex items-center justify-center text-5xl border-b border-slate-100 group-hover:bg-slate-100 transition">
              {product.image}
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-slate-800 text-sm leading-tight mb-1">{product.name}</h3>

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                ))}
                <span className="text-[11px] text-slate-400 ml-1">(24)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{product.price.toFixed(2)} €</span>
                <button
                  onClick={() => { onAdd(product); onCart(); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-blue-600 transition"
                >
                  <ShoppingCart size={12} />
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
