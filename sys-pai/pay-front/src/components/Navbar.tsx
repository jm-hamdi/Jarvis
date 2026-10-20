import { ShoppingCart, Store } from "lucide-react";

interface Props {
  cartCount: number;
  onCart: () => void;
  onLogo: () => void;
}

export default function Navbar({ cartCount, onCart, onLogo }: Props) {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <button onClick={onLogo} className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <Store size={16} color="white" strokeWidth={1.5} />
          </div>
          <span className="font-bold text-slate-900 text-lg">ShopLab</span>
        </button>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-6 text-sm text-slate-500 font-medium">
          <button onClick={onLogo} className="hover:text-slate-900 transition">Shop</button>
          <span className="hover:text-slate-900 transition cursor-pointer">About</span>
          <span className="hover:text-slate-900 transition cursor-pointer">Contact</span>
        </div>

        {/* Cart */}
        <button
          onClick={onCart}
          className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition"
        >
          <ShoppingCart size={16} />
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
