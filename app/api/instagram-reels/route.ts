export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!token || !igId) {
    return Response.json({ error: "Missing Instagram credentials" }, { status: 400 });
  }

  try {
    // Fetch latest media (reels)
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v21.0/${igId}/media?fields=id,media_type,timestamp,caption,media_product_type&limit=8&access_token=${token}`
    );
    const mediaData = await mediaResponse.json();

    if (mediaData.error) {
      console.error("Instagram API Error:", mediaData.error);
      return Response.json({ error: mediaData.error.message }, { status: 400 });
    }

    // Filter for reels and get latest 8
    const reels = mediaData.data
      ?.filter((media: any) => media.media_product_type === "FEED" || media.media_type === "VIDEO")
      .slice(0, 8) || [];

    // Fetch insights for each reel
    const reelsWithMetrics = await Promise.all(
      reels.map(async (reel: any) => {
        try {
          const insightsResponse = await fetch(
            `https://graph.facebook.com/v21.0/${reel.id}/insights?metric=like_count,comments_count,shares_count,saved_count,reach&access_token=${token}`
          );
          const insightsData = await insightsResponse.json();

          let likes = 0;
          let comments = 0;
          let shares = 0;
          let saves = 0;
          let reach = 0;

          insightsData.data?.forEach((insight: any) => {
            if (insight.name === "like_count") likes = insight.total_value?.value || 0;
            if (insight.name === "comments_count") comments = insight.total_value?.value || 0;
            if (insight.name === "shares_count") shares = insight.total_value?.value || 0;
            if (insight.name === "saved_count") saves = insight.total_value?.value || 0;
            if (insight.name === "reach") reach = insight.total_value?.value || 0;
          });

          return {
            id: reel.id,
            timestamp: reel.timestamp,
            caption: reel.caption?.substring(0, 100) || "No caption",
            metrics: {
              likes,
              comments,
              shares,
              saves,
              reach,
            },
          };
        } catch (error) {
          console.error(`Failed to fetch metrics for reel ${reel.id}:`, error);
          return {
            id: reel.id,
            timestamp: reel.timestamp,
            caption: reel.caption?.substring(0, 100) || "No caption",
            metrics: {
              likes: 0,
              comments: 0,
              shares: 0,
              saves: 0,
              reach: 0,
            },
          };
        }
      })
    );

    return Response.json({
      reels: reelsWithMetrics,
    });
  } catch (error) {
    console.error("Failed to fetch Instagram reels:", error);
    return Response.json({ error: "Failed to fetch Instagram data" }, { status: 500 });
  }
}
