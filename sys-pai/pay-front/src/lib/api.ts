const BASE = import.meta.env.VITE_API_URL ?? "";

export async function login(username: string, password: string): Promise<string> {
  const form = new URLSearchParams({ username, password });
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  const data = await res.json();
  return data.access_token;
}

export async function makePayment(
  _token: string,
  amount: number,
  currency: string
): Promise<{ id: string; status: string; amount: number; currency: string; created_at: string }> {
  const res = await fetch(`${BASE}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency, user_id: 1 }),
  });
  if (!res.ok) throw new Error(`Payment failed (${res.status})`);
  return res.json();
}

export async function checkHealth(): Promise<"up" | "down" | "degraded"> {
  try {
    const res = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) return "up";
    return "degraded";
  } catch {
    return "down";
  }
}
