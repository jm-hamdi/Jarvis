import { useEffect, useState } from "react";
import { checkHealth } from "../lib/api";

export type HealthStatus = "up" | "down" | "degraded" | "checking";

export function useHealth(intervalMs = 4000) {
  const [status, setStatus] = useState<HealthStatus>("checking");

  useEffect(() => {
    const check = async () => {
      const s = await checkHealth();
      setStatus(s);
    };
    check();
    const id = setInterval(check, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return status;
}
