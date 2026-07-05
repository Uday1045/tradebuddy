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
    df["timestampUTC"] = pd.to_datetime(
    df["timestampUTC"],
    utc=True,
    errors="coerce"
)

    df.set_index('timestampUTC', inplace=True)
    df["hour"] = df.index.hour
    df["day_of_week"] = df.index.dayofweek
    df["month"] = df.index.month

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

    # Binary target: next close > current close
    df["target"] = np.where(
    df["close"].shift(-6).isna(),
    np.nan,
    (df["close"].shift(-6) > df["close"]).astype(int)
    )


    # Drop rows with NaN after indicator calculations
    df = df.dropna(subset=["target"])
    # Fill any remaining missing values
    df = df.ffill()
    df = df.bfill()

    return df

# =======================
# Main Pipeline
# =======================

def run_pipeline(input_base="data", output_base="pipeline_data"):
    os.makedirs(output_base, exist_ok=True)

    # Loop through symbols inside ./data folder
    for symbol in os.listdir(input_base):
        symbol_path = os.path.join(input_base, symbol)
        if not os.path.isdir(symbol_path):
            continue  # skip non-folders

        print(f" Processing symbol: {symbol}")

        # Create symbol folder in output
        symbol_output_path = os.path.join(output_base, symbol)
        os.makedirs(symbol_output_path, exist_ok=True)

        # ✅ Loop through CSV files inside this symbol folder
        for file_name in os.listdir(symbol_path):
            if not file_name.endswith(".csv"):
                continue

            file_path = os.path.join(symbol_path, file_name)
            df = pd.read_csv(file_path)

            processed_df = process_stock_file(df).copy()
            processed_df["interval"] = interval
            # Extract interval from filename, e.g. EURUSD=X_5m.csv → "5m"
            interval = file_name.split("_")[-1].replace(".csv", "")

            # Output file
            output_file_name = f"processed_{file_name}"
            output_path = os.path.join(symbol_output_path, output_file_name)
            processed_df.to_csv(output_path, index=True)

            print(f" Saved processed file: {output_path}")



def process_symbol(symbol):
    """
    Process a single symbol folder.
    """

    BASE_DIR = os.path.dirname(os.path.dirname(__file__))

    input_base = os.path.join(
        BASE_DIR,
        "data"
    )

    output_base = os.path.join(
        BASE_DIR,
        "pipeline_data"
    )

    symbol_path = os.path.join(
        input_base,
        symbol
    )

    if not os.path.exists(symbol_path):
        raise Exception(
            f"Raw data not found for {symbol}"
        )

    symbol_output_path = os.path.join(
        output_base,
        symbol
    )

    os.makedirs(
        symbol_output_path,
        exist_ok=True
    )

    print(f"Processing {symbol}")

    for file_name in os.listdir(symbol_path):

        if not file_name.endswith(".csv"):
            continue

        file_path = os.path.join(
            symbol_path,
            file_name
        )

        df = pd.read_csv(file_path)

        processed_df = process_stock_file(df)

        interval = (
            file_name
            .split("_")[-1]
            .replace(".csv", "")
        )

        processed_df["interval"] = interval

        output_path = os.path.join(
            symbol_output_path,
            f"processed_{file_name}"
        )

        processed_df.to_csv(
            output_path,
            index=True
        )

        print(
            f"Processed {output_path}"
        )

    return True

# =======================
# Run
# =======================

if __name__ == "__main__":
    process_symbol("EURUSD=X")