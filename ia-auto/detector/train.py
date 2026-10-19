"""
Train an Isolation Forest on normal_traffic samples.
Run once before starting the detector: python train.py
"""
import numpy as np
import joblib
from pathlib import Path
from sklearn.ensemble import IsolationForest

MODEL_PATH = Path("model/isolation_forest.joblib")

def train(n_samples: int = 500, contamination: float = 0.05):
    # Simulate normal traffic feature vectors [latency, error_rate, rps]
    rng = np.random.default_rng(42)
    X = np.column_stack([
        rng.normal(0.05, 0.01, n_samples),   # latency ~50ms
        rng.normal(0.001, 0.0005, n_samples), # error rate ~0.1%
        rng.normal(10, 2, n_samples),         # ~10 rps
    ])
    model = IsolationForest(n_estimators=100, contamination=contamination, random_state=42)
    model.fit(X)
    MODEL_PATH.parent.mkdir(exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    train()
