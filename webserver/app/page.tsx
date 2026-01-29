
import { getArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import HomepageNav from "@/components/HomepageNav";
import { checkImageResolution } from "@/lib/image-utils";
import { Article } from "@/lib/articles";
import { getSession } from "@/lib/auth";
import { getFollowedFeedsWithMetadata, FollowedFeedWithMetadata } from "@/lib/feed-activity";
import FeedUpdateItem from "@/components/FeedUpdateItem";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();
  const articles = await getArticles();

  let followedFeeds: FollowedFeedWithMetadata[] = [];
  if (session && session.user) {
    followedFeeds = await getFollowedFeedsWithMetadata(Number(session.user.id));
    followedFeeds.sort((a, b) => b.newArticlesCount - a.newArticlesCount);
    followedFeeds = followedFeeds.slice(0, 5);
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-serif">No articles found.</h1>
        <p className="text-gray-500 mt-2">Please populate the database.</p>
      </div>
    );
  }

  // Logic: Find the first article with minimal resolution for Lead Story
  let leadStory: Article | undefined;
  let leadStoryIndex = -1;

  // Check top 10 articles for a high-res image
  for (let i = 0; i < Math.min(articles.length, 10); i++) {
    const article = articles[i];
    if (article.image_url) {
      const isHighRes = await checkImageResolution(article.image_url, 800);
      if (isHighRes) {
        leadStory = article;
        leadStoryIndex = i;
        break;
      }
    }
  }

  // Fallback if no high-res image found: just take the first one (or first with ANY image)
  if (!leadStory) {
    leadStoryIndex = articles.findIndex(a => a.image_url);
    if (leadStoryIndex === -1) leadStoryIndex = 0; // Absolute fallback
    leadStory = articles[leadStoryIndex];
  }

  // Filter out the lead story from the rest of the list
  const otherArticles = articles.filter((a) => a.article_id !== leadStory!.article_id);

  // Separate articles with and without images
  const articlesWithImages = otherArticles.filter((a) => a.image_url);

  // topStories: Get 4 articles with images (after secondary lead)
  const topStories = articlesWithImages.slice(0, 2);

  // "The Latest" section: Dynamic count to fill space based on followed feeds
  // Aim for a consistent total number of items in the sidebar (feeds + articles)
  // Base count of 12 items total seems to balance the center column well.
  const sidebarCount = 12 - followedFeeds.length;
  const sidebarStories = otherArticles.slice(4, 4 + sidebarCount);


  // "More News" section: min/max 4 articles with images (from remaining articles)
  const usedIds = new Set([
    leadStory!.article_id,
    ...topStories.map(a => a.article_id),
    ...sidebarStories.map(a => a.article_id),

  ].filter(Boolean));

  const moreNews = articlesWithImages
    .filter(a => !usedIds.has(a.article_id))
    .slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">

        {/* Left Column: Quick News / Sidebar (Span 3) */}
        <section className="lg:col-span-3 lg:pr-6 order-2 lg:order-1 flex flex-col gap-8">

          {/* Feed Updates Section */}
          {followedFeeds.length > 0 && (
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-2 border-t border-black pt-1">
                Updates for You
              </h4>
              <div className="flex flex-col gap-4">
                {followedFeeds.map((feed) => (
                  <FeedUpdateItem key={feed.id} feed={feed} />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-2 border-t border-black pt-1">
              The Latest
            </h4>
            <div className="flex flex-col gap-4">
              {sidebarStories.map((article) => (
                <ArticleCard key={String(article.article_id)} article={article} variant="compact" />
              ))}
            </div>
          </div>
        </section>

        {/* Center Column: Lead Stories (Span 6) */}
        <section className="lg:col-span-6 lg:px-6 order-1 lg:order-2 flex flex-col gap-8">

          {/* Main Lead */}
          <ArticleCard
            article={leadStory!}
            variant="lead"
            className="border-b border-gray-200 pb-6"
          />

          {/* Secondary Lead & Top Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topStories.map((article) => (
              <ArticleCard key={String(article.article_id)} article={article} variant="standard" />
            ))}
          </div>

        </section>


        {/* Right Column: Discover / Navigation (Span 3) */}
        <section className="lg:col-span-3 lg:pl-6 order-3 flex flex-col gap-6">
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-2 border-t border-black pt-1">
            Discover
          </h4>
          <HomepageNav />
        </section>

      </div>

      {/* Bottom Section: More News (Full Width) */}
      {moreNews.length > 0 && (
        <section className="mt-12 pt-8 border-t border-black">
          <h5 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-6">More News</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {moreNews.map((article) => (
              <ArticleCard key={String(article.article_id)} article={article} variant="standard" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
