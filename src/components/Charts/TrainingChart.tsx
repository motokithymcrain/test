import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface TrainingData {
  date: string;
  duration: number;
}

interface TrainingChartProps {
  data: TrainingData[];
}

export function TrainingChart({ data }: TrainingChartProps) {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return format(date, 'yyyy-MM-dd');
  });

  const chartData = last30Days.map(date => {
    const dayData = data.filter(d => d.date === date);
    const totalDuration = dayData.reduce((sum, d) => sum + d.duration, 0);
    return {
      date: format(new Date(date), 'MM/dd'),
      duration: totalDuration,
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">トレーニング時間の推移（30日間）</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            label={{ value: '時間（分）', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="duration"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ fill: '#16a34a', r: 4 }}
            activeDot={{ r: 6 }}
            name="トレーニング時間"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
