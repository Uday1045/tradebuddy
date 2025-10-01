import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_curve
from sklearn.model_selection import train_test_split

# ======================
# 1. LOAD DATA
# ======================
print("📂 Loading processed data...")

data_folder = "../pipeline_data"
all_files = [f for f in os.listdir(data_folder) if f.endswith(".csv")]

print("📂 Using files:")
for f in all_files:
    print(" -", f)

dfs = []
for f in all_files:
    df_temp = pd.read_csv(os.path.join(data_folder, f), index_col="timestampUTC", parse_dates=True)
    # keep track of interval (optional)
    interval_tag = f.split("_")[-1].replace(".csv","")
    df_temp["interval"] = interval_tag
    dfs.append(df_temp)

df = pd.concat(dfs).sort_index()


# ======================
# 2. PREPARE FEATURES & TARGET
# ======================
print("\n🔧 Preparing features and target...")

# Keep numeric only (drop things like localTime)
numeric = df.select_dtypes(include=[np.number]).copy()

if "target" not in numeric:
    raise RuntimeError("No 'target' column found in processed CSVs")

X = numeric.drop(columns=["target"], errors="ignore")
y = numeric["target"].astype(int)

print("Features shape:", X.shape)
print("Target distribution:\n", y.value_counts(normalize=True))


# ======================
# 3. TRAIN-TEST SPLIT
# ======================
print("\n✂️ Splitting train/test sets...")

split = int(0.8 * len(df))  # 80% train, 20% test
X_train, X_test = (
    X.iloc[:split].fillna(method='ffill').fillna(method='bfill'),
    X.iloc[split:].fillna(method='ffill').fillna(method='bfill')
)
y_train, y_test = y.iloc[:split], y.iloc[split:]

print("Train size:", len(X_train), "| Test size:", len(X_test))


# ======================
# 4. TRAIN MODEL
# ======================
print("\n🤖 Training RandomForest model...")

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    class_weight="balanced",   # handles imbalance
    n_jobs=-1
)
model.fit(X_train, y_train)


# ======================
# 5. EVALUATE MODEL
# ======================
print("\n📊 Classification Report:")
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))


# ======================
# 6. FEATURE IMPORTANCE
# ======================
print("\n🔥 Top 15 Feature Importances:")
feat_imp = pd.Series(model.feature_importances_, index=X_train.columns).sort_values(ascending=False)
print(feat_imp.head(15))


# ======================
# 7. BACKTEST (OPTIONAL)
# ======================
print("\n💹 Running simple backtest (long-only on predicted=1)...")

y_prob = model.predict_proba(X_test)[:,1]
test_df = pd.DataFrame({
    "close": df.iloc[split:]["close"],
    "y_true": y_test,
    "y_pred": y_pred,
    "y_prob": y_prob
})
test_df["next_return"] = test_df["close"].shift(-1) / test_df["close"] - 1.0
test_df["strat_ret"] = np.where(test_df["y_pred"]==1, test_df["next_return"], 0.0)
test_df.dropna(inplace=True)

cum_strategy = (1 + test_df["strat_ret"]).cumprod().iloc[-1] - 1
cum_bh = (1 + test_df["next_return"]).cumprod().iloc[-1] - 1

print(f"Strategy cumulative return: {cum_strategy:.4f}")
print(f"Buy & Hold return: {cum_bh:.4f}")
