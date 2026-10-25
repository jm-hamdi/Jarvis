"""Isolation Forest on Wazuh alert-count windows. SIMULATED baseline until real samples are supplied.
Training/inference schema is shared; never unpickle attacker-provided model files.
"""
import random
from sklearn.ensemble import IsolationForest

COLUMNS = ('events', 'auth_failed', 'payments_declined', 'blocked', 'probes', 'critical', 'unique_ips', 'service_down')


def features(alerts: list[dict], service_down: int = 0) -> list[int]:
    def is_auth(a): return str(a.get('rule_id')) in ('100210', '100211', '100223', '100224')
    def is_payment(a): return str(a.get('rule_id')) in ('100220', '100225', '100226')
    def is_probe(a): return str(a.get('rule_id')) in ('100212', '100213', '100214', '100215', '100216', '100217', '31101')
    return [
        len(alerts),
        sum(map(is_auth, alerts)),
        sum(map(is_payment, alerts)),
        sum(str(a.get('http_status')) in ('403', '429') for a in alerts),
        sum(map(is_probe, alerts)),
        sum(int(a.get('level') or 0) >= 12 for a in alerts),
        len({str(a.get('src_ip')) for a in alerts if a.get('src_ip')}),
        int(service_down),
    ]


def simulated_baseline(seed=42, count=850):
    """Lab bootstrap only; do not represent these samples as production measurements."""
    rng = random.Random(seed)
    rows = []
    for _ in range(count):
        events = rng.choices([0, 1, 2, 3], weights=[42, 37, 17, 4])[0]
        auth = rng.randrange(min(events, 2) + 1) if events else 0
        payments = rng.randrange(min(events, 2) + 1) if events else 0
        rows.append([events, auth, payments, rng.randrange(min(events, 2) + 1),
                     rng.randrange(min(events, 2) + 1), 0, min(events, 2), 0])
    return rows


def simulated_attacks(seed=420, count=140):
    rng = random.Random(seed)
    rows = []
    for _ in range(count):
        count_events = rng.randint(9, 45)
        rows.append([count_events, rng.randint(2, count_events), rng.randint(0, 4),
                     rng.randint(3, count_events), rng.randint(5, count_events),
                     rng.randint(1, 6), rng.randint(1, 4), rng.randint(0, 1)])
    return rows


def train_model(samples=None):
    baseline = samples if samples is not None else simulated_baseline()
    if len(baseline) < 100 or any(len(row) != len(COLUMNS) for row in baseline):
        raise ValueError('At least 100 feature windows with eight fields required')
    model = IsolationForest(n_estimators=140, max_samples='auto', contamination='auto', random_state=42, n_jobs=1)
    model.fit(baseline)
    scores = sorted(float(s) for s in model.decision_function(baseline))
    threshold = scores[max(0, int(0.05 * len(scores)))]
    return model, threshold


def prediction(model, threshold, vector):
    score = float(model.decision_function([vector])[0])
    return {
        'anomaly': bool(score < threshold),
        'score': round(score, 5),
        'threshold': round(threshold, 5),
        'features': dict(zip(COLUMNS, vector)),
    }


def report(model, threshold):
    normal = simulated_baseline(seed=313, count=400)
    attack = simulated_attacks(seed=411, count=200)
    fp = sum(prediction(model, threshold, x)['anomaly'] for x in normal)
    tp = sum(prediction(model, threshold, x)['anomaly'] for x in attack)
    return {
        'synthetic_only': True, 'test_normal': len(normal), 'test_attack': len(attack),
        'precision': round(tp / (tp + fp), 3) if tp + fp else 0,
        'recall': round(tp / len(attack), 3),
        'false_positive_rate': round(fp / len(normal), 3),
    }
