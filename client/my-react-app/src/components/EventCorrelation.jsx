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

const EventCorrelation = ({ allEvents = [], data = [] }) => {
  // --- States for Filtering ---
  const [startDate, setStartDate] = useState("1987-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");
  const [selectedType, setSelectedType] = useState("All");

  // 1. Filter Price Data based on Date Range
  const filteredData = useMemo(() => {
    return data.filter(d => d.Date >= startDate && d.Date <= endDate);
  }, [data, startDate, endDate]);

  // 2. Create a lookup map for filtered events to show dots
  const eventMap = useMemo(() => {
    const map = {};
    allEvents.forEach(event => {
      const isWithinDate = event.event_date >= startDate && event.event_date <= endDate;
      const isTypeMatch = selectedType === "All" || event.event_type === selectedType;
      
      if (isWithinDate && isTypeMatch) {
        const dateObj = new Date(event.event_date);
        const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        map[key] = event;
      }
    });
    return map;
  }, [allEvents, startDate, endDate, selectedType]);

  // 3. Get unique event types for the dropdown
  const eventTypes = useMemo(() => {
    return ["All", ...new Set(allEvents.map(e => e.event_type))];
  }, [allEvents]);

  // --- Customized Dot Renderer ---
  const CustomizedDot = (props) => {
    const { cx, cy, payload } = props;
    const dateObj = new Date(payload.Date);
    const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    
    if (eventMap[key]) {
      return (
        <circle 
          cx={cx} 
          cy={cy} 
          r={5} 
          fill="#10b981" 
          stroke="currentColor" 
          strokeWidth={2} 
          className="drop-shadow-sm text-card"
        />
      );
    }
    return null;
  };

  // --- Custom Tooltip ---
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const priceData = payload[0].payload;
      const dateObj = new Date(priceData.Date);
      const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      const event = eventMap[key];

      return (
        <div className="bg-card border border-border p-5 rounded-xl shadow-2xl max-w-[350px] backdrop-blur-md z-50">
          <div className="mb-3">
            <p className="text-muted-foreground text-[10px] uppercase tracking-widest mb-1 font-bold">Market Snapshot</p>
            <p className="text-foreground font-bold text-base">{priceData.Date}</p>
            <p className="text-primary font-mono text-lg font-semibold">${Number(priceData.Price).toFixed(2)}</p>
          </div>

          {event && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-emerald-500/20 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded uppercase border border-emerald-500/30">
                  {event.event_type}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  Impact: {event.expected_impact}
                </span>
              </div>
              <p className="text-foreground text-sm leading-relaxed mb-3 italic">
                "{event.event_description}"
              </p>
              <div className="flex flex-col gap-1">
                <p className="text-[11px] text-primary font-medium">Source: {event.source}</p>
                <p className="text-[9px] text-muted-foreground truncate">{event.source_url}</p>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-full overflow-hidden bg-card p-4 sm:p-8 rounded-2xl border border-border shadow-xl transition-colors duration-300">
      <header className="mb-8 text-center">
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
          Brent Oil Historical Price Series
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Correlating global events with daily market fluctuations
        </p>
      </header>

      {/* --- Filter Bar (Dynamic Theme Enabled) --- */}
      <div className="flex flex-wrap gap-6 mb-10 items-end p-5 bg-background rounded-xl border border-border shadow-inner">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest ml-1">Start Date</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest ml-1">End Date</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase text-muted-foreground font-black tracking-widest ml-1">Event Category</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all min-w-[160px] cursor-pointer"
          >
            {eventTypes.map(type => (
              <option key={type} value={type} className="bg-card text-foreground">{type}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => { setStartDate("1987-01-01"); setEndDate("2024-12-31"); setSelectedType("All"); }}
          className="ml-auto text-[11px] bg-card text-primary border border-border hover:bg-primary hover:text-white px-5 py-2 rounded-lg font-bold uppercase transition-all shadow-sm active:scale-95"
        >
          Reset Filters
        </button>
      </div>

      {/* --- Chart Area --- */}
      <div className="h-[250px] sm:h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
              minTickGap={80}
            />
            
            <YAxis 
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
              width={45}
            />
            
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
            />
            
            <Legend 
              verticalAlign="top" 
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '30px', fontSize: '12px', fontWeight: 600 }}
            />

            <Line 
              name="Spot Price"
              type="monotone" 
              dataKey="Price" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              dot={<CustomizedDot />}
              activeDot={{ r: 8, fill: 'var(--color-primary)', stroke: 'var(--color-card)', strokeWidth: 2 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EventCorrelation;