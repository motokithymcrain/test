import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface GoalsProgressChartProps {
  activeGoals: number;
  completedGoals: number;
}

export function GoalsProgressChart({ activeGoals, completedGoals }: GoalsProgressChartProps) {
  const data = [
    { name: '進行中', value: activeGoals, color: '#3b82f6' },
    { name: '達成済み', value: completedGoals, color: '#16a34a' },
  ];

  const total = activeGoals + completedGoals;

  if (total === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">目標の進捗</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          目標を追加してください
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">目標の進捗</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
