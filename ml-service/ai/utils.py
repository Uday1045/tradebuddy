# utils.py

import os
import pandas as pd


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