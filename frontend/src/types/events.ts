export type ServiceName =
  | "frontend"
  | "pay-front"
  | "payment-api"
  | "auth-service"
  | "db"
  | "waf";

export type JarvisEvent =
  | {
      type: "service_status";
      ts: string;
      service: ServiceName;
      status: "up" | "down" | "degraded";
      latency_ms: number;
    }
  | {
      type: "alert";
      ts: string;
      source: "waf" | "wazuh";
      severity: "low" | "medium" | "high" | "critical";
      attack_type: string;
      src_ip: string;
      message: string;
    }
  | {
      type: "anomaly_score";
      ts: string;
      score: number;
      threshold: number;
    }
  | {
      type: "anomaly_detected";
      ts: string;
      incident_id: string;
      incident_type:
        | "flood"
        | "bruteforce"
        | "sqli"
        | "service_down"
        | "db_corruption"
        | "secret_leak";
      score: number;
    }
  | {
      type: "remediation_step";
      ts: string;
      incident_id: string;
      step: "detection" | "decision" | "remediation" | "verification";
      status: "running" | "done" | "failed";
      action?: string;
    }
  | {
      type: "transaction";
      ts: string;
      tx_per_min: number;
      last_test: { ok: boolean; tx_id?: string; ts: string };
    }
  | {
      type: "recovered";
      ts: string;
      incident_id: string;
      mttr_seconds: number;
    };

export type SystemState =
  | "OPTIMAL"
  | "UNDER ATTACK"
  | "RECOVERING"
  | "RECOVERED";
