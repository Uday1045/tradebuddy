import os
import pandas as pd
import numpy as np

# =======================
# Indicator Calculations
# =======================

def calculate_sma(series, period=14):
    # Use min_periods=1 to avoid NaNs in first rows
    return series.rolling(window=period, min_periods=1).mean()

def calculate_ema(series, period=14):
    return series.ewm(span=period, adjust=False, min_periods=1).mean()

def calculate_rsi(series, period=14):
    delta = series.diff()
    gain = np.where(delta > 0, delta, 0)
    loss = np.where(delta < 0, -delta, 0)

    avg_gain = pd.Series(gain).rolling(window=period, min_periods=1).mean()
    avg_loss = pd.Series(loss).rolling(window=period, min_periods=1).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return pd.Series(rsi, index=series.index)

def calculate_macd(series, fast=12, slow=26, signal=9):
    ema_fast = series.ewm(span=fast, adjust=False, min_periods=1).mean()
    ema_slow = series.ewm(span=slow, adjust=False, min_periods=1).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False, min_periods=1).mean()
    hist = macd_line - signal_line
    return macd_line, signal_line, hist

def calculate_bollinger(series, period=20, num_std=2):
    sma = series.rolling(window=period, min_periods=1).mean()
    std = series.rolling(window=period, min_periods=1).std()
    upper = sma + (std * num_std)
    lower = sma - (std * num_std)
    return upper, lower

# =======================
# File Processing
# =======================

def process_file(df, interval="raw"):
    # Ensure datetime
    df['timestampUTC'] = pd.to_datetime(df['timestampUTC'], utc=True,dayfirst=True)
    df.set_index('timestampUTC', inplace=True)
    df = df[~df.index.duplicated(keep='first')]
    # df = df.asfreq(interval)  # instead of resample, keeps original values

    # =======================
    # Calculate Indicators
    # =======================
    df['movingAverage'] = calculate_sma(df['close'], period=14)
    df['ema'] = calculate_ema(df['close'], period=14)
    df['rsi'] = calculate_rsi(df['close'], period=14)

    macd_line, signal_line, hist = calculate_macd(df['close'])
    df['macd'] = macd_line
    df['macd_signal'] = signal_line
    df['macd_hist'] = hist

    upper, lower = calculate_bollinger(df['close'])
    df['bollingerUpper'] = upper
    df['bollingerLower'] = lower

    # Fill any remaining NaNs with previous value
    df.fillna(method='ffill', inplace=True)
    df.fillna(method='bfill', inplace=True)  # if still NaN at start

    return df

# =======================
# Main Pipeline
# =======================

def run_pipeline(input_folder="../data", output_folder="../pipeline_data"):
    os.makedirs(output_folder, exist_ok=True)

    for file_name in os.listdir(input_folder):
        if not file_name.endswith(".csv"):
            continue

        # Extract interval from filename
        interval = "raw"
        if "_" in file_name:
            interval = file_name.split("_")[-1].replace(".csv", "")

        print(f"Processing {file_name} with interval {interval}...")

        file_path = os.path.join(input_folder, file_name)
        df = pd.read_csv(file_path)

        processed_df = process_file(df, interval)

        # Save output
        output_path = os.path.join(output_folder, f"processed_{file_name}")
        processed_df.to_csv(output_path, index=False)

        print(f"✅ Saved processed file: {output_path}")

# =======================
# Run the pipeline
# =======================

if __name__ == "__main__":
    run_pipeline(input_folder="../data", output_folder="../pipeline_data")



# import os
# import pandas as pd
# import numpy as np

# # =======================
# # Indicator Calculations
# # =======================

# def calculate_sma(series, period=14):
#     return series.rolling(window=period).mean()

# def calculate_ema(series, period=14):
#     return series.ewm(span=period, adjust=False).mean()

# def calculate_rsi(series, period=14):
#     delta = series.diff()
#     gain = np.where(delta > 0, delta, 0)
#     loss = np.where(delta < 0, -delta, 0)

#     avg_gain = pd.Series(gain).rolling(window=period).mean()
#     avg_loss = pd.Series(loss).rolling(window=period).mean()

#     rs = avg_gain / avg_loss
#     rsi = 100 - (100 / (1 + rs))
#     return pd.Series(rsi, index=series.index)

# def calculate_macd(series, fast=12, slow=26, signal=9):
#     ema_fast = series.ewm(span=fast, adjust=False).mean()
#     ema_slow = series.ewm(span=slow, adjust=False).mean()
#     macd_line = ema_fast - ema_slow
#     signal_line = macd_line.ewm(span=signal, adjust=False).mean()
#     hist = macd_line - signal_line
#     return macd_line, signal_line, hist

# def calculate_bollinger(series, period=20, num_std=2):
#     sma = series.rolling(window=period).mean()
#     std = series.rolling(window=period).std()
#     upper = sma + (std * num_std)
#     lower = sma - (std * num_std)
#     return upper, lower


# # =======================
# # File Processing
# # =======================

# def process_file(df, interval="raw"):
#     # Ensure datetime using ISO timestamp
#     df['timestampUTC'] = pd.to_datetime(df['timestampUTC'], utc=True)
#     df = df.set_index('timestampUTC')

#     # Resample if interval is not "raw"
#     if interval != "raw":
#         df = df.resample(interval).agg({
#             'open': 'first',
#             'high': 'max',
#             'low': 'min',
#             'close': 'last',
#             'volume': 'sum'
#         }).dropna().reset_index()

#     # =======================
#     # Calculate Indicators
#     # =======================
#     df['movingAverage'] = calculate_sma(df['close'], period=14)
#     df['ema'] = calculate_ema(df['close'], period=14)
#     df['rsi'] = calculate_rsi(df['close'], period=14)

#     macd_line, signal_line, hist = calculate_macd(df['close'])
#     df['macd'] = macd_line
#     df['macd_signal'] = signal_line
#     df['macd_hist'] = hist

#     upper, lower = calculate_bollinger(df['close'])
#     df['bollingerUpper'] = upper
#     df['bollingerLower'] = lower

#     return df


# # =======================
# # Main Pipeline
# # =======================

# def run_pipeline(input_folder="../data", output_folder="../pipeline_data"):
#     os.makedirs(output_folder, exist_ok=True)

#     for file_name in os.listdir(input_folder):
#         if not file_name.endswith(".csv"):
#             continue

#         # Extract interval from filename (e.g., AAPL_30m.csv → 30m)
#         interval = "raw"
#         if "_" in file_name:
#             interval = file_name.split("_")[-1].replace(".csv", "")

#         print(f"Processing {file_name} with interval {interval}...")

#         file_path = os.path.join(input_folder, file_name)
#         df = pd.read_csv(file_path)

#         processed_df = process_file(df, interval)
#         df = df.drop_duplicates()


#         # Save output in pipeline_data folder
#         output_path = os.path.join(output_folder, f"processed_{file_name}")
#         processed_df.to_csv(output_path, index=False)

#         print(f"✅ Saved processed file: {output_path}")


# # =======================
# # Run the pipeline
# # =======================

# if __name__ == "__main__":
#     run_pipeline(input_folder="../data", output_folder="../pipeline_data")



# # Step 0: Import libraries
# import pandas as pd
# import numpy as np
# from sklearn.preprocessing import MinMaxScaler

# # Step 1: Load CSV data
# df = pd.read_csv(
#     "../data/"
# )
# # Forward fill first, then backfill if still NaN



# # Step 2: Inspect the data
# print(df.head())          # Show first few rows
# print(df.info())          # Data types and missing values
# print(df.isnull().sum())  # Count of missing values per column

# # Step 3: Handle missing values
# df.replace("", pd.NA, inplace=True)     
# df.bfill(inplace=True)
# df.ffill(inplace=True)

# # Step 4: Feature engineering
# df['pct_change'] = df['close'].pct_change()     # Daily % change
# df['prev_close'] = df['close'].shift(1)        # Previous day's close
# df['ma_7'] = df['close'].rolling(window=7).mean()  # 7-day moving average

# # Drop first rows with NaN from shift/rolling
# df.dropna(inplace=True)

# # Step 5: Normalize features
# features = ['open', 'high', 'low', 'close', 'volume', 'ma_7', 'prev_close', 'pct_change']
# scaler = MinMaxScaler()
# df[features] = scaler.fit_transform(df[features])

# # Step 6: Train/Test split
# train_size = int(len(df) * 0.8)
# train_df = df[:train_size]
# test_df = df[train_size:]

# X_train = train_df[features]
# y_train = train_df['close']

# X_test = test_df[features]
# y_test = test_df['close']

# # Optional Step 7: Convert to sequences for LSTM
# def create_sequences(data, target, seq_length=10):
#     X, y = [], []
#     for i in range(len(data) - seq_length):
#         X.append(data[i:i+seq_length])
#         y.append(target[i+seq_length])
#     return np.array(X), np.array(y)

# X_train_seq, y_train_seq = create_sequences(X_train.values, y_train.values)
# X_test_seq, y_test_seq = create_sequences(X_test.values, y_test.values)

# # Check shapes
# print("X_train_seq:", X_train_seq.shape)
# print("y_train_seq:", y_train_seq.shape)
# print("X_test_seq:", X_test_seq.shape)
# print("y_test_seq:", y_test_seq.shape)
