from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import json
import os

# -------------------------
# APP CONFIG
# -------------------------
app = Flask(__name__)
CORS(app)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
EVENT_DIRR = os.path.join(BASE_DIR, "data","raw")

PRICES_FILE = os.path.join(DATA_DIR, "dashboard_prices.csv")
EVENTS_FILE = os.path.join(DATA_DIR, "dashboard_events.csv")
EVENTS_RAW_FILE = os.path.join(EVENT_DIRR, "events.csv")
RAW_DATA = os.path.join(RAW_DIR, "BrentOilPrices.csv")
MODEL_FILE = os.path.join(DATA_DIR, "model_results.json")

# -------------------------
# UTILITIES
# -------------------------
def load_csv(path):
    if not os.path.exists(path):
        return []
    return pd.read_csv(path).to_dict(orient="records")

def load_json(path):
    if not os.path.exists(path):
        return {}
    with open(path, "r") as f:
        return json.load(f)

# -------------------------
# API ENDPOINTS
# -------------------------

@app.route("/api/prices", methods=["GET"])
def get_prices():
    """
    Historical price data for charts
    """
    data = load_csv(PRICES_FILE)
    return jsonify(data)

@app.route("/api/change-point", methods=["GET"])
def get_change_point():
    """
    Bayesian change point results
    """
    data = load_json(MODEL_FILE)
    return jsonify(data)

@app.route("/api/events", methods=["GET"])
def get_events():
    """
    Event correlation data
    """
    data = load_csv(EVENTS_FILE)
    return jsonify(data)

@app.route("/api/summary", methods=["GET"])
def get_summary():
    """
    Key dashboard KPIs
    """
    prices = pd.read_csv(PRICES_FILE)
    model = load_json(MODEL_FILE)

    summary = {
        "average_price": round(prices["Price"].mean(), 2),
        "price_volatility": round(prices["Price"].std(), 2),
        "change_point_date": model.get("change_point_date"),
        "mean_return_pre": round(model.get("mu1_mean", 0), 6),
        "mean_return_post": round(model.get("mu2_mean", 0), 6)
    }

    return jsonify(summary)

@app.route("/api/historical-data", methods=["GET"])
def get_historical_data():
    """
    Serves the raw Brent Oil Price historical data
    """
    data = load_csv(RAW_DATA)
    if not data:
        return jsonify({"error": "Historical data file not found"}), 404
    return jsonify(data)

@app.route("/api/events-data", methods=["GET"])
def get_events_data():
    """
    Serves the raw Brent Oil Price historical data
    """
    data = load_csv(EVENTS_RAW_FILE)
    if not data:
        return jsonify({"error": "Historical data file not found"}), 404
    return jsonify(data)


# -------------------------
# MAIN
# -------------------------
if __name__ == "__main__":
    app.run(debug=True)
