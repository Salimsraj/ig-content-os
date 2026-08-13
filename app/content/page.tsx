"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BarChart, Bar, YAxis, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Heart, MessageCircle, Bookmark, Eye, Share2 } from "lucide-react";

export default function ContentPage() {
  const [period, setPeriod] = useState("day");
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [topPosts, setTopPosts] = useState<
    Array<{
      id: string;
      type: string;
      thumbnail: string;
      likes: number;
      comments: number;
      views: number;
      shares: number;
      saves: number;
      reach: number;
      caption: string;
      timestamp?: string;
      multiple?: number | null;
    }>
  >([]);

  const [contentByType, setContentByType] = useState<
    Array<{ category: string; count: number }>
  >([]);

  useEffect(() => {
    async function fetchContentData() {
      try {
        const contentResponse = await fetch("/api/instagram-content");
        const contentResult = await contentResponse.json();

        const insightsResponse = await fetch(`/api/instagram-insights?period=${period}`);
        const insightsResult = await insightsResponse.json();

        if (contentResult.topPosts) {
          setTopPosts(contentResult.topPosts);
        }

        if (contentResult.contentByType) {
          setContentByType(contentResult.contentByType);
        }

        if (insightsResult.totalFollowers) {
          setTotalFollowers(insightsResult.totalFollowers);
        }
      } catch (error) {
        console.error("Failed to fetch content data:", error);
      }
    }

    fetchContentData();
  }, [period]);

  const periodLabels = {
    day: "Today",
    "7day": "Last 7 Days",
    "28day": "Last 28 Days",
    "30day": "Last 30 Days",
    "60day": "Last 60 Days",
    "90day": "Last 3 Months",
  };

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 bg-white min-h-screen" dir="auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-semibold text-black">التحليلات</h1>
            <p className="text-sm text-gray-500 mt-1">All your posts and performance</p>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="w-full md:w-48">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 font-medium text-sm bg-white text-black hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
        >
          {Object.entries(periodLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Posts</p>
            <p className="text-4xl font-bold text-black mt-3">{topPosts.length}</p>
            <p className="text-sm text-gray-600 mt-2">All your content</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Content Types</p>
            <p className="text-4xl font-bold text-black mt-3">{contentByType.length}</p>
            <p className="text-sm text-gray-600 mt-2">Different formats</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Top Format</p>
            <p className="text-4xl font-bold text-black mt-3">
              {contentByType.length > 0
                ? contentByType.reduce((a, b) => (a.count > b.count ? a : b)).category
                : "—"}
            </p>
            <p className="text-sm text-gray-600 mt-2">Most used type</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Followers</p>
            <p className="text-4xl font-bold text-black mt-3">
              {totalFollowers > 1000 ? `${(totalFollowers / 1000).toFixed(1)}K` : totalFollowers}
            </p>
            <p className="text-sm text-gray-600 mt-2">Total followers</p>
          </CardContent>
        </Card>
      </div>

      {contentByType.length > 0 && (
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-black mb-6">Content Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contentByType} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={95} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {topPosts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-black mb-4">All Posts</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topPosts.map((post) => (
              <div key={post.id} className="rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm">
                <div className="relative w-full aspect-square bg-gray-200 overflow-hidden">
                  {post.thumbnail ? (
                    <img
                      src={post.thumbnail}
                      alt={post.caption || "Post"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                  {post.multiple != null && (
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white ${
                        post.multiple >= 3 ? "bg-black" : "bg-black/50"
                      }`}
                      title="Views vs. your median post"
                    >
                      {post.multiple}x
                    </span>
                  )}
                </div>

                <div className="px-3 pt-3">
                  {post.timestamp && (
                    <p className="text-xs text-gray-400 mb-2">
                      {new Date(post.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                  {post.caption && (
                    <p className="text-xs text-gray-600 line-clamp-2">{post.caption}</p>
                  )}
                </div>

                <div className="flex justify-center gap-4 px-4 py-3 pb-3 border-t border-gray-100">
                  <div className="flex flex-col items-center gap-1">
                    <Heart className="w-4 h-4 text-gray-700" />
                    <span className="font-semibold text-sm text-black">{post.likes}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <MessageCircle className="w-4 h-4 text-gray-700" />
                    <span className="font-semibold text-sm text-black">{post.comments}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Share2 className="w-4 h-4 text-gray-700" />
                    <span className="font-semibold text-sm text-black">{post.shares}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Eye className="w-4 h-4 text-gray-700" />
                    <span className="font-semibold text-sm text-black">{post.views}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Bookmark className="w-4 h-4 text-gray-700" />
                    <span className="font-semibold text-sm text-black">{post.saves}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
