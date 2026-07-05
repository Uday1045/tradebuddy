import os
import joblib
import pandas as pd

from ai.utils import build_multitimeframe_dataset


def predict_symbol(symbol):

    BASE_DIR = os.path.dirname(
        os.path.dirname(__file__)
    )

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
        # BUILD DATASET
        # ======================

        symbol_folder = os.path.join(
            BASE_DIR,
            "pipeline_data",
            symbol
        )
        file_path = os.path.join(
        BASE_DIR,
        "pipeline_data",
        symbol,
        "processed_EURUSD=X_5m.csv"
    )

        print("Modified:", os.path.getmtime(file_path))

        df = build_multitimeframe_dataset(
            symbol_folder
        )

        print(df.index.max())


        # ======================
        # CREATE FEATURES
        # ======================

        numeric = df.select_dtypes(
            include=["number"]
        ).copy()

        X = numeric.drop(
            columns=["target"],
            errors="ignore"
        )

        X = X.ffill().bfill()


        # Latest candle
        latest = X.iloc[[-1]]

        print("Latest features:")
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


        return {
            "symbol": symbol,
            "prediction30m":
                "UP" if prediction == 1 else "DOWN",
            "confidence30m": confidence
        }


    except Exception as e:

        return {
            "error": str(e)
        }


# ======================
# Local testing
# ======================

if __name__ == "__main__":

    result = predict_symbol(
        "EURUSD=X"
    )

    print(result)