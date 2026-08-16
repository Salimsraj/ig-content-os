import { getCached, setCached } from "@/lib/apify-cache";
import { median, multipleOf } from "@/lib/outlier-score";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return Response.json({ error: "Username parameter required" }, { status: 400 });
  }

  const cacheKey = username.toLowerCase().trim();
  const cached = getCached<{ username: string; posts: unknown[] }>("instagram", cacheKey);
  if (cached) {
    return Response.json({ ...cached, cached: true });
  }

  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    return Response.json({ error: "Apify token not configured" }, { status: 400 });
  }

  try {
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directUrls: [`https://www.instagram.com/${username}/`],
          resultsType: "posts",
          resultsLimit: 30,
          searchType: "user",
        }),
      }
    );

    if (!runResponse.ok) {
      const errText = await runResponse.text();
      console.error("Apify Instagram scrape error:", errText);
      return Response.json({ error: "Failed to scrape Instagram" }, { status: 500 });
    }

    const items: any[] = (await runResponse.json()) || [];

    interface RawPost {
      id: string;
      type: string;
      caption: string;
      thumbnail: string;
      videoUrl: string;
      likes: number;
      comments: number;
      views: number;
      url: string;
      timestamp: string;
      engagementScore: number;
    }

    const rawPosts: RawPost[] = items.map((item: any) => {
      const views = item.videoViewCount || item.videoPlayCount || 0;
      const likes = item.likesCount || 0;
      const comments = item.commentsCount || 0;
      return {
        id: item.id || item.shortCode,
        type: item.type,
        caption: item.caption || "",
        thumbnail: item.displayUrl || "",
        videoUrl: item.videoUrl || "",
        likes,
        comments,
        views,
        url: item.url,
        timestamp: item.timestamp,
        engagementScore: views > 0 ? views : likes + comments * 3,
      };
    });

    // Outlier multiple: this post's engagement vs. this account's OWN median
    // across the batch. A big account's normal post will always beat a small
    // account's raw numbers, but the multiple shows whose IDEA actually won.
    const accountMedian = median(rawPosts.map((p) => p.engagementScore));
    const posts = rawPosts
      .map((p) => ({ ...p, multiple: multipleOf(p.engagementScore, accountMedian) }))
      .sort((a, b) => (b.multiple ?? -1) - (a.multiple ?? -1))
      .slice(0, 12);

    const result = { username, accountMedian, posts };
    setCached("instagram", cacheKey, result);
    return Response.json(result);
  } catch (error) {
    console.error("Instagram scrape error:", error);
    return Response.json({ error: "Failed to scrape Instagram account" }, { status: 500 });
  }
}
