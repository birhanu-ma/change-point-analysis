import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";

/**
 * HistoricalPriceChart component renders the price trend with a date range filter.
 * Responds to global theme toggler using CSS variables.
 */
const HistoricalPriceChart = ({ data = [] }) => {
  // --- Filtration States ---
  const [startDate, setStartDate] = useState("1987-05-20");
  const [endDate, setEndDate] = useState("2024-12-31");

  // 1. Filter Price Data based on Date Range
  const filteredData = useMemo(() => {
    return data.filter(d => {
      const dDate = new Date(d.Date).toISOString().split('T')[0];
      return dDate >= startDate && dDate <= endDate;
    });
  }, [data, startDate, endDate]);

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm transition-colors duration-300">
      <header className="mb-6  text-center">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          Brent Oil Historical Price Series
        </h3>
        <p className="text-sm text-muted-foreground">
          Daily closing prices with date range filtration
        </p>
      </header>

      {/* --- Date Filter Bar (Themed) --- */}
      <div className="flex flex-wrap gap-4 mb-8 items-end p-4 bg-background rounded-lg border border-border shadow-inner">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase text-muted-foreground font-bold ml-1">Start Date</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-card border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase text-muted-foreground font-bold ml-1">End Date</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-card border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
        <button 
          onClick={() => { setStartDate("1987-05-20"); setEndDate("2024-12-31"); }}
          className="ml-auto text-[10px] bg-card text-primary border border-border hover:bg-primary hover:text-white px-3 py-1 rounded font-bold uppercase shadow-sm transition-all active:scale-95"
        >
          Reset Range
        </button>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="currentColor" 
              className="text-border/20"
            />
            
            <XAxis 
              dataKey="Date" 
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              minTickGap={60}
              interval="preserveStartEnd"
            />
            
            <YAxis 
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--color-card)', 
                border: '1px solid var(--color-border)', 
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--color-foreground)'
              }}
              itemStyle={{ color: 'var(--color-primary)' }}
              formatter={(value) => [`$${value}`, "Price"]}
            />
            
            <Legend 
              verticalAlign="top" 
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingTop: '0', marginBottom: '20px', fontSize: '12px', color: 'var(--color-foreground)' }}
            />

            <Line 
              name="Spot Price"
              type="monotone" 
              dataKey="Price" 
              stroke="var(--color-primary)" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--color-card)', fill: 'var(--color-primary)' }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoricalPriceChart;