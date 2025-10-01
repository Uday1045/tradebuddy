import os
import pandas as pd
import numpy as np

# =======================
# Indicator Calculations
# =======================

def calculate_sma(series, period=14):
    return series.rolling(window=period, min_periods=1).mean()

def calculate_ema(series, period=14):
    return series.ewm(span=period, adjust=False, min_periods=1).mean()

def calculate_rsi(series, period=14):
    delta = series.diff()
    gain = np.where(delta > 0, delta, 0)
    loss = np.where(delta < 0, -delta, 0)
    avg_gain = pd.Series(gain, index=series.index).rolling(period, min_periods=1).mean()
    avg_loss = pd.Series(loss, index=series.index).rolling(period, min_periods=1).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_macd(series, fast=12, slow=26, signal=9):
    ema_fast = series.ewm(span=fast, adjust=False, min_periods=1).mean()
    ema_slow = series.ewm(span=slow, adjust=False, min_periods=1).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False, min_periods=1).mean()
    hist = macd_line - signal_line
    return macd_line, signal_line, hist

def calculate_bollinger(series, period=20, num_std=2):
    sma = series.rolling(period, min_periods=1).mean()
    std = series.rolling(period, min_periods=1).std()
    upper = sma + num_std * std
    lower = sma - num_std * std
    return upper, lower

# =======================
# File Processing
# =======================

def process_stock_file(df):
    # Ensure timestampUTC is datetime
    df['timestampUTC'] = pd.to_datetime(df['timestampUTC'], utc=True, errors='coerce')
    df['localTime'] = df['localTime'].astype(str).str.strip()

# Convert 24:00:00 → 00:00:00 and add 1 day to timestampUTC
    mask = df['localTime'].str.startswith("24:")
    df.loc[mask, 'localTime'] = "00:00:00"
    df.loc[mask, 'timestampUTC'] = pd.to_datetime(df.loc[mask, 'timestampUTC']) + pd.Timedelta(days=1)
    df.set_index('timestampUTC', inplace=True)
    

    # Strip column names
    df.columns = df.columns.str.strip()

    # Indicators
    df['movingAverage'] = calculate_sma(df['close'])
    df['ema'] = calculate_ema(df['close'])
    df['rsi'] = calculate_rsi(df['close'])

    macd_line, signal_line, hist = calculate_macd(df['close'])
    df['macd'] = macd_line
    df['macd_signal'] = signal_line
    df['macd_hist'] = hist

    upper, lower = calculate_bollinger(df['close'])
    df['bollingerUpper'] = upper
    df['bollingerLower'] = lower
    df["target"] = (df["close"].shift(-1) > df["close"]).astype(int)
    df.dropna(inplace=True)

    # Fill missing values
    df.fillna(method='ffill', inplace=True)
    df.fillna(method='bfill', inplace=True)

    return df

# =======================
# Main Pipeline
# =======================

def run_pipeline(input_folder="../data", output_folder="../pipeline_data"):
    os.makedirs(output_folder, exist_ok=True)

    for file_name in os.listdir(input_folder):
        if not file_name.endswith(".csv"):
            continue

        file_path = os.path.join(input_folder, file_name)
        df = pd.read_csv(file_path)

        processed_df = process_stock_file(df)

        # Save CSV with timestampUTC as index and no extra columns
        output_path = os.path.join(output_folder, f"processed_{file_name}")
        processed_df.to_csv(output_path, index=True)

        print(f"✅ Saved processed file: {output_path}")

# =======================
# Run
# =======================

if __name__ == "__main__":
    run_pipeline(input_folder="../data", output_folder="../pipeline_data")
