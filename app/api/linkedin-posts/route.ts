import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_JWT;

  if (!url || !key) {
    return Response.json({ error: "Supabase credentials not configured" }, { status: 400 });
  }

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("content_posts")
      .select("*")
      .eq("source", "linkedin")
      .order("likes", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Supabase error:", error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Niche = GTM engineering for SaaS founders: outbound, cold email, sales
    // automation, Clay/AI workflows. content-os tags topic per-creator, not
    // per-post, so a "GTM" tag doesn't guarantee the post itself is tactical —
    // require the CONTENT to carry a niche signal, and drop posts that read as
    // personal-milestone brags regardless of their topic tag.
    const nicheKeywords =
      /\b(gtm|outbound|cold email|cold outreach|sales|automation|clay|workflow|prospecting|lead ?gen|leads|playbook|sdr|plg|crm|signal|agency|cro|revops|deliverability|lemlist|instantly|copywriting|icp)\b/i;
    const excludeTopics =
      /\b(hiring|leadership red flags|personal backstory|double standards|industry news|launch,)\b/i;
    const excludeContent =
      /\b(forbes 30|my parents|grateful|blessed|humbled|proud moment|life update|personal update|since i (posted|started|joined)|years? ago i (started|posted)|camera roll|(we.?re|now) hiring|join our team|open roles?)\b/i;

    // Normalize curly quotes to straight ones so "We're" (’) still matches
    // patterns written with a plain apostrophe (').
    const normalize = (s: string) => s.replace(/[‘’]/g, "'");

    const posts = (data || [])
      .filter((row: any) => {
        const topic = String(row.topic || "").trim();
        const content = normalize(String(row.content || ""));
        if (!topic || topic.toLowerCase() === "none") return false;
        if (excludeTopics.test(topic)) return false;
        if (excludeContent.test(content)) return false;
        // Topic is tagged per-creator, not per-post, so it's too coarse to
        // trust alone — require the post's own content to carry the signal.
        return nicheKeywords.test(content);
      })
      .map((row: any) => ({
        id: String(row.id || ""),
        creator: String(row.creator || ""),
        content: String(row.content || ""),
        likes: Number(row.likes || 0),
        comments: Number(row.comments || 0),
        reposts: Number(row.reposts || 0),
        topic: String(row.topic || ""),
        link: String(row.link || ""),
        imageUrl: String(row.image_url || ""),
        authorImageUrl: String(row.author_image_url || ""),
        date: String(row.date || ""),
      }));
    // Already sorted by likes from the query. Cap posts per creator so one
    // highly-viral creator (e.g. a LinkedIn-growth influencer with huge like
    // counts) doesn't crowd out smaller, more directly on-niche creators.
    const MAX_PER_CREATOR = 4;
    const perCreatorCount: Record<string, number> = {};
    const diversified = posts.filter((p) => {
      const count = perCreatorCount[p.creator] || 0;
      if (count >= MAX_PER_CREATOR) return false;
      perCreatorCount[p.creator] = count + 1;
      return true;
    });

    return Response.json({ posts: diversified.slice(0, 60) });
  } catch (error) {
    console.error("Failed to fetch LinkedIn posts:", error);
    return Response.json({ error: "Failed to fetch LinkedIn posts" }, { status: 500 });
  }
}
