import React from 'react';
import { CountryStats } from '../types';
import { Users, Smile, TrendingUp, ShieldAlert, Coins, Calendar } from 'lucide-react';

interface Props {
  stats: CountryStats;
  delta?: Partial<CountryStats>; // To show changes visually if needed
}

const StatItem = ({ icon: Icon, label, value, subValue, colorClass, barColor }: any) => (
  <div className="flex flex-col bg-zinc-900 border border-zinc-800 p-3 rounded-lg min-w-[140px]">
    <div className="flex items-center gap-2 text-zinc-400 mb-1 text-xs uppercase tracking-wider font-semibold">
      <Icon size={14} />
      <span>{label}</span>
    </div>
    <div className="text-xl font-mono font-bold text-white tracking-tight">
      {value}
    </div>
    {subValue && <div className="text-xs text-zinc-500">{subValue}</div>}
    
    {/* Progress Bar for percentage based stats */}
    {typeof value === 'number' && label !== 'Year' && label !== 'Population' && label !== 'Treasury' && (
       <div className="w-full bg-zinc-800 h-1.5 mt-3 rounded-full overflow-hidden">
         <div 
            className={`h-full ${barColor}`} 
            style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
         />
       </div>
    )}
  </div>
);

const StatsDisplay: React.FC<Props> = ({ stats }) => {
  const getStabilityColor = (val: number) => {
    if (val > 70) return 'bg-emerald-500';
    if (val > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getHappinessColor = (val: number) => {
    if (val > 70) return 'bg-blue-500';
    if (val > 40) return 'bg-purple-500';
    return 'bg-orange-600';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full mb-6">
      <StatItem 
        icon={Calendar} 
        label="Year" 
        value={stats.year} 
      />
      <StatItem 
        icon={Users} 
        label="Population" 
        value={`${stats.population.toFixed(1)}M`} 
        subValue="Citizens"
      />
      <StatItem 
        icon={TrendingUp} 
        label="Economy" 
        value={stats.economy.toFixed(0)} 
        barColor="bg-cyan-500"
      />
      <StatItem 
        icon={Coins} 
        label="Treasury" 
        value={`$${stats.treasury.toFixed(1)}B`} 
        subValue="Reserves"
      />
      <StatItem 
        icon={Smile} 
        label="Happiness" 
        value={stats.happiness.toFixed(0)} 
        barColor={getHappinessColor(stats.happiness)}
      />
      <StatItem 
        icon={ShieldAlert} 
        label="Stability" 
        value={stats.stability.toFixed(0)} 
        barColor={getStabilityColor(stats.stability)}
      />
    </div>
  );
};

export default StatsDisplay;