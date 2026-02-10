# change-point-analysis
# Change-Point Analysis: Brent Oil Price Dynamics  
### 10 Academy – Artificial Intelligence Mastery | Week 11 Challenge

![Project Status](https://img.shields.io/badge/Status-Active-green)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![PyMC](https://img.shields.io/badge/Bayesian-PyMC-red)
![React](https://img.shields.io/badge/Frontend-React-61DAFB)

---

## 📌 Project Overview

As a Data Scientist at **Birhan Energies**, this project investigates how major geopolitical and economic events—such as OPEC policy decisions, regional conflicts, and international sanctions—affect the dynamics and volatility of Brent crude oil prices.

By applying **Bayesian Change Point Detection**, the project moves beyond simple correlation analysis to probabilistically identify **structural breaks** in the time series. The resulting insights support informed decision-making for investors, policymakers, and energy companies navigating the global energy market.

---

## 🎯 Key Objectives

- **Identify:** Detect significant regime switch points in historical Brent oil prices (1987–2022).
- **Quantify:** Measure changes in price means and volatility before and after key events.
- **Communicate:** Present results through an interactive Flask–React dashboard for stakeholders.

---

## 🏗 Project Structure

The repository follows a modular architecture that separates data science workflows from full-stack application development:

```plaintext
CHANGE-POINT-ANALYSIS
├── .github/                 # CI/CD workflows
├── .venv/                   # Python virtual environment
├── client/                  # React Frontend
│   └── my-react-app/
│       ├── node_modules/
│       ├── public/
│       ├── src/             # Dashboard components & charts
│       ├── .gitignore
│       ├── eslint.config.js
│       ├── index.html
│       ├── package-lock.json
│       ├── package.json
│       ├── README.md
│       └── vite.config.js
├── data/                    # Data storage
│   ├── processed/           # Cleaned & stationary datasets
│   └── raw/                 # Original Brent oil price CSVs
├── notebook/                # Analysis & Modeling
│   ├── 01_eda.ipynb         # Task 1: Exploration & Research
│   └── 02_modeling.ipynb    # Task 2: Bayesian Modeling (PyMC)
├── src/                     # Flask backend & utilities
├── .gitignore
├── README.md                # Project documentation
└── requirements.txt         # Python dependencies
🚀 Getting Started
1. Prerequisites

Python 3.10+

Node.js & npm (for the dashboard)

2. Installation & Setup
Backend & Analysis
# Clone the repository
git clone https://github.com/birhanu-ma/change-point-analysis.git
cd change-point-analysis

# Install Python dependencies
pip install -r requirements.txt

Frontend Dashboard
cd client/my-react-app
npm install
npm run dev