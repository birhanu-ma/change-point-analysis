import React from "react";
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
 * Event component renders the price trend from the backend data.
 * Backend structure expected: [{ "Date": "20-May-87", "Price": 18.63 }, ...]
 */
const EventCorrelation = ({ data = [] }) => {
  return (
    <div className="w-full h-full bg-card p-6 rounded-xl border border-border shadow-sm">
      <header className="mb-6">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          Brent Oil Historical Price Series
        </h3>
        <p className="text-sm text-muted-foreground">
          Daily closing prices as retrieved from the database
        </p>
      </header>

      <div className="h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="rgba(255,255,255,0.05)" 
            />
            
            <XAxis 
              dataKey="Date" 
              tick={{ fontSize: 11, fill: '#888' }}
              tickLine={false}
              axisLine={false}
              minTickGap={60} // Prevents overlapping of "DD-MMM-YY" strings
              interval="preserveStartEnd"
            />
            
            <YAxis 
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#888' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid #333', 
                borderRadius: '8px',
                fontSize: '12px' 
              }}
              itemStyle={{ color: '#3b82f6' }}
              formatter={(value) => [`$${value}`, "Price"]}
            />
            
            <Legend 
              verticalAlign="top" 
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingTop: '0', marginBottom: '20px' }}
            />

            <Line 
              name="Spot Price"
              type="monotone" 
              dataKey="Price" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false} // Removed dots for a cleaner historical view
              activeDot={{ r: 4, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EventCorrelation;