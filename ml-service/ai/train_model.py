import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib

# ======================
# CONFIG
# ======================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "pipeline_data")
MODEL_DIR = os.path.join(DATA_DIR, "models")

os.makedirs(MODEL_DIR, exist_ok=True)

# ======================
# FIND AVAILABLE SYMBOLS
# ======================

symbols = [
    d for d in os.listdir(DATA_DIR)
    if os.path.isdir(os.path.join(DATA_DIR, d))
    and d != "models"
]

if not symbols:
    raise RuntimeError("No symbol folders found.")

print("\nAvailable symbols:")
for i, s in enumerate(symbols, start=1):
    print(f"{i}. {s}")

print("\n0. Train ALL symbols")

choice = input("\nChoose symbol number: ").strip()

if choice == "0":
    selected_symbols = symbols
else:
    idx = int(choice) - 1

    if idx < 0 or idx >= len(symbols):
        raise ValueError("Invalid choice")

    selected_symbols = [symbols[idx]]
def load_interval(symbol_folder, interval):

    file_name = f"processed_EURUSD=X_{interval}.csv"

    path = os.path.join(
        symbol_folder,
        file_name
    )

    print("\nLOADING:")
    print(path)

    df = pd.read_csv(
        path,
        index_col="timestampUTC",
        parse_dates=True
    )

    print(
        "Rows loaded:",
        len(df)
    )

    return df

def build_multitimeframe_dataset(symbol_folder):

    # ======================
    # Load 5m (MASTER DATASET)
    # ======================

    df_5m = load_interval(symbol_folder, "5m")

    df_5m = (
        df_5m
        .sort_index()
        .loc[~df_5m.index.duplicated(keep="last")]
    )

    target = df_5m["target"].copy()

    merged = df_5m.drop(
        columns=["target"],
        errors="ignore"
    ).copy()

    print("5m rows:", len(merged))

    # ======================
    # Higher Timeframes
    # ======================

    intervals = ["15m", "30m", "1h", "1d"]

    for interval in intervals:

        df_other = load_interval(
            symbol_folder,
            interval
        )

        df_other = (
            df_other
            .sort_index()
            .loc[
                ~df_other.index.duplicated(
                    keep="last"
                )
            ]
        )

        print(
            f"{interval} rows:",
            len(df_other)
        )

        # Remove target from higher TFs
        df_other = df_other.drop(
            columns=["target"],
            errors="ignore"
        )

        # Rename columns
        rename_cols = {
            col: f"{col}_{interval}"
            for col in df_other.columns
        }

        df_other = df_other.rename(
            columns=rename_cols
        )

        # Align to 5m timeline
        df_other = df_other.reindex(
            merged.index
        )

        # Forward fill
        df_other = df_other.ffill()

        # Join
        merged = merged.join(
            df_other,
            how="left"
        )

    # ======================
    # Restore target
    # ======================

    merged["target"] = target

    # Fill any remaining gaps
    merged = merged.ffill().bfill()

    print(
        "\nFinal merged shape:",
        merged.shape
    )

    return merged
# ======================
# TRAIN LOOP
# ======================

for symbol in selected_symbols:

    print("\n" + "=" * 60)
    print(f"📈 Training Symbol: {symbol}")
    print("=" * 60)

    symbol_folder = os.path.join(DATA_DIR, symbol)

    csv_files = [
        f for f in os.listdir(symbol_folder)
        if f.lower().endswith(".csv")
    ]

    if not csv_files:
        print("⚠️ No CSV files found.")
        continue

    print("\n📂 Using files:")
    for f in csv_files:
        print(" -", f)

    df = build_multitimeframe_dataset(
    symbol_folder
    )


        

    print(f"\nTotal rows: {len(df)}")

    # ======================
    # TARGET CHECK
    # ======================

    numeric = df.select_dtypes(include=[np.number]).copy()

    if "target" not in numeric.columns:
        print("⚠️ target column missing.")
        continue

    X = numeric.drop(columns=["target"], errors="ignore")
    y = numeric["target"].astype(int)

    if len(X) == 0:
        print("⚠️ Empty dataset.")
        continue

    X = X.ffill().bfill()

    print("Features shape:", X.shape)

    print("\nTarget distribution:")
    print(y.value_counts(normalize=True))

    # ======================
    # SPLIT
    # ======================

    split = int(len(X) * 0.8)

    if split == 0:
        print("⚠️ Not enough rows.")
        continue

    X_train = X.iloc[:split]
    X_test = X.iloc[split:]

    y_train = y.iloc[:split]
    y_test = y.iloc[split:]

    print(
        f"\nTrain size: {len(X_train)} | "
        f"Test size: {len(X_test)}"
    )

    # ======================
    # TRAIN
    # ======================

    print("\n🤖 Training RandomForest...")

    model = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    )

    model.fit(X_train, y_train)

    # ======================
    # EVALUATE
    # ======================

    print("\n📊 Classification Report")

    y_pred = model.predict(X_test)

    print(
        classification_report(
            y_test,
            y_pred,
            zero_division=0
        )
    )

    print("\nConfusion Matrix")
    print(confusion_matrix(y_test, y_pred))

    # ======================
    # FEATURE IMPORTANCE
    # ======================

    print("\n🔥 Top 15 Features")

    feat_imp = pd.Series(
        model.feature_importances_,
        index=X_train.columns
    ).sort_values(ascending=False)

    print(feat_imp.head(15))

    # ======================
    # BACKTEST
    # ======================

    if "close" in df.columns:

        print("\n💹 Backtest")

        y_prob = model.predict_proba(X_test)[:, 1]

        test_df = pd.DataFrame({
            "close": df.iloc[split:]["close"],
            "y_true": y_test,
            "y_pred": y_pred,
            "y_prob": y_prob
        })

        test_df["next_return"] = (
            test_df["close"].shift(-6)
            / test_df["close"]
            - 1
        )

        test_df["strat_ret"] = np.where(
            test_df["y_pred"] == 1,
            test_df["next_return"],
            0
        )

        test_df.dropna(inplace=True)

        if len(test_df):

            strategy_return = (
                (1 + test_df["strat_ret"]).cumprod().iloc[-1] - 1
            )

            buy_hold_return = (
                (1 + test_df["next_return"]).cumprod().iloc[-1] - 1
            )

            print(
                f"Strategy Return: {strategy_return:.4f}"
            )

            print(
                f"Buy & Hold Return: {buy_hold_return:.4f}"
            )

    # ======================
    # SAVE MODEL
    # ======================

    model_path = os.path.join(
        MODEL_DIR,
        f"{symbol}_rf.pkl"
    )

    joblib.dump(model, model_path)

    print(f"\n✅ Saved model:")
    print(model_path)

print("\n🎉 Training completed.")