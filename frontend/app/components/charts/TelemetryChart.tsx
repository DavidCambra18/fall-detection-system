'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TelemetryChartProps {
  data: { timestamp: string; value: number }[];
}

export default function TelemetryChart({ data }: TelemetryChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // asegura que solo renderice en el cliente
  }, []);

  if (!mounted) return null; // evita renderizar en SSR o antes de tener tamaño

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-lg p-4" style={{ minWidth: 0, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#1D4ED8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
