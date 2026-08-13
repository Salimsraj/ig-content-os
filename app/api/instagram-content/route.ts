import fs from "fs";
import path from "path";
import { generateHookRewrite } from "@/lib/hook-rewriter";
import { getBlockChildren, blockToText } from "@/lib/notion";
import { median, multipleOf } from "@/lib/outlier-score";

export const dynamic = "force-dynamic";

function readOwnReelTranscripts(): Record<string, string> {
  try {
    const file = path.join(process.cwd(), "data", "own-reel-transcripts.json");
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return {};
  }
}

function firstLine(text: string): string {
  return text.split("\n").map((l) => l.trim()).find((l) => l.length > 0) || text.slice(0, 100);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function richTextToPlain(richText: any[] | undefined): string {
  return (richText ?? []).map((t) => t.plain_text).join("");
}

type CalendarItem = { id: string; caption: string; date: string | null };

async function getCalendarItems(): Promise<CalendarItem[]> {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_IDEAS_DB_ID;
  if (!apiKey || !databaseId) return [];

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 100 }),
    });
    const data = await response.json();
    if (!data.results) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.results.map((item: any) => ({
      id: item.id,
      caption: richTextToPlain(item.properties?.Caption?.rich_text),
      date: item.properties?.["Post Date"]?.date?.start || null,
    }));
  } catch {
    return [];
  }
}

// Matches a posted Instagram reel back to its Notion calendar item, so we can
// pull the real script (page body) instead of relying on the IG caption —
// captions are marketing copy, not the spoken hook.
function findCalendarMatch(
  igCaption: string,
  igTimestamp: string,
  items: CalendarItem[]
): CalendarItem | undefined {
  const trimmedCaption = igCaption.trim();
  if (trimmedCaption) {
    const exact = items.find((i) => i.caption.trim() && i.caption.trim() === trimmedCaption);
    if (exact) return exact;
  }
  const igDate = igTimestamp?.slice(0, 10);
  if (igDate) {
    return items.find((i) => i.date === igDate);
  }
  return undefined;
}

