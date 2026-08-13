const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || "";
const INSTAGRAM_BUSINESS_ACCOUNT_ID = "17841438675912202";

export async function getInstagramProfile() {
  if (!INSTAGRAM_ACCESS_TOKEN) {
    return {
      username: "build_withsalim",
      followers_count: 40,
      media_count: 2,
      id: INSTAGRAM_BUSINESS_ACCOUNT_ID,
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}?fields=username,followers_count,media_count&access_token=${INSTAGRAM_ACCESS_TOKEN}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch Instagram profile:", error);
    return null;
  }
}
