import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar.jsx";
import { getHistory, getChangePoint, getEvents, getSummary, getPrices } from "../api/api";

// Task 3 Components
import ChangePointDetails from "../components/ChangePointDetails";
import HistoricalPriceChart from "../components/HistoricalData.jsx";
import EventCorrelation from "../components/EventCorrelation.jsx";
// import EventAnalysis from "../components/EventAnalysis";


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

  useEffect(() => {
    // Load pre-calculated Bayesian results
    getHistory().then(res => setHistory(res.data));
    getPrices().then(res => setPrice(res.data));
    getChangePoint().then(res => setChangePoint(res.data));
    getEvents().then(res => setEvents(res.data));
    getSummary().then(res => setSummary(res.data));
  }, []);

  const renderContent = () => {
    switch (activePage) {
      case "Historical Data":
        return (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
               <HistoricalPriceChart data={historyData}/>
            </div>
          </div>
        );
      case "Change Point Results":
        // Interactive Bayesian Drill-down
        return <ChangePointDetails changePoint={changePoint} data={prices}  />;
      case "Event Correlation":
        // Correlation of geopolitical events to price shifts
        return <EventCorrelation events={events} data = {prices} />;
      default:
          <PriceChart data={prices} changePoint={changePoint} />
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
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
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Market Analytics</h1>
            <p className="text-sm text-muted-foreground">Brent Oil Bayesian Analysis Dashboard</p>
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