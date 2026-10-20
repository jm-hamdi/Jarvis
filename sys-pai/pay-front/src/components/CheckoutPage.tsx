import { useState } from "react";
import { ArrowLeft, CreditCard, Lock, Loader, ShieldCheck, XCircle } from "lucide-react";
import { makePayment } from "../lib/api";
import type { CartItem, Order } from "../App";

interface Props {
  cart: CartItem[];
  onBack: () => void;
  onSuccess: (order: Order) => void;
}

export default function CheckoutPage({ cart, onBack, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Form fields (visual only except amount)
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    address: "", city: "", zip: "",
    card: "4242 4242 4242 4242", expiry: "12/28", cvv: "123",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 100 ? 0 : 5.99;
  const total    = subtotal + shipping;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const tx = await makePayment("", total, "EUR");
      onSuccess({ id: tx.id, total, items: cart });
    } catch (err: any) {
      setError(err.message ?? "Payment failed. The service may be under incident.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6 transition">
        <ArrowLeft size={15} /> Back to cart
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-8">Checkout</h1>

      <form onSubmit={handlePay}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Forms ─────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Shipping */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Shipping Information</h2>
              <div className="grid grid-cols-2 gap-3">
                {/* <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">First name</label>
                  <input type="text" value={form.firstName} onChange={set("firstName")} placeholder="John" required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Last name</label>
                  <input type="text" value={form.lastName} onChange={set("lastName")} placeholder="Doe" required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div> */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="john@email.com"
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                {/* <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
                  <input type="text" value={form.address} onChange={set("address")} placeholder="123 Main St" required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                  <input type="text" value={form.city} onChange={set("city")} placeholder="Paris" required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">ZIP code</label>
                  <input type="text" value={form.zip} onChange={set("zip")} placeholder="75001" required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div> */}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <CreditCard size={16} className="text-blue-600" />
                Payment Details
              </h2>
              <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                <Lock size={11} /> Secured by JARVIS WAF
              </p>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Card number</label>
                  <input
                    value={form.card}
                    onChange={set("card")}
                    placeholder="4242 4242 4242 4242"
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Expiry date</label>
                    <input
                      value={form.expiry}
                      onChange={set("expiry")}
                      placeholder="MM/YY"
                      required
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">CVV</label>
                    <input
                      value={form.cvv}
                      onChange={set("cvv")}
                      placeholder="123"
                      required
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Order Summary ─────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-semibold text-slate-800 mb-4">Order Summary</h2>
              <div className="flex flex-col gap-2 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{item.image}</span>
                    <span className="flex-1 text-slate-600 truncate">{item.name} × {item.qty}</span>
                    <span className="font-medium text-slate-800">{(item.price * item.qty).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-3 flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span><span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `${shipping.toFixed(2)} €`}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-base pt-1 border-t border-slate-100 mt-1">
                  <span>Total</span><span>{total.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading
                ? <><Loader size={16} className="animate-spin-slow" /> Processing…</>
                : <><Lock size={15} /> Pay {total.toFixed(2)} €</>
              }
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={13} className="text-emerald-500" />
              Secured · Encrypted · Protected by JARVIS WAF
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
