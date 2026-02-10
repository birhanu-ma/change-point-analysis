import React, { useState } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, ReferenceLine, CartesianGrid, Legend
} from "recharts";
import SummaryCards from "./SummaryCards";
import BrentAnalysis from "./BrentAnalysis"; // Import the component you want to pop up

const ChangePointDetails = ({ changePoint, data = [] }) => {
  // --- New state for the pop-up visibility ---
  const [showOverlay, setShowOverlay] = useState(false);

  // --- Helper Function for Bayesian Densities ---
  const generateDensity = (samples) => {
    if (!samples || samples.length === 0) return [];
    const bins = {};
    const precision = 1000; 
    samples.forEach(s => {
      const rounded = Math.round(s * precision) / precision;
      bins[rounded] = (bins[rounded] || 0) + 1;
    });
    return Object.keys(bins)
      .map(k => ({ val: parseFloat(k), count: bins[k] }))
      .sort((a, b) => a.val - b.val);
  };

  if (!changePoint) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading Bayesian Posterior Data...</p>
      </div>
    );
  }

  const mu1Density = generateDensity(changePoint.trace_samples?.mu1);
  const mu2Density = generateDensity(changePoint.trace_samples?.mu2);
  const sigmaDensity = generateDensity(changePoint.trace_samples?.sigma);
  const tauData = changePoint.change_point?.probability_distribution || [];
  const switchDate = changePoint.change_point?.date;
  const impact = changePoint.impact_analysis;

  return (
    <div className="space-y-6 animate-fadeIn relative">
      
      {/* --- NEW OVERLAY LOGIC --- */}
      {showOverlay && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button 
              onClick={() => setShowOverlay(false)}
              className="absolute top-4 right-4 z-[1001] bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition-colors"
            >
              ✕ Close Analysis
            </button>
            
            {/* The component displayed OVER the dashboard */}
            <BrentAnalysis data={data} />
          </div>
        </div>
      )}

      {/* 1. Conditional Summary Cards */}
      {impact && <SummaryCards impact={impact} />}

      {/* 2. Main Price Chart */}
      <div className="w-full bg-card p-6 rounded-xl border border-border shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-center">Price Series & Structural Break</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="Date" tick={{ fontSize: 11 }} minTickGap={50} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Legend verticalAlign="top" height={36}/>
              <Line name="Brent Price" type="monotone" dataKey="Price" stroke="#1976d2" dot={false} strokeWidth={2} />
              
              {switchDate && (
                <ReferenceLine
                  x={switchDate}
                  stroke="red"
                  strokeWidth={4} // Made slightly thicker for easier clicking
                  strokeDasharray="5 5"
                  className="cursor-pointer hover:stroke-red-400 transition-colors"
                  // --- CLICK TRIGGER ---
                  onClick={() => setShowOverlay(true)}
                  label={{ 
                    value: 'Click for Detailed Analysis', 
                    fill: 'red', 
                    fontSize: 10, 
                    position: 'top',
                    fontWeight: 'bold',
                    className: 'animate-pulse' 
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Bayesian Parameter Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tau/Index Chart */}
        <div className="lg:col-span-3 bg-card p-6 rounded-xl border border-border shadow-sm">
          <h4 className="text-sm font-semibold mb-4 text-muted-foreground uppercase">Tau Distribution (Time Index Probability)</h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tauData}>
                <XAxis dataKey="index" fontSize={10} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="probability" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <ReferenceLine x={changePoint.change_point.index} stroke="red" strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mu1 Density */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h4 className="text-sm font-semibold mb-2">Pre-Change Mean (mu_1)</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mu1Density}>
                <XAxis dataKey="val" tickFormatter={(v) => v.toFixed(3)} fontSize={10} />
                <Area type="basis" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mu2 Density */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h4 className="text-sm font-semibold mb-2">Post-Change Mean (mu_2)</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mu2Density}>
                <XAxis dataKey="val" tickFormatter={(v) => v.toFixed(3)} fontSize={10} />
                <Area type="basis" dataKey="count" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sigma Density */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h4 className="text-sm font-semibold mb-2">Volatility (sigma)</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sigmaDensity}>
                <XAxis dataKey="val" tickFormatter={(v) => v.toFixed(3)} fontSize={10} />
                <Area type="basis" dataKey="count" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePointDetails;