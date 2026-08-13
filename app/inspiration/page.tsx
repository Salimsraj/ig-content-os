"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Heart, MessageCircle, Eye, Share2 } from "lucide-react";

const KEYWORDS = [
  "GTM strategy",
  "outbound sales",
  "AI cold email",
  "startup growth",
  "sales automation",
];

const IG_ACCOUNTS = ["leadgenman", "nick_saraev", "zauey.talks", "suprava.ss"];

type Tweet = {
  id: string;
  text: string;
  author: string;
  authorHandle: string;
  authorAvatar: string;
  likes: number;
  retweets: number;
  replies: number;
  url: string;
  image: string;
};

function proxied(url: string) {
  return url ? `/api/image-proxy?url=${encodeURIComponent(url)}` : "";
}

type IgPost = {
  id: string;
  type: string;
  caption: string;
  thumbnail: string;
  videoUrl: string;
  likes: number;
  comments: number;
  views: number;
  url: string;
  multiple?: number | null;
};

type LinkedInPost = {
  id: string;
  creator: string;
  content: string;
  likes: number;
  comments: number;
  reposts: number;
  topic: string;
  link: string;
  imageUrl: string;
  authorImageUrl: string;
};

type ContentType = "tweets" | "instagram" | "linkedin";

export default function InspirationPage() {
  const [contentType, setContentType] = useState<ContentType>("tweets");
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [tweetsLoading, setTweetsLoading] = useState(true);
  const [activeKeyword, setActiveKeyword] = useState(KEYWORDS[0]);

  const [igPosts, setIgPosts] = useState<IgPost[]>([]);
  const [igLoading, setIgLoading] = useState(true);
  const [activeAccount, setActiveAccount] = useState(IG_ACCOUNTS[0]);

  const [linkedinPosts, setLinkedinPosts] = useState<LinkedInPost[]>([]);
  const [linkedinLoading, setLinkedinLoading] = useState(true);

  useEffect(() => {
    async function fetchTweets() {
      setTweetsLoading(true);
      try {
        const res = await fetch(`/api/apify-twitter-search?query=${encodeURIComponent(activeKeyword)}`);
        const data = await res.json();
        setTweets(data.tweets || []);
      } catch (error) {
        console.error("Failed to fetch tweets:", error);
      } finally {
        setTweetsLoading(false);
      }
    }
    fetchTweets();
  }, [activeKeyword]);

  useEffect(() => {
    async function fetchIgPosts() {
      setIgLoading(true);
      try {
        const res = await fetch(`/api/apify-instagram-scrape?username=${encodeURIComponent(activeAccount)}`);
        const data = await res.json();
        setIgPosts(data.posts || []);
      } catch (error) {
        console.error("Failed to fetch IG posts:", error);
      } finally {
        setIgLoading(false);
      }
    }
    fetchIgPosts();
  }, [activeAccount]);

  useEffect(() => {
    async function fetchLinkedinPosts() {
      setLinkedinLoading(true);
      try {
        const res = await fetch("/api/linkedin-posts");
        const data = await res.json();
        setLinkedinPosts(data.posts || []);
      } catch (error) {
        console.error("Failed to fetch LinkedIn posts:", error);
      } finally {
        setLinkedinLoading(false);
      }
    }
    fetchLinkedinPosts();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 bg-white min-h-screen" dir="auto">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-semibold text-black">مصادر إلهام</h1>
          <p className="text-sm text-gray-500 mt-1">Viral tweets & Instagram content for new ideas</p>
        </div>
      </div>

      {/* Content Type Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setContentType("tweets")}
          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
            contentType === "tweets"
              ? "bg-black text-white"
              : "bg-gray-100 text-black hover:bg-gray-200"
          }`}
        >
          Viral Tweets
        </button>
        <button
          onClick={() => setContentType("instagram")}
          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
            contentType === "instagram"
              ? "bg-black text-white"
              : "bg-gray-100 text-black hover:bg-gray-200"
          }`}
        >
          Instagram Videos
        </button>
        <button
          onClick={() => setContentType("linkedin")}
          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
            contentType === "linkedin"
              ? "bg-black text-white"
              : "bg-gray-100 text-black hover:bg-gray-200"
          }`}
        >
          LinkedIn Posts
        </button>
      </div>

      {/* Viral Tweets Section */}
      {contentType === "tweets" && (
      <div>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {KEYWORDS.map((keyword) => (
            <button
              key={keyword}
              onClick={() => setActiveKeyword(keyword)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeKeyword === keyword
                  ? "bg-black text-white"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              {keyword}
            </button>
          ))}
        </div>

        {tweetsLoading ? (
          <div className="text-center text-gray-500 py-8">Loading tweets...</div>
        ) : tweets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {tweets.map((tweet) => (
              <Card
                key={tweet.id}
                className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.open(tweet.url, "_blank")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {tweet.authorAvatar && (
                      <img
                        src={proxied(tweet.authorAvatar)}
                        alt={tweet.author}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-sm text-black">{tweet.author}</p>
                      <p className="text-xs text-gray-500">@{tweet.authorHandle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">{tweet.text}</p>
                  {tweet.image && (
                    <img
                      src={proxied(tweet.image)}
                      alt="Tweet media"
                      className="w-full rounded-md mb-3 object-cover max-h-64"
                    />
                  )}
                  <div className="flex justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{tweet.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      <span>{tweet.retweets}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{tweet.replies}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-4">No viral tweets found for this keyword.</p>
        )}
      </div>
      )}

      {/* Viral Instagram Section */}
      {contentType === "instagram" && (
      <div>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {IG_ACCOUNTS.map((acct) => (
            <button
              key={acct}
              onClick={() => setActiveAccount(acct)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeAccount === acct
                  ? "bg-black text-white"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              @{acct}
            </button>
          ))}
        </div>

        {igLoading ? (
          <div className="text-center text-gray-500 py-8">Scraping @{activeAccount}...</div>
        ) : igPosts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {igPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.open(post.url, "_blank")}
              >
                <div className="relative w-full aspect-square bg-gray-200 overflow-hidden">
                  {post.thumbnail ? (
                    <img
                      src={proxied(post.thumbnail)}
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
                      title="Views vs. this account's median post"
                    >
                      {post.multiple}x
                    </span>
                  )}
                </div>

                <div className="px-3 pt-3">
                  {post.caption && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{post.caption}</p>
                  )}
                </div>

                <div className="flex justify-center gap-4 px-3 py-3 border-t border-gray-100">
                  <div className="flex flex-col items-center gap-1">
                    <Heart className="w-3 h-3 text-gray-700" />
                    <span className="text-xs font-semibold text-black">{post.likes}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-gray-700" />
                    <span className="text-xs font-semibold text-black">{post.comments}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Eye className="w-3 h-3 text-gray-700" />
                    <span className="text-xs font-semibold text-black">{post.views}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No posts found for this account.</p>
        )}
      </div>
      )}

      {/* LinkedIn Posts Section — reused from content-os's content_posts table */}
      {contentType === "linkedin" && (
      <div>
        {linkedinLoading ? (
          <div className="text-center text-gray-500 py-8">Loading LinkedIn posts...</div>
        ) : linkedinPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {linkedinPosts.map((post) => (
              <Card
                key={post.id}
                className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => post.link && window.open(post.link, "_blank")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {post.authorImageUrl && (
                      <img
                        src={proxied(post.authorImageUrl)}
                        alt={post.creator}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-sm text-black">{post.creator}</p>
                      {post.topic && <p className="text-xs text-gray-500">{post.topic}</p>}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-4 whitespace-pre-line">{post.content}</p>
                  {post.imageUrl && (
                    <img
                      src={proxied(post.imageUrl)}
                      alt="Post media"
                      className="w-full rounded-md mb-3 object-cover max-h-64"
                    />
                  )}
                  <div className="flex justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      <span>{post.reposts}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No LinkedIn posts found.</p>
        )}
      </div>
      )}
    </div>
  );
}
