import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
interface HabitChartEntry {
  date: string
  waterIntakeMl: number
  exerciseMinutes: number
  sleepHours: number
}

interface HabitChartProps {
  data: HabitChartEntry[]
  dataKey: keyof Pick<HabitChartEntry, 'waterIntakeMl' | 'exerciseMinutes' | 'sleepHours'>
  label: string
  color: string
  unit: string
}

function formatDate(dateStr: string) {
  return dateStr.slice(5).replace('-', '/')
}

export function HabitChart({ data, dataKey, label, color, unit }: HabitChartProps) {
  const chartData = [...data]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({
      date: formatDate(entry.date),
      value: entry[dataKey],
    }))

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">No data yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm" role="img" aria-label={`${label} chart`}>
      <p className="mb-3 text-sm font-semibold text-gray-700">{label}</p>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`${value} ${unit}`, label]}
            labelStyle={{ fontSize: 11 }}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.15}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
