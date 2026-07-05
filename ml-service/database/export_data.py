import os
import pandas as pd
from datetime import timezone
from zoneinfo import ZoneInfo

from database.mongodb import stocks, market_data


INTERVALS = [
    "5m",
    "15m",
    "30m",
    "1h",
    "1d"
]


def export_symbol(symbol):

    stock = stocks.find_one({
        "symbol": symbol
    })

    if not stock:
        raise Exception(
            f"Stock not found: {symbol}"
        )


    symbol_dir = os.path.join(
        "data",
        symbol
    )

    os.makedirs(
        symbol_dir,
        exist_ok=True
    )


    for interval in INTERVALS:

        cursor = market_data.find(
            {
                "stock": stock["_id"],
                "interval": interval
            }
        ).sort(
            "timestamp",
            1
        )


        rows = list(cursor)


        if not rows:
            print(
                f"No data for {symbol} {interval}"
            )
            continue


        processed = []


        for doc in rows:

            if interval != "1d":

                indicators = [
                    doc.get("movingAverage"),
                    doc.get("ema"),
                    doc.get("rsi"),
                    doc.get("macd"),
                    doc.get("bollingerUpper"),
                    doc.get("bollingerLower")
                ]


                if any(x is None for x in indicators):
                    continue


            utc_time = doc["timestamp"]


            local_time = (
                utc_time
                .astimezone(
                    ZoneInfo("Asia/Kolkata")
                )
                .strftime(
                    "%d/%m/%Y, %H:%M:%S"
                )
            )


            processed.append({
                "timestampUTC":
                    utc_time.isoformat(),

                "localTime":
                    local_time,

                "open":
                    doc["open"],

                "high":
                    doc["high"],

                "low":
                    doc["low"],

                "close":
                    doc["close"],

                "volume":
                    doc["volume"],

                "movingAverage":
                    doc.get("movingAverage"),

                "ema":
                    doc.get("ema"),

                "rsi":
                    doc.get("rsi"),

                "macd":
                    doc.get("macd"),

                "bollingerUpper":
                    doc.get("bollingerUpper"),

                "bollingerLower":
                    doc.get("bollingerLower")
            })


        if not processed:
            print(
                f"No complete rows for {interval}"
            )
            continue


        df = pd.DataFrame(processed)


        output_path = os.path.join(
            symbol_dir,
            f"{symbol}_{interval}.csv"
        )


        df.to_csv(
            output_path,
            index=False
        )


        print(
            f"Exported {len(df)} rows to {output_path}"
        )


    print(
        "Export completed successfully"
    )