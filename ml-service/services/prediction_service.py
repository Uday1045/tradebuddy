from database.export_data import export_symbol
from ai.data_pipeline import process_symbol
from ai.predict import predict_symbol


def generate_prediction(symbol):
    print(f"Starting prediction for {symbol}")

    export_symbol(symbol)

    process_symbol(symbol)

    result = predict_symbol(symbol)

    print("Prediction completed")

    return result


if __name__ == "__main__":
    print(generate_prediction("EURUSD=X"))