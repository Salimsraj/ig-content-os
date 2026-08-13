"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Eye, Users, UserPlus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ReelImproveHook } from "@/components/reel-improve-hook";

type CurveDiagnosis = {
  pattern: string;
  meaning: string;
  fix: string;
  severity: "issue" | "distribution" | "good";
};

type HookRewrite = {
  rewrittenHook: string;
  principle: string;
};

type ReelDiagnostic = {
  id: string;
  thumbnail: string;
  caption: string;
  scriptHook?: string;
  views: number;
  skipRate: number;
  avgWatchTimeSeconds: number;
  saveRate: number;
  shareRate: number;
  commentRate: number;
  curveDiagnosis: CurveDiagnosis | null;
  hookRewrite: HookRewrite | null;
};

export default function Home() {
  const [period, setPeriod] = useState("day");
  const [data, setData] = useState({
    totalFollowers: 0,
    reach: 0,
    impressions: 0,
    engagement: 0,
    engagementRate: 0,
    mediaCount: 0,
    profileViews: 0,
    newFollows: 0,
    hasFollowerBaseline: false,
    loading: true,
  });

  const [contentByCategory, setContentByCategory] = useState<Array<{ category: string; count: number; views?: number }>>([]);
  const [reelDiagnostics, setReelDiagnostics] = useState<ReelDiagnostic[]>([]);

  useEffect(() => {
    async function fetchInstagramData() {
      setData((prev) => ({ ...prev, loading: true }));
      try {
        const insightsResponse = await fetch(`/api/instagram-insights?period=${period}`);
        const insightsResult = await insightsResponse.json();

        const contentResponse = await fetch("/api/instagram-content");
        const contentResult = await contentResponse.json();

        if (insightsResult.error) {
          console.error("API Error:", insightsResult.error);
          setData((prev) => ({ ...prev, loading: false }));
          return;
        }

        setData({
          totalFollowers: insightsResult.totalFollowers,
          reach: insightsResult.reach,
          impressions: insightsResult.impressions,
          engagement: insightsResult.engagement,
          engagementRate: insightsResult.engagementRate || 8.2,
          mediaCount: insightsResult.mediaCount,
          profileViews: insightsResult.profileViews || 0,
          newFollows: insightsResult.newFollows || 0,
          hasFollowerBaseline: insightsResult.hasFollowerBaseline || false,
          loading: false,
        });

        if (contentResult.contentByType) {
          setContentByCategory(contentResult.contentByType);
        }

        if (contentResult.topPosts) {
          const reels = contentResult.topPosts
            .filter((p: any) => p.isReel)
            .map((p: any) => ({
              id: p.id,
              thumbnail: p.thumbnail,
              caption: p.caption,
              scriptHook: p.scriptHook,
              views: p.views || 0,
              skipRate: p.skipRate || 0,
              avgWatchTimeSeconds: p.avgWatchTimeSeconds || 0,
              saveRate: p.saveRate || 0,
              shareRate: p.shareRate || 0,
              commentRate: p.commentRate || 0,
              curveDiagnosis: p.curveDiagnosis || null,
              hookRewrite: p.hookRewrite || null,
            }));
          setReelDiagnostics(reels);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setData((prev) => ({ ...prev, loading: false }));
      }
    }

    fetchInstagramData();
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
            <h1 className="text-3xl font-semibold text-black">Main Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">build_withsalim@</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Live Data
        </p>
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

      {/* Growth Alert */}
      {data.totalFollowers > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-900">
            {data.hasFollowerBaseline ? (
              <>
                <span className="font-semibold">🎉 Growth Alert:</span> You gained <span className="font-bold">{data.newFollows}</span> new followers and <span className="font-bold">{data.impressions > 1000 ? `${(data.impressions / 1000).toFixed(1)}K` : data.impressions}</span> views {periodLabels[period as keyof typeof periodLabels]?.toLowerCase()}
              </>
            ) : (
              <>
                <span className="font-semibold">📊 Tracking started:</span> We're now recording your follower count daily — growth numbers will show up starting tomorrow.
              </>
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Interactions</p>
                <p className="text-2xl font-bold text-black mt-1">
                  {data.loading ? "—" : data.engagement}
                </p>
                <p className="text-xs text-gray-500 mt-1">Likes, comments, shares</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Accounts Reached</p>
                <p className="text-2xl font-bold text-black mt-1">
                  {data.loading ? "—" : data.reach > 1000 ? `${(data.reach / 1000).toFixed(1)}K` : data.reach}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Views</p>
                <p className="text-2xl font-bold text-black mt-1">
                  {data.loading ? "—" : data.impressions > 1000 ? `${(data.impressions / 1000).toFixed(1)}K` : data.impressions}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total impressions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Followers</p>
                <p className="text-2xl font-bold text-black mt-1">
                  {data.loading ? "—" : data.totalFollowers > 1000 ? `${(data.totalFollowers / 1000).toFixed(1)}K` : data.totalFollowers}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total followers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-black mb-6">Content by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
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

      {/* Reel Diagnostics */}
      <div>
        <h3 className="text-lg font-semibold text-black mb-1">Reel Diagnostics</h3>
        <p className="text-sm text-gray-500 mb-4">Retention-curve pattern for each reel, and what it means for what to fix next</p>

        {reelDiagnostics.length > 0 ? (
          <div className="space-y-3">
            {reelDiagnostics.map((reel) => {
              const d = reel.curveDiagnosis;
              const severityStyle =
                d?.severity === "good"
                  ? "bg-green-50 text-green-700"
                  : d?.severity === "distribution"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-red-50 text-red-700";

              return (
                <Card key={reel.id} className="border border-gray-200 shadow-sm bg-white overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4 items-center">
                      <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-gray-200">
                        {reel.thumbnail ? (
                          <img src={reel.thumbnail} alt={reel.caption} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 line-clamp-1 mb-2">{reel.caption || "No caption"}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                          <span><span className="font-semibold text-gray-900">{reel.skipRate}%</span> skip rate</span>
                          <span><span className="font-semibold text-gray-900">{reel.avgWatchTimeSeconds}s</span> avg watch</span>
                          <span><span className="font-semibold text-gray-900">{(reel.saveRate * 100).toFixed(1)}%</span> save rate</span>
                          <span><span className="font-semibold text-gray-900">{(reel.commentRate * 100).toFixed(1)}%</span> comment rate</span>
                        </div>
                      </div>

                      {d && (
                        <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${severityStyle}`}>
                          {d.severity === "good" ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <AlertTriangle className="w-4 h-4" />
                          )}
                          <p>{d.pattern}</p>
                        </div>
                      )}
                    </div>
                    {d && (
                      <div className="mt-2 pl-20 space-y-0.5">
                        <p className="text-xs text-gray-500">{d.meaning}</p>
                        <p className="text-xs text-gray-900 font-medium">Fix: {d.fix}</p>
                      </div>
                    )}
                    {reel.hookRewrite && (
                      <div className="mt-3 ml-20 bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-purple-700 uppercase mb-1">Write this instead</p>
                        <p className="text-sm text-purple-900 font-medium mb-2" dir="rtl">
                          {reel.hookRewrite.rewrittenHook}
                        </p>
                        <p className="text-xs text-purple-600">{reel.hookRewrite.principle}</p>
                      </div>
                    )}
                    <ReelImproveHook
                      hook={reel.scriptHook || reel.hookRewrite?.rewrittenHook || reel.caption}
                      skipRate={reel.skipRate}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No reels data yet</p>
        )}
      </div>

    </div>
  );
}
