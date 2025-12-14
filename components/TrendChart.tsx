import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { HistoryEntry } from '../types';

interface Props {
  history: HistoryEntry[];
}

const TrendChart: React.FC<Props> = ({ history }) => {
  const data = history.map(h => ({
    year: h.year,
    economy: h.statsSnapshot.economy,
    stability: h.statsSnapshot.stability,
    happiness: h.statsSnapshot.happiness,
  }));

  if (data.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-600 bg-zinc-900/50 rounded-lg border border-zinc-800 border-dashed">
        <span className="text-sm font-mono">Collect more data to generate trends...</span>
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
        <h3 className="text-xs font-mono uppercase text-zinc-500 mb-4">Historical Trends</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="year" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Line type="monotone" dataKey="economy" stroke="#06b6d4" strokeWidth={2} dot={false} name="Economy" />
          <Line type="monotone" dataKey="stability" stroke="#10b981" strokeWidth={2} dot={false} name="Stability" />
          <Line type="monotone" dataKey="happiness" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Happiness" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;