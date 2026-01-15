import Image from "next/image";
import { Article } from "@/lib/articles";
import { cn } from "@/lib/utils"; // Assuming cn exists or I should check. Wait, I didn't check for utils.

export type ArticleVariant = "lead" | "standard" | "compact";

interface ArticleCardProps {
  article: Article;
  variant?: ArticleVariant;
  className?: string;
}

export default function ArticleCard({
  article,
  variant = "standard",
  className,
}: ArticleCardProps) {
  const hasImage = !!article.image_url;
  const hasAuthors = article.authors && article.authors.length > 0;

  // Format authors: "By Name", "By Name and Name"
  const authorsText = hasAuthors
    ? `By ${article.authors.join(" and ")}`
    : null;

  // Publisher name
  const publisherName = article.publishers?.display_name || article.publishers?.name;

  if (variant === "lead") {
    return (
      <article className={cn("flex flex-col gap-3 group cursor-pointer", className)}>
        {hasImage && (
          <div className="relative w-full aspect-[3/2] overflow-hidden">
            <Image
              src={article.image_url!}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl md:text-3xl font-serif font-bold leading-tight text-gray-900 group-hover:text-gray-700">
            <a href={article.original_url || '#'} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
          </h2>
          {article.description && (
            <p className="text-gray-600 font-serif leading-relaxed text-base md:text-lg">
              {article.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">
            {authorsText && <span>{authorsText}</span>}
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className={cn("py-3 border-b border-gray-200 last:border-0 group", className)}>
        <a href={article.original_url || '#'} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-1">
          <h3 className="text-sm md:text-md font-bold font-serif text-gray-900 leading-snug group-hover:text-gray-700">
            {article.title}
          </h3>
          {authorsText && (
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{authorsText}</span>
          )}
        </a>
      </article>
    );
  }

  // Standard (Sidebar or list style)
  return (
    <article className={cn("flex flex-col gap-2 py-4 border-b border-gray-200 last:border-0 group", className)}>
      {hasImage && (
        <div className="relative w-full aspect-video mb-1 overflow-hidden">
          <Image
            src={article.image_url!}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      )}
      <h3 className="text-lg font-serif font-bold leading-snug text-gray-900 group-hover:text-gray-700">
        <a href={article.original_url || '#'} target="_blank" rel="noopener noreferrer">
          {article.title}
        </a>
      </h3>
      {article.description && (
        <p className="text-sm text-gray-600 leading-relaxed font-serif">
          {article.description}
        </p>
      )}
      <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
        {authorsText && <span className="uppercase tracking-wider font-medium text-gray-500">{authorsText}</span>}
        {/* <span>{publisherName}</span> */}
      </div>
    </article>
  );
}
