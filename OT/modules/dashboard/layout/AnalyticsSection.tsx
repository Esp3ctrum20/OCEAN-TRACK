
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend 
} from 'recharts';
import { AppTheme } from '../../../types';

interface Props {
  chartData: any[];
  pieData: any[];
  theme?: AppTheme;
  chartLabel?: string;
}

export const AnalyticsSection: React.FC<Props> = ({ chartData, pieData, theme, chartLabel = "VOLUMEN KG RECIBIDO POR PRESENTACIÓN" }) => {
  const isLight = theme === 'pearl';

  const cardStyle = isLight 
    ? "bg-white border-zinc-200 shadow-sm" 
    : "bg-zinc-900/50 border-zinc-800 shadow-2xl";

  const textColor = isLight ? '#111827' : '#f4f4f5';
  const gridColor = isLight ? '#e5e7eb' : '#27272a';
  const subTextColor = isLight ? '#71717a' : '#71717a';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className={`lg:col-span-2 border p-8 rounded-2xl ${cardStyle}`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className={`font-bold uppercase text-xs tracking-widest ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>Producción Agrupada</h4>
            <p className={`text-[10px] mt-1 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>{chartLabel}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isLight ? 'bg-emerald-600' : 'bg-emerald-500'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${subTextColor}`}>Principal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isLight ? 'bg-blue-600' : 'bg-blue-500'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${subTextColor}`}>Solo</span>
            </div>
          </div>
        </div>
        <div className="h-[300px] w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: subTextColor, fontSize: 9, fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: subTextColor, fontSize: 10, fontWeight: 700 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isLight ? '#ffffff' : '#18181b', 
                  border: isLight ? '1px solid #e5e7eb' : '1px solid #3f3f46', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ fontSize: '10px', fontWeight: 'bold', color: textColor }}
                cursor={{ fill: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="coral" stackId="a" fill={isLight ? '#059669' : '#10b981'} radius={[0, 0, 0, 0]} barSize={40} />
              <Bar dataKey="solo" stackId="a" fill={isLight ? '#2563eb' : '#3b82f6'} radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`border p-8 rounded-2xl flex flex-col items-center justify-center ${cardStyle}`}>
        <div className="text-center mb-6">
          <h4 className={`font-bold uppercase text-xs tracking-widest ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>Distribución Mix</h4>
          <p className={`text-[10px] mt-1 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>BALANCE FINAL DE PRODUCTO</p>
        </div>
        <div className="h-[250px] w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={isLight ? entry.color.replace('500', '600') : entry.color} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isLight ? '#ffffff' : '#18181b', 
                  border: isLight ? '1px solid #e5e7eb' : '1px solid #3f3f46', 
                  borderRadius: '12px' 
                }}
                itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="bottom" align="center" iconType="circle" formatter={(value) => <span className={`text-[10px] font-bold uppercase tracking-widest ${subTextColor}`}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
