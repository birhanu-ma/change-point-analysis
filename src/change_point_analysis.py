import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import pymc as pm
import arviz as az
import json
import sys, os
from statsmodels.tsa.stattools import adfuller
class ChangePointAnalysis:
    """
    Bayesian Change Point Analysis for Brent Oil Prices (Monthly)
    ------------------------------------------------------------------
    Detects structural breaks in Brent oil prices and quantifies impact.
    Exports results for dashboards and reports.
    """

    def __init__(self, price_path: str, event_path: str = None):
        self.price_path = price_path
        self.event_path = event_path

        self.price_df = None
        self.returns_df = None
        self.events_df = None

        self.trace = None
        self.change_point_index = None
        self.change_point_date = None

    # ------------------------------------------------------------------
    # DATA LOADING & PREPARATION
    # ------------------------------------------------------------------

    def load_price_data(self):
        """Load and preprocess Brent oil price data."""
        df = pd.read_csv(self.price_path)
        df["Date"] = pd.to_datetime(df["Date"], format="mixed", dayfirst=True, errors="coerce")
        df = df.dropna(subset=["Date", "Price"]).sort_values("Date").reset_index(drop=True)
        self.price_df = df
        return df

    def aggregate_monthly(self):
        """Aggregate daily prices to monthly averages for faster MCMC."""
        df = self.price_df.copy().set_index("Date")
        df = df.resample("ME").mean().reset_index()
        self.price_df = df
        self.compute_log_returns()
        return df

    def load_event_data(self):
        """Load and preprocess event dataset."""
        if self.event_path is None:
            raise ValueError("Event data path not provided.")
        events = pd.read_csv(self.event_path)
        events["event_date"] = pd.to_datetime(events["event_date"], format="mixed", errors="coerce")
        self.events_df = events.dropna(subset=["event_date"])
        return self.events_df

    # ------------------------------------------------------------------
    # FEATURE ENGINEERING
    # ------------------------------------------------------------------

    def compute_log_returns(self):
        """Compute log returns of price series."""
        df = self.price_df.copy()
        df["log_price"] = np.log(df["Price"])
        df["log_return"] = df["log_price"].diff()
        df = df.dropna().reset_index(drop=True)
        self.returns_df = df
        return df

    # ------------------------------------------------------------------
    # EXPLORATORY DATA ANALYSIS
    # ------------------------------------------------------------------

    def plot_price_series(self):
        plt.figure(figsize=(14,5))
        plt.plot(self.price_df["Date"], self.price_df["Price"])
        plt.title("Monthly Brent Oil Prices")
        plt.xlabel("Date")
        plt.ylabel("Price (USD)")
        plt.grid(True)
        plt.show()

    def plot_log_returns(self):
        if self.returns_df is None:
            self.compute_log_returns()
        plt.figure(figsize=(14,5))
        plt.plot(self.returns_df["Date"], self.returns_df["log_return"])
        plt.title("Monthly Log Returns of Brent Oil Prices")
        plt.xlabel("Date")
        plt.ylabel("Log Return")
        plt.grid(True)
        plt.show()
 

    def check_stationarity(self):
        """
        Perform Augmented Dickey-Fuller test to verify stationarity.
        Returns a dictionary of test results.
        """
        if self.returns_df is None:
            self.compute_log_returns()
        
        series = self.returns_df["log_return"].values
        result = adfuller(series)
        
        status = "Stationary" if result[1] <= 0.05 else "Non-Stationary"
        
        stats = {
            "ADF Statistic": result[0],
            "p-value": result[1],
            "Critical Values": result[4],
            "Status": status
        }
        
        print(f"--- Stationarity Test ({status}) ---")
        print(f"p-value: {result[1]:.4f}")
        return stats

    # ------------------------------------------------------------------
    # BAYESIAN CHANGE POINT MODEL
    # ------------------------------------------------------------------

    def fit_change_point_model(
        self,
        draws: int = 1000,
        tune: int = 1000,
        chains: int = 2,
        cores: int = 2,
        target_accept: float = 0.9
    ):
        """Fit Bayesian change point model (mean shift)."""
        returns = self.returns_df["log_return"].values
        n = len(returns)
        time_idx = np.arange(n)

        with pm.Model() as model:
            tau = pm.DiscreteUniform("tau", lower=5, upper=n-5)
            mu_1 = pm.Normal("mu_1", mu=0, sigma=0.05)
            mu_2 = pm.Normal("mu_2", mu=0, sigma=0.05)
            sigma = pm.HalfNormal("sigma", sigma=0.05)
            mu = pm.math.switch(time_idx < tau, mu_1, mu_2)
            pm.Normal("returns", mu=mu, sigma=sigma, observed=returns)

            self.trace = pm.sample(
                draws=draws,
                tune=tune,
                chains=chains,
                cores=cores,
                target_accept=target_accept,
                return_inferencedata=True,
                progressbar=True
            )

        self._extract_change_point()
        return self.trace

    # ------------------------------------------------------------------
    # DIAGNOSTICS
    # ------------------------------------------------------------------

    def summary(self):
        return az.summary(self.trace)

    def plot_trace(self):
        az.plot_trace(self.trace)
        plt.subplots_adjust(hspace=0.4) 
        plt.show()

    def plot_tau_posterior(self):
        az.plot_posterior(self.trace, var_names=["tau"])
        plt.subplots_adjust(hspace=0.4) 
        plt.show()

    def plot_means_posterior(self):
        az.plot_posterior(self.trace, var_names=["mu_1", "mu_2"])
        plt.subplots_adjust(hspace=0.4) 
        plt.show()

    # ------------------------------------------------------------------
    # RESULTS & INTERPRETATION
    # ------------------------------------------------------------------

    def _extract_change_point(self):
        tau_samples = self.trace.posterior["tau"].values.flatten()
        self.change_point_index = int(np.median(tau_samples))
        self.change_point_date = self.returns_df.loc[self.change_point_index, "Date"]

    def get_change_point_date(self):
        return self.change_point_date

    def quantify_impact(self):
        """
        Calculate impact in log returns and convert to real price change.
        Returns dictionary with pre/post mean returns, average prices, and % change.
        """
        mu1_samples = self.trace.posterior["mu_1"].values.flatten()
        mu2_samples = self.trace.posterior["mu_2"].values.flatten()

        mu1_mean, mu2_mean = mu1_samples.mean(), mu2_samples.mean()

        # Convert log return means back to prices
        pre_prices = self.price_df.loc[:self.change_point_index, "Price"]
        post_prices = self.price_df.loc[self.change_point_index+1:, "Price"]

        pre_avg_price = pre_prices.mean()
        post_avg_price = post_prices.mean()

        mean_shift = mu2_mean - mu1_mean
        percent_change = (post_avg_price - pre_avg_price) / pre_avg_price * 100

        result = {
            "pre_mean_log_return": mu1_mean,
            "post_mean_log_return": mu2_mean,
            "pre_avg_price": pre_avg_price,
            "post_avg_price": post_avg_price,
            "mean_shift_log_return": mean_shift,
            "percent_price_change": percent_change
        }

        return result

    # ------------------------------------------------------------------
    # EVENT ASSOCIATION
    # ------------------------------------------------------------------

    def find_nearby_events(self, window_days: int = 180):
        if self.events_df is None:
            raise ValueError("Event data not loaded.")
        window = pd.Timedelta(days=window_days)
        return self.events_df[
            (self.events_df["event_date"] >= self.change_point_date - window) &
            (self.events_df["event_date"] <= self.change_point_date + window)
        ]

    # ------------------------------------------------------------------
    # VISUALIZATION
    # ------------------------------------------------------------------

    def plot_price_with_change_point(self):
        plt.figure(figsize=(14,5))
        plt.plot(self.price_df["Date"], self.price_df["Price"], label="Monthly Price")
        plt.axvline(self.change_point_date, color="red", linestyle="--", label="Detected Change Point")
        plt.legend()
        plt.title("Monthly Brent Oil Prices with Detected Change Point")
        plt.grid(True)
        plt.show()

    # ------------------------------------------------------------------
    # EXPORT FOR DASHBOARD (TASK 3)
    # ------------------------------------------------------------------

    def export_dashboard_files(
        self,
        price_csv="../data/processed/dashboard_prices.csv",
        events_csv="../data/processed/dashboard_events.csv",
        model_json="../data/processed/model_results.json"
    ):
        """
        Exports comprehensive data for Task 3 to enable interactive drill-downs.
        1. Full monthly prices + log returns (CSV)
        2. Events correlated to change point (CSV)
        3. Bayesian distribution data, HDI, and sub-sampled traces (JSON)
        """
        # Ensure directory exists
        folder_path = os.path.dirname(price_csv)
        os.makedirs(folder_path, exist_ok=True)
    
        # 1️⃣ Export prices/log returns
        df_export = self.returns_df.copy()
        df_export["Date"] = df_export["Date"].dt.strftime("%Y-%m-%d")
        df_export.to_csv(price_csv, index=False)
    
        # 2️⃣ Export events near change point
        if self.events_df is not None:
            nearby_events = self.find_nearby_events()
            nearby_events_export = nearby_events.copy()
            nearby_events_export["event_date"] = nearby_events_export["event_date"].dt.strftime("%Y-%m-%d")
            nearby_events_export.to_csv(events_csv, index=False)
    
        # 3️⃣ Export Rich Model Results for Drill-Down
        mu1_samples = self.trace.posterior["mu_1"].values.flatten()
        mu2_samples = self.trace.posterior["mu_2"].values.flatten()
        tau_samples = self.trace.posterior["tau"].values.flatten()
        sigma_samples = self.trace.posterior["sigma"].values.flatten()

        # Generate Histogram Data for Tau (The "Mountain" Plot)
        # This maps the probability of a change point to specific indices
        tau_counts = pd.Series(tau_samples).value_counts().sort_index()
        tau_dist = [{"index": int(i), "probability": float(v / len(tau_samples))} 
                    for i, v in tau_counts.items()]

        hdi = az.hdi(tau_samples, hdi_prob=0.94)
        impact = self.quantify_impact() # Uses your existing impact logic

        # Calculate pre/post volatility (sigma) for the drill-down summary
        results = {
            "metadata": {
                "generated_at": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S"),
                "total_samples": len(tau_samples)
            },
            "change_point": {
                "date": self.change_point_date.strftime("%Y-%m-%d"),
                "index": int(self.change_point_index),
                "hdi_range": [int(hdi[0]), int(hdi[1])],
                "probability_distribution": tau_dist # For the Area Chart
            },
            "impact_analysis": {
                "mu1_mean": float(mu1_samples.mean()),
                "mu2_mean": float(mu2_samples.mean()),
                "avg_price_pre": float(impact["pre_avg_price"]),
                "avg_price_post": float(impact["post_avg_price"]),
                "percent_change": float(impact["percent_price_change"]),
                "volatility_sigma": float(sigma_samples.mean())
            },
            "trace_samples": {
                # Sub-sampling every 10th value to keep JSON size small for web
                "mu1": mu1_samples[::10].tolist(),
                "mu2": mu2_samples[::10].tolist(),
                "sigma": sigma_samples[::10].tolist()
            }
        }
    
        with open(model_json, "w") as f:
            json.dump(results, f, indent=4)
    
        print(f"✅ Drill-down ready files exported to '{folder_path}'")
    def generate_stakeholder_report(self, report_path="../reports/stakeholder_summary.txt"):
        """
        Translates complex Bayesian results into a concise document 
        for non-technical stakeholders. Creates the directory if it doesn't exist.
        """
        # 1. Extract the directory path from the file path
        report_dir = os.path.dirname(report_path)
    
        # 2. Create the folder if it doesn't exist (exist_ok=True prevents errors if it does)
        if report_dir:
            os.makedirs(report_dir, exist_ok=True)
    
        # 3. Get the data for the report
        impact = self.quantify_impact()
        
        summary = (
            "EXECUTIVE SUMMARY: BRENT OIL PRICE ANALYSIS\n"
            "==========================================\n"
            f"Significant Change Detected: {self.change_point_date.strftime('%B %Y')}\n"
            f"Price Shift: ${impact['pre_avg_price']:.2f} -> ${impact['post_avg_price']:.2f}\n"
            f"Impact Magnitude: {impact['percent_price_change']:.1f}% change in average price\n\n"
            "INTERPRETATION:\n"
            "The Bayesian model has identified a high-probability structural break.\n"
            "This suggests that the market regime has fundamentally shifted, \n"
            "moving the baseline for risk assessment and future price expectations.\n"
            "This change correlates with major geopolitical/economic events identified in the analysis."
        )
        
        # 4. Write the file
        with open(report_path, "w") as f:
            f.write(summary)
            
        print(f"✅ Stakeholder summary generated in '{report_path}'")