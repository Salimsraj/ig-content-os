"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ReachValue {
  value: number;
  end_time: string;
}

interface ReachChartProps {
  data: ReachValue[];
}

export function ReachChart({ data }: ReachChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.end_time).toLocaleDateString("ar-SA"),
    reach: item.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
          }}
          formatter={(value: any) => [value?.toLocaleString?.("ar-SA") ?? value ?? "0", "الوصول"]}
          labelFormatter={(label: any) => label}
        />
        <Line
          type="monotone"
          dataKey="reach"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: "#3b82f6", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
