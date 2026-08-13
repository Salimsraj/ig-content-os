import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const HISTORY_FILE = path.join(process.cwd(), "data", "follower-history.json");

function readFollowerHistory(): Record<string, number> {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeFollowerHistory(history: Record<string, number>) {
  fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'day';

  // Account-level insights only accept period=day with metric_type=total_value.
  // Multi-day windows are built via since/until timestamps, not period=week/month.
  const daysMap: { [key: string]: number } = {
    day: 1,
    '7day': 7,
    '28day': 28,
    '30day': 30,
    '60day': 60,
    '90day': 90,
  };

  const days = daysMap[period] || 1;
  const until = Math.floor(Date.now() / 1000);
  const since = until - days * 86400;

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!token || !igId) {
    return Response.json({ error: "Missing Instagram credentials" }, { status: 400 });
  }

  try {
    const profileResponse = await fetch(
      `https://graph.facebook.com/v21.0/${igId}?fields=followers_count,media_count&access_token=${token}`
    );
    const profileData = await profileResponse.json();

    if (profileData.error) {
      console.error("Instagram API Error:", profileData.error);
      return Response.json({ error: profileData.error.message }, { status: 400 });
    }

    const insightsResponse = await fetch(
      `https://graph.facebook.com/v21.0/${igId}/insights?metric=reach,views,total_interactions,profile_views&period=day&metric_type=total_value&since=${since}&until=${until}&access_token=${token}`
    );
    const insightsData = await insightsResponse.json();

    let totalReach = 0;
    let totalViews = 0;
    let totalEngagement = 0;
    let profileViews = 0;
    let newFollows = 0;

    insightsData.data?.forEach((metric: any) => {
      if (metric.name === "reach") totalReach = metric.total_value?.value || 0;
      if (metric.name === "views") totalViews = metric.total_value?.value || 0;
      if (metric.name === "total_interactions") totalEngagement = metric.total_value?.value || 0;
      if (metric.name === "profile_views") profileViews = metric.total_value?.value || 0;
    });

    const totalFollowers = profileData.followers_count || 0;

    // Instagram's follows_and_unfollows metric comes back empty for small/new
    // accounts, so we track follower count ourselves in a local daily snapshot
    // and diff against it instead.
    const todayStr = new Date().toISOString().slice(0, 10);
    const history = readFollowerHistory();
    history[todayStr] = totalFollowers;
    writeFollowerHistory(history);

    const targetDateStr = new Date(until * 1000 - days * 86400 * 1000)
      .toISOString()
      .slice(0, 10);
    const baselineDate = Object.keys(history)
      .filter((d) => d <= targetDateStr)
      .sort()
      .pop();

    let hasFollowerBaseline = false;
    if (baselineDate) {
      newFollows = totalFollowers - history[baselineDate];
      hasFollowerBaseline = true;
    }
    const engagementRate =
      totalFollowers > 0 ? ((totalEngagement / totalFollowers) * 100).toFixed(2) : "0";

    return Response.json({
      totalFollowers,
      mediaCount: profileData.media_count || 0,
      reach: totalReach,
      impressions: totalViews,
      engagement: totalEngagement,
      engagementRate: parseFloat(engagementRate as string),
      profileViews,
      newFollows,
      hasFollowerBaseline,
    });
  } catch (error) {
    console.error("Failed to fetch Instagram insights:", error);
    return Response.json({ error: "Failed to fetch Instagram data" }, { status: 500 });
  }
}
