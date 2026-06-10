import os
import json
import joblib
import pandas as pd

from utils import (
    build_multitimeframe_dataset
)
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

symbol = "EURUSD=X"

MODEL_PATH = os.path.join(
    BASE_DIR,
    "pipeline_data",
    "models",
    f"{symbol}_rf.pkl"
)

try:

    # ======================
    # LOAD MODEL
    # ======================

    model = joblib.load(MODEL_PATH)

    # ======================
    # BUILD SAME DATASET
    # AS TRAINING
    # ======================

    symbol_folder = os.path.join(
        BASE_DIR,
        "pipeline_data",
        symbol
    )

    df = build_multitimeframe_dataset(
        symbol_folder
    )
    print(df.index.min())
    print(df.index.max())

    # ======================
    # FEATURES
    # ======================

    numeric = df.select_dtypes(
        include=["number"]
    ).copy()

    X = numeric.drop(
        columns=["target"],
        errors="ignore"
    )

    X = X.ffill().bfill()

    latest = X.iloc[[-1]]
    print(latest)

    # ======================
    # DEBUG
    # ======================

    print(
        f"Expected features: {len(model.feature_names_in_)}"
    )

    print(
        f"Current features: {len(latest.columns)}"
    )

    missing = set(
        model.feature_names_in_
    ) - set(latest.columns)

    print(
        f"Missing features: {len(missing)}"
    )

    # ======================
    # PREDICT
    # ======================

    prediction = int(
        model.predict(latest)[0]
    )

    confidence = round(
        float(
            model.predict_proba(latest)[0].max()
        ) * 100,
        2
    )

    result = {
        "symbol": symbol,
        "prediction30m":
            "UP" if prediction == 1 else "DOWN",
        "confidence30m": confidence
    }

    print(json.dumps(result))

except Exception as e:

    print(
        json.dumps({
            "error": str(e)
        })
    )