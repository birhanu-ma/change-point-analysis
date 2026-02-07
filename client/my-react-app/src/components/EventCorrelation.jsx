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

const EventCorrelation = ({ data = [] }) => {
  return (
    /* FIX 1: Added 'max-w-full' and 'overflow-hidden' to ensure 
       the container never expands beyond its parent/screen.
    */
    <div className="w-full max-w-full overflow-hidden bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm">
      <header className="mb-6">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          Brent Oil Historical Price Series
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Daily closing prices as retrieved from the database
        </p>
      </header>

      {/* FIX 2: Changed height to 'h-[300px] sm:h-[450px]' 
         so it takes up less vertical space on mobile.
      */}
      <div className="h-[300px] sm:h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }} // Reduced left margin for mobile
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="rgba(255,255,255,0.05)" 
            />
            
            <XAxis 
              dataKey="Date" 
              tick={{ fontSize: 10, fill: '#888' }}
              tickLine={false}
              axisLine={false}
              minTickGap={30} // Lowered gap for better density on small screens
              interval="preserveStartEnd"
            />
            
            <YAxis 
              domain={['auto', 'auto']}
              tick={{ fontSize: 10, fill: '#888' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
              width={40} // Fixed width for YAxis helps prevent "jumping"
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid #333', 
                borderRadius: '8px',
                fontSize: '11px' 
              }}
              itemStyle={{ color: '#3b82f6' }}
              formatter={(value) => [`$${value}`, "Price"]}
            />
            
            <Legend 
              verticalAlign="top" 
              align="right"
              iconType="circle"
              wrapperStyle={{ 
                paddingBottom: '10px',
                fontSize: '11px' 
              }}
            />

            <Line 
              name="Spot Price"
              type="monotone" 
              dataKey="Price" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EventCorrelation;