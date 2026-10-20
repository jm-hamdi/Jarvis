import { useState } from "react";
import Navbar from "./components/Navbar";
import StatusBanner from "./components/StatusBanner";
import ShopPage from "./components/ShopPage";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import ConfirmPage from "./components/ConfirmPage";
import { useHealth } from "./hooks/useHealth";

export type Page = "shop" | "cart" | "checkout" | "confirm";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  qty: number;
}

export interface Order {
  id: string;
  total: number;
  items: CartItem[];
}

export default function App() {
  const health              = useHealth(4000);
  const [page, setPage]     = useState<Page>("shop");
  const [cart, setCart]     = useState<CartItem[]>([]);
  const [order, setOrder]   = useState<Order | null>(null);

  const addToCart = (item: Omit<CartItem, "qty">) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id: number, qty: number) => {
    if (qty === 0) setCart(prev => prev.filter(i => i.id !== id));
    else setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <StatusBanner status={health} />
      <Navbar cartCount={totalItems} onCart={() => setPage("cart")} onLogo={() => setPage("shop")} />

      <main className="flex-1">
        {page === "shop"     && <ShopPage onAdd={addToCart} onCart={() => setPage("cart")} />}
        {page === "cart"     && <CartPage cart={cart} onUpdate={updateQty} onShop={() => setPage("shop")} onCheckout={() => setPage("checkout")} />}
        {page === "checkout" && <CheckoutPage cart={cart} onBack={() => setPage("cart")} onSuccess={(o) => { setOrder(o); setCart([]); setPage("confirm"); }} />}
        {page === "confirm"  && order && <ConfirmPage order={order} onShop={() => { setOrder(null); setPage("shop"); }} />}
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
        © 2026 ShopLab · PROJECT RESILIENCE-ALPHA
      </footer>
    </div>
  );
}
