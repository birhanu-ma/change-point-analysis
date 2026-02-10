import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar.jsx";
import {
  getHistory,
  getChangePoint,
  getEvents,
  getSummary,
  getPrices,
  getAllEvent,
} from "../api/api";

// Task 3 Components
import ChangePointDetails from "../components/ChangePointDetails";
import HistoricalPriceChart from "../components/HistoricalData.jsx";
import EventCorrelation from "../components/EventCorrelation.jsx";

function Dashboard() {
  const navItems = [
    "Historical Data",
    "Change Point Results",
    "Event Correlation",
  ];

  const [activePage, setActivePage] = useState("Historical Data");
  const [historyData, setHistory] = useState([]);
  const [prices, setPrice] = useState([]);
  const [changePoint, setChangePoint] = useState(null);

  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [allEvents, setAllEvents] = useState(null);

  // Theme State
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load pre-calculated Bayesian results
    getHistory().then((res) => setHistory(res.data));
    getPrices().then((res) => setPrice(res.data));
    getChangePoint().then((res) => setChangePoint(res.data));
    getEvents().then((res) => setEvents(res.data));
    getSummary().then((res) => setSummary(res.data));
    getAllEvent().then((res) => setAllEvents(res.data));
  }, []);

  // Theme Toggle Logic
  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case "Historical Data":
        return <HistoricalPriceChart data={historyData} />;
      case "Change Point Results":
        return <ChangePointDetails changePoint={changePoint} data={prices} />;
      case "Event Correlation":
        return <EventCorrelation allEvents={allEvents} data={prices} />;
      default:
        return <HistoricalPriceChart data={historyData} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden transition-colors duration-300">
      {/* Sidebar Integration */}
      <Sidebar
        title="Birhan Energies"
        navItems={navItems}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Main Dashboard Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-8 border-b border-border bg-card/50 backdrop-blur-md">
          <div className="flex justify-between items-center  w-full">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Market Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                Brent Oil Bayesian Analysis Dashboard
              </p>
            </div>

            {/* Theme Toggler Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-card border border-border hover:bg-muted transition-all duration-200 shadow-sm"
              aria-label="Toggle Theme"
            >
              {isDark ? (
                // Sun Icon for Light Mode
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                // Moon Icon for Dark Mode
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 sidebar-scrollbar">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;