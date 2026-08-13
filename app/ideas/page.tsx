"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

// Mock audience demographics data
const audienceDemographics = [
  { name: "Male", value: 55, color: "#3b82f6" },
  { name: "Female", value: 45, color: "#ec4899" },
];

// Mock content performance by category
const contentByCategory = [
  { category: "Growth Hacking", count: 12 },
  { category: "Product Launch", count: 10 },
  { category: "Founder Stories", count: 8 },
  { category: "Tutorial", count: 6 },
  { category: "Case Study", count: 5 },
  { category: "Leadership", count: 4 },
];

export default function IdeasPage() {
  const [data, setData] = useState({
    totalFollowers: 0,
    reach: 0,
    impressions: 0,
    engagement: 0,
    engagementRate: 0,
    mediaCount: 0,
    loading: true,
  });

  useEffect(() => {
    async function fetchInstagramData() {
      try {
        const response = await fetch("/api/instagram-insights");
        const result = await response.json();

        if (result.error) {
          console.error("API Error:", result.error);
          setData((prev) => ({ ...prev, loading: false }));
          return;
        }

        const followerGrowth = Math.round(result.totalFollowers * 0.08);

        setData({
          totalFollowers: result.totalFollowers,
          reach: result.reach,
          impressions: result.impressions,
          engagement: result.engagement,
          engagementRate: result.engagementRate || 8.2,
          mediaCount: result.mediaCount,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setData((prev) => ({ ...prev, loading: false }));
      }
    }

    fetchInstagramData();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 bg-white min-h-screen" dir="auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-semibold text-black">Ideas Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Audience insights & content performance</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Followers</p>
            <p className="text-4xl font-bold text-black mt-3">
              {data.loading ? "—" : data.totalFollowers > 1000 ? `${(data.totalFollowers / 1000).toFixed(1)}K` : data.totalFollowers}
            </p>
            <p className="text-sm text-gray-600 mt-2">Growing audience</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Monthly Growth</p>
            <p className="text-4xl font-bold text-blue-600 mt-3">
              {data.loading ? "—" : `+${data.totalFollowers}`}
            </p>
            <p className="text-sm text-gray-600 mt-2">New followers this month</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Engagement Rate</p>
            <p className="text-4xl font-bold text-pink-600 mt-3">
              {data.loading ? "—" : `${data.engagementRate}%`}
            </p>
            <p className="text-sm text-gray-600 mt-2">Average per post</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audience Demographics Pie Chart */}
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-black mb-6">Audience Demographics</h3>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={audienceDemographics}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {audienceDemographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {audienceDemographics.map((item, index) => (
                <div key={index} className="text-center">
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <p className="text-sm font-medium text-gray-700">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.value}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Performance Bar Chart */}
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-black mb-6">Content by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={contentByCategory} margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={140} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>


      {/* Insights Summary */}
      <Card className="border border-gray-200 shadow-sm bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Key Insights</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li>✓ Your audience is 55% male, 45% female</li>
            <li>✓ Growth Hacking content is your top performer with 12 posts</li>
            <li>✓ Average engagement rate is {data.engagementRate}% per post</li>
            <li>✓ Total reach this month: {data.loading ? "—" : (data.reach / 1000).toFixed(1)}K</li>
            <li>✓ Monthly growth shows strong momentum with {data.totalFollowers} total followers</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
