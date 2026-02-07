export default function SummaryCards({ impact }) {
  if (!impact) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fadeIn">
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Price Regime Shift</p>
        <p className="text-lg font-mono flex items-center gap-2">
          {impact.avg_price_pre?.toFixed(2)} <span className="text-primary">→</span> {impact.avg_price_post?.toFixed(2)}
        </p>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Return Shift (mu)</p>
        <p className="text-lg font-mono">
          {impact.mu1_mean?.toFixed(4)} <span className="text-primary">→</span> {impact.mu2_mean?.toFixed(4)}
        </p>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Volatility (sigma)</p>
        <p className="text-lg font-mono">{impact.volatility_sigma?.toFixed(5)}</p>
      </div>

      <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 shadow-sm">
        <p className="text-xs text-primary uppercase font-bold mb-1">Regime Impact</p>
        <p className="text-2xl font-bold text-primary">+{impact.percent_change?.toFixed(2)}%</p>
      </div>
    </div>
  );
}