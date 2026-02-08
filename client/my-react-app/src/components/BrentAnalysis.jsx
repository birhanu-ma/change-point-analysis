import React, { useState, useEffect } from 'react';
import { getChangePoint } from '../api/api';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

const CustomTooltip = ({ active, mu1, mu2 }) => {
  if (active) {
    return (
      <div className="bg-[#0f172a]/95 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-sm">
        <p className="text-white font-bold text-sm mb-1">
          mu_1: <span className="text-blue-400 ml-1">{mu1.toFixed(5)}</span>
        </p>
        <p className="text-white font-bold text-sm">
          mu_2: <span className="text-amber-400 ml-1">{mu2.toFixed(4)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const BrentAnalysis = () => {
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChangePoint().then(res => {
      setImpactData(res.data.impact_analysis);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const generateBellCurve = (mean, sigma, name) => {
    const points = [];
    const start = mean - 0.4; 
    const end = mean + 0.4;
    const step = (end - start) / 80;
    for (let x = start; x <= end; x += step) {
      const exponent = -0.5 * Math.pow((x - mean) / sigma, 2);
      const y = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
      points.push({ x: parseFloat(x.toFixed(4)), [name]: y });
    }
    return points;
  };

  if (loading || !impactData) return <div className="p-10 text-white">Loading...</div>;

  const { mu1_mean, mu2_mean, volatility_sigma, percent_change } = impactData;
  const curve1 = generateBellCurve(mu1_mean, volatility_sigma, "mu1");
  const curve2 = generateBellCurve(mu2_mean, volatility_sigma, "mu2");
  const combinedData = [...curve1, ...curve2].sort((a, b) => a.x - b.x);

  return (
    <div className="p-6 bg-[#0a0f1d] text-white rounded-xl border border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
      
      {/* Header with explicit Right-Side Safe Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-800 pb-6 items-center">
        
        {/* Left Side: Titles */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-emerald-400 tracking-tight">Regime Impact</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Bayesian Posterior Modeling</p>
        </div>

        {/* Right Side: Percentage Shift Badge (Pushed away from the absolute Close button) */}
        <div className="flex justify-start md:justify-end mt-4 md:mt-0">
          <div className="bg-emerald-500/10 px-6 py-2 rounded-lg border border-emerald-500/20 md:mr-32">
            <p className="text-[10px] text-emerald-500/70 uppercase font-black text-center">Shift Magnitude</p>
            <p className="text-2xl font-mono text-emerald-400">+{percent_change?.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="bg-[#0f172a]/40 p-6 rounded-2xl border border-slate-800/50">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-8 text-center tracking-[0.3em]">
          Mean Transition Probability
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedData}>
              <XAxis 
                dataKey="x" 
                type="number" 
                domain={['auto', 'auto']} 
                stroke="#334155" 
                fontSize={10}
                tickFormatter={(v) => v.toFixed(2)}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip mu1={mu1_mean} mu2={mu2_mean} />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="mu1" stroke="#3b82f6" strokeWidth={2} fillOpacity={0.1} fill="#3b82f6" connectNulls />
              <Area type="monotone" dataKey="mu2" stroke="#f59e0b" strokeWidth={2} fillOpacity={0.1} fill="#f59e0b" connectNulls />
              <ReferenceLine x={mu1_mean} stroke="#3b82f6" strokeDasharray="3 3" />
              <ReferenceLine x={mu2_mean} stroke="#f59e0b" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6">
        <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Volatility (sigma)</p>
          <p className="text-xl font-mono text-slate-200">{volatility_sigma?.toFixed(6)}</p>
        </div>
        <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Mean Delta</p>
          <p className="text-xl font-mono text-slate-200">{(mu2_mean - mu1_mean).toFixed(5)}</p>
        </div>
      </div>
    </div>
  );
};

export default BrentAnalysis;