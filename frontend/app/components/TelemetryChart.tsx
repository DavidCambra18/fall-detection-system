'use client';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

export default function TelemetryChart({ data }: { data: any[] }) {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickMargin={10}
          />
          <YAxis 
            domain={[-2, 2]} 
            stroke="#94a3b8" 
            fontSize={12} 
            tickFormatter={(value) => `${value}G`} 
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '15px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
            }} 
          />
          <Legend 
            verticalAlign="top" 
            align="right"
            iconType="circle" 
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 'bold' }} 
          />
          <Line 
            type="monotone" 
            dataKey="acc_x" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            dot={false} 
            name="Eje X (Lateral)" 
            animationDuration={1000} 
          />
          <Line 
            type="monotone" 
            dataKey="acc_y" 
            stroke="#10b981" 
            strokeWidth={3} 
            dot={false} 
            name="Eje Y (Vertical)" 
            animationDuration={1000} 
          />
          <Line 
            type="monotone" 
            dataKey="acc_z" 
            stroke="#f59e0b" 
            strokeWidth={3} 
            dot={false} 
            name="Eje Z (Frontal)" 
            animationDuration={1000} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}