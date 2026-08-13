import { getCached, setCached } from "@/lib/apify-cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return Response.json({ error: "Query parameter required" }, { status: 400 });
  }

  const cacheKey = query.toLowerCase().trim();
  const cached = getCached<{ query: string; tweets: unknown[]; count: number }>("tweets", cacheKey);
  if (cached) {
    return Response.json({ ...cached, cached: true });
  }

  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    return Response.json({ error: "Apify token not configured" }, { status: 400 });
  }

  try {
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/apidojo~tweet-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchTerms: [query],
          sort: "Top",
          maxItems: 50,
          minimumFavorites: 500,
        }),
      }
    );

    if (!runResponse.ok) {
      const errText = await runResponse.text();
      console.error("Apify Twitter search error:", errText);
      return Response.json({ error: "Failed to search tweets" }, { status: 500 });
    }

    const items = await runResponse.json();

    // Exclude tweets that are hiring/job posts, giveaways, or pure self-promo —
    // these are viral but have nothing worth turning into an Instagram post.
    const excludePattern =
      /\b(hiring|we're looking for|now hiring|job opening|apply now|apply here|join our team|open roles?|giveaway|rt to win)\b/i;

    // Require an actual value signal — a framework, list, or lesson — not just
    // a hot take or personal anecdote with no reusable substance.
    const valuePattern =
      /\b(framework|playbook|system|strategy|steps?|lessons?|mistakes?|tips?|guide|breakdown|prompts?|template|workflow|process|checklist|formula|here'?s (what|how|why)|\d+\s*(ways|steps|things|prompts|lessons|mistakes))\b/i;

    const tweets = (items || [])
      .map((tweet: any) => ({
        id: tweet.id,
        text: tweet.text || tweet.fullText || "",
        author: tweet.author?.name || "Unknown",
        authorHandle: tweet.author?.userName || "",
        authorAvatar: tweet.author?.profilePicture || "",
        likes: tweet.likeCount || 0,
        retweets: tweet.retweetCount || 0,
        replies: tweet.replyCount || 0,
        url: tweet.twitterUrl || tweet.url || "",
        createdAt: tweet.createdAt,
        image: tweet.extendedEntities?.media?.find((m: any) => m.type === "photo")?.media_url_https || "",
      }))
      .filter((tweet: any) => !excludePattern.test(tweet.text) && valuePattern.test(tweet.text))
      .sort((a: any, b: any) => b.likes - a.likes)
      .slice(0, 20);

    const result = { query, tweets, count: tweets.length };
    setCached("tweets", cacheKey, result);
    return Response.json(result);
  } catch (error) {
    console.error("Twitter search error:", error);
    return Response.json({ error: "Failed to search tweets" }, { status: 500 });
  }
}