async function getScriptHook(
  post: { caption: string; timestamp: string },
  calendarItems: CalendarItem[]
): Promise<string | null> {
  const match = findCalendarMatch(post.caption, post.timestamp, calendarItems);
  if (!match) return null;
  try {
    const blocks = await getBlockChildren(match.id);
    const body = blocks.map(blockToText).join("\n");
    return body.trim() ? firstLine(body) : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!token || !igId) {
    return Response.json({ error: "Missing Instagram credentials" }, { status: 400 });
  }

  try {
    // Fetch media data with engagement metrics
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v21.0/${igId}/media?fields=id,media_type,timestamp,media_product_type,thumbnail_url,caption,like_count,comments_count,permalink&access_token=${token}`
    );
    const mediaData = await mediaResponse.json();

    if (mediaData.error) {
      console.error("Instagram API Error:", mediaData.error);
      return Response.json({ error: mediaData.error.message }, { status: 400 });
    }

    // Fetch each post with insights
    const postsWithImages = await Promise.all(
      (mediaData.data || []).map(async (media: any) => {
        let views = 0;
        let reach = 0;
        let shares = 0;
        let saves = 0;
        let avgWatchTimeMs = 0;
        let totalWatchTimeMs = 0;
        let skipRate = 0;

        try {
          // Valid Graph API metric names: reach, shares, saved, views, likes, comments, total_interactions
          let metricParams = "reach,shares,saved";
          const isReel = media.media_product_type === "REELS";
          if (media.media_type === "VIDEO" || media.media_type === "REELS") {
            metricParams += ",views";
          }
          if (isReel) {
            metricParams += ",ig_reels_avg_watch_time,ig_reels_video_view_total_time,reels_skip_rate";
          }

          const insightResponse = await fetch(
            `https://graph.facebook.com/v21.0/${media.id}/insights?metric=${metricParams}&access_token=${token}`
          );
          const insightData = await insightResponse.json();

          if (insightData.error) {
            console.error(`Insights error for post ${media.id}:`, insightData.error.message);
          }

          insightData.data?.forEach((metric: any) => {
            if (metric.name === "reach") reach = metric.values?.[0]?.value || 0;
            if (metric.name === "views") views = metric.values?.[0]?.value || 0;
            if (metric.name === "shares") shares = metric.values?.[0]?.value || 0;
            if (metric.name === "saved") saves = metric.values?.[0]?.value || 0;
            if (metric.name === "ig_reels_avg_watch_time") avgWatchTimeMs = metric.values?.[0]?.value || 0;
            if (metric.name === "ig_reels_video_view_total_time") totalWatchTimeMs = metric.values?.[0]?.value || 0;
            if (metric.name === "reels_skip_rate") skipRate = metric.values?.[0]?.value || 0;
          });
        } catch (error) {
          console.error(`Failed to fetch insights for post ${media.id}:`, error);
        }

        return {
          ...media,
          views,
          reach,
          shares,
          saves,
          avgWatchTimeMs,
          totalWatchTimeMs,
          skipRate,
        };
      })
    );

    // Aggregate by media type and get top posts
    const contentByType: { [key: string]: number } = {
      REELS: 0,
      IMAGE: 0,
      VIDEO: 0,
      CAROUSEL_ALBUM: 0,
    };

    const allPosts = postsWithImages.map((media: any) => {
      const type = media.media_type || "IMAGE";
      if (contentByType[type] !== undefined) {
        contentByType[type] += 1;
      }

      const likes = media.like_count || 0;
      const comments = media.comments_count || 0;
      const views = media.views || 0;
      const reach = media.reach || 0;
      const shares = media.shares || 0;
      const saves = media.saves || 0;
      const avgWatchTimeSeconds = Math.round((media.avgWatchTimeMs || 0) / 1000);
      const totalWatchTimeMinutes = Math.round((media.totalWatchTimeMs || 0) / 60000);
      const isReel = media.media_product_type === "REELS";

      return {
        id: media.id,
        type,
        isReel,
        permalink: media.permalink || "",
        thumbnail: media.thumbnail_url || media.igvideo_media?.thumbnail_url || "",
        likes,
        comments,
        views,
        reach,
        shares,
        saves,
        avgWatchTimeSeconds,
        totalWatchTimeMinutes,
        skipRate: media.skipRate || 0,
        saveRate: views > 0 ? saves / views : 0,
        shareRate: views > 0 ? shares / views : 0,
        commentRate: views > 0 ? comments / views : 0,
        caption: media.caption || "",
        timestamp: media.timestamp,
      };
    });

    // Account averages across reels, used to flag each reel relative to your own baseline
    const reels = allPosts.filter((p) => p.isReel);
    const avg = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0);
    const reelAverages = {
      skipRate: avg(reels.map((r) => r.skipRate)),
      saveRate: avg(reels.map((r) => r.saveRate)),
      shareRate: avg(reels.map((r) => r.shareRate)),
      commentRate: avg(reels.map((r) => r.commentRate)),
      avgWatchTimeSeconds: avg(reels.map((r) => r.avgWatchTimeSeconds)),
      reach: avg(reels.map((r) => r.reach)),
    };

    // Retention-curve diagnosis. Instagram's Graph API does not expose a real
    // frame-by-frame retention curve (only visible natively in-app) — this is
    // an approximation using skip rate (early drop-off), avg watch time
    // relative to this account's own average (proxy for whether the curve is
    // flat or falls off after the hook), and reach relative to average
    // (proxy for distribution vs. content quality).
    const HIGH_SKIP = 50;
    const LOW_SKIP = 30;
    const WATCH_FLOOR = 0.6; // well below account average = "cliff"
    const WATCH_CEILING = 0.9; // near/above account average = "flat, stayers satisfied"
    const REACH_FLOOR = 0.7; // well below account average reach = distribution-limited

    function diagnoseCurve(post: (typeof allPosts)[number]) {
      if (!post.isReel || post.views === 0 || reels.length < 2) return null;

      const watchRatio = reelAverages.avgWatchTimeSeconds > 0
        ? post.avgWatchTimeSeconds / reelAverages.avgWatchTimeSeconds
        : 1;
      const reachRatio = reelAverages.reach > 0 ? post.reach / reelAverages.reach : 1;

      const highSkip = post.skipRate >= HIGH_SKIP;
      const lowSkip = post.skipRate < LOW_SKIP;
      const flatWatch = watchRatio >= WATCH_CEILING;
      const cliffWatch = watchRatio < WATCH_FLOOR;
      const lowReach = reachRatio < REACH_FLOOR;

      if (highSkip && flatWatch) {
        return {
          pattern: "High skip rate, flat curve after",
          meaning: "The hook is losing people, but whoever stays is satisfied",
          fix: "Only the hook. Leave the rest alone",
          severity: "issue" as const,
        };
      }
      if (lowSkip && cliffWatch) {
        return {
          pattern: "Low skip rate, curve falls off a cliff at 5-8s",
          meaning: "The hook wrote a cheque the content did not cover",
          fix: "The payoff, not the hook",
          severity: "issue" as const,
        };
      }
      if (highSkip && cliffWatch) {
        return {
          pattern: "High skip rate, curve falls steadily",
          meaning: "Topic or format mismatch for this audience",
          fix: "The idea, before the execution",
          severity: "issue" as const,
        };
      }
      if (lowSkip && flatWatch && lowReach) {
        return {
          pattern: "Low skip rate, flat curve, low reach",
          meaning: "Hook and content are working; distribution is the constraint",
          fix: "Sends and shares, not the opening",
          severity: "distribution" as const,
        };
      }
      if (lowSkip && flatWatch) {
        return {
          pattern: "Low skip rate, flat curve, healthy reach",
          meaning: "Hook, content, and distribution are all working",
          fix: "Nothing — repeat this format",
          severity: "good" as const,
        };
      }
      return null;
    }

    // Outlier multiple: each post's views vs. the median of your own last
    // batch of view-bearing posts (reels/videos), so "top posts" surfaces
    // what actually beat your normal, not just whatever has the biggest
    // audience-driven raw number.
    const viewMedian = median(allPosts.filter((p) => p.views > 0).map((p) => p.views));

    const withDiagnosis = allPosts
      .map((post) => ({
        ...post,
        multiple: multipleOf(post.views, viewMedian),
        curveDiagnosis: diagnoseCurve(post),
      }))
      .sort((a, b) => (b.multiple ?? -1) - (a.multiple ?? -1))
      .slice(0, 12);

    // The real hook is the first spoken line of the script, not the IG
    // caption (which is marketing copy). Pull the script from the matching
    // Notion calendar item for every reel shown on the dashboard.
    const transcripts = readOwnReelTranscripts();
    const calendarItems = await getCalendarItems();
    const topPosts = await Promise.all(
      withDiagnosis.map(async (post) => {
        const ownTranscript = transcripts[post.id];
        const scriptHook = ownTranscript
          ? firstLine(ownTranscript)
          : await getScriptHook(post, calendarItems);

        const postWithHook = scriptHook ? { ...post, scriptHook } : post;

        // For reels with an actual issue, also generate a rewritten hook via
        // Claude — only when the hook is the diagnosed problem.
        if (!post.curveDiagnosis || post.curveDiagnosis.severity !== "issue" || !ownTranscript) {
          return postWithHook;
        }

        const originalHook = firstLine(ownTranscript);
        const rewrite = await generateHookRewrite(
          post.id,
          originalHook,
          ownTranscript,
          post.curveDiagnosis.pattern,
          post.skipRate
        );

        return rewrite ? { ...postWithHook, hookRewrite: rewrite } : postWithHook;
      })
    );

    // Format for dashboard
    const contentByCategory = [
      { category: "Reels", count: contentByType.REELS },
      { category: "Posts", count: contentByType.IMAGE },
      { category: "Videos", count: contentByType.VIDEO },
      { category: "Carousel", count: contentByType.CAROUSEL_ALBUM },
    ].filter((item) => item.count > 0);

    return Response.json({
      contentByType: contentByCategory,
      topPosts,
      reelAverages,
      viewMedian,
      totalPosts: mediaData.data?.length || 0,
    });
  } catch (error) {
    console.error("Failed to fetch content data:", error);
    return Response.json({ error: "Failed to fetch content data" }, { status: 500 });
  }
}
