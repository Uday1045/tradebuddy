from fastapi import FastAPI
from joblib import load
from fastapi.middleware.cors import CORSMiddleware
from services.prediction_service import generate_prediction



app = FastAPI(
    title="TradeBuddy ML Service",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://tradebuddy-moys.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "service": "TradeBuddy ML Service",
        "status": "running"
    }



@app.get("/predict/{symbol}")
def predict(symbol: str):

    result = generate_prediction(symbol)

    return result