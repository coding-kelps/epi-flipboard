"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Article } from "@/lib/articles";
import { cn } from "@/lib/utils";
import { X, ExternalLink, Calendar, User, Tag, MessageSquare, Bookmark, BookmarkCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

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
  const [isOpen, setIsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState<number>(0);

  useEffect(() => {
    // Fetch comment count
    fetch(`/api/comments?articleId=${article.article_id}&count=true`)
      .then(res => res.json())
      .then(data => {
        if (data.count !== undefined) {
          setCommentCount(data.count);
        }
      })
      .catch(err => console.error("Failed to fetch comment count", err));
  }, [article.article_id]);

  const hasImage = !!article.image_url;
  // Publisher name
  const publisherName = article.publishers?.display_name || article.publishers?.name;
  const publisherText = publisherName ? `By ${publisherName}` : null;

  const handleCardClick = () => {
    // Allow default behavior for elements that should act natively (like buttons if we added any)
    // But for now, we want the card to open sidebar.
    setIsOpen(true);
  };

  return (
    <>
      {variant === "lead" && (
        <article
          onClick={handleCardClick}
          className={cn("flex flex-col gap-3 group cursor-pointer relative overflow-hidden", className)}
        >
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
              {article.title}
            </h2>
            {article.description && (
              <p className="text-gray-600 font-serif leading-relaxed text-base md:text-lg">
                {article.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">
              {publisherText && <span>{publisherText}</span>}
            </div>
          </div>
          {/* Sliding Footer */}
          <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-100 py-3 px-4 transform translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 flex items-center justify-between gap-2 z-10 transition-delay-0 group-hover:transition-delay-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-bold text-gray-700">
                {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
              </span>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <MarkAsReadLaterButton articleId={article.article_id} />
            </div>
          </div>
        </article>
      )}

      {variant === "compact" && (
        <article
          onClick={handleCardClick}
          className={cn(
            "py-3 border-b border-gray-200 last:border-0 last:pb-0 group cursor-pointer relative overflow-hidden",
            className
          )}
        >
          <div className="flex flex-col gap-1">
            <h3 className="text-sm md:text-md font-bold font-serif text-gray-900 leading-snug group-hover:text-gray-700">
              {article.title}
            </h3>
            {publisherText && (
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                {publisherText}
              </span>
            )}
          </div>
          {/* Sliding Footer */}
          <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-100 py-2 px-3 transform translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 flex items-center justify-between gap-2 z-10 transition-delay-0 group-hover:transition-delay-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3 h-3 text-gray-500" />
              <span className="text-[10px] font-bold text-gray-700">
                {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
              </span>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <MarkAsReadLaterButton articleId={article.article_id} size="sm" />
            </div>
          </div>
        </article>
      )}

      {variant === "standard" && (
        <article
          onClick={handleCardClick}
          className={cn(
            "flex flex-col gap-2 py-4 border-b border-gray-200 last:border-0 group cursor-pointer relative overflow-hidden",
            className
          )}
        >
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
            {article.title}
          </h3>
          {article.description && (
            <p className="text-sm text-gray-600 leading-relaxed font-serif">
              {article.description}
            </p>
          )}
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
            {publisherText && (
              <span className="uppercase tracking-wider font-medium text-gray-500">
                {publisherText}
              </span>
            )}
          </div>
          {/* Sliding Footer */}
          <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-100 py-3 px-4 transform translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 flex items-center justify-between gap-2 z-10 transition-delay-0 group-hover:transition-delay-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-bold text-gray-700">
                {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
              </span>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <MarkAsReadLaterButton articleId={article.article_id} />
            </div>
          </div>
        </article>
      )}

      <ArticleSidebar
        article={article}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

function MarkAsReadLaterButton({ articleId, size = "md" }: { articleId: bigint; size?: "sm" | "md" }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [isMarked, setIsMarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/articles/marked?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          const markedIds = data.markedArticles.map((m: any) => m.article_id);
          setIsMarked(markedIds.includes(articleId.toString()));
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkStatus();

  }, [articleId, user, isAuthenticated]);

  const toggleMark = async () => {
    if (!isAuthenticated || !user) {
      openAuthModal();
      return;
    }

    setIsLoading(true);
    const action = isMarked ? 'unmark' : 'mark';

    try {
      const res = await fetch('/api/articles/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, articleId: articleId.toString(), action }),
      });

      if (res.ok) {
        setIsMarked(!isMarked);
      } else {
        console.error("Failed to update mark status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <button
      onClick={toggleMark}
      disabled={isLoading}
      className="flex items-center gap-1 text-gray-500 hover:text-black transition-colors"
      title={isMarked ? "Remove from Read Later" : "Save for Read Later"}
    >
      {isMarked ? (
        <>
          <BookmarkCheck className={`${iconSize} fill-current text-black`} />
          <span className={`font-bold ${size === "sm" ? "text-[10px]" : "text-xs"} text-black`}>Saved</span>
        </>
      ) : (
        <>
          <Bookmark className={iconSize} />
          <span className={`font-bold ${size === "sm" ? "text-[10px]" : "text-xs"}`}>Save</span>
        </>
      )}
    </button>
  );
}

function ArticleSidebar({
  article,
  isOpen,
  onClose,
}: {
  article: Article;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  // If opening, mount immediately during render to ensure animation plays
  if (isOpen && !isMounted) {
    setIsMounted(true);
  }

  useEffect(() => {
    if (isOpen) {
      // Small delay to allow DOM paint before transitioning opacity/transform
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
      document.body.style.overflow = "hidden";
    } else {
      setTimeout(() => setIsVisible(false), 0);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const handleTransitionEnd = () => {
    if (!isOpen) {
      setIsMounted(false);
    }
  };

  const publisherName = article.publishers?.display_name || article.publishers?.name;
  const authorNames = article.authors && article.authors.length > 0 ? article.authors.join(", ") : null;
  const tags = article.article_tag.map(at => at.tags.name);

  return (
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-300 pointer-events-auto",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Sidebar Panel - Sliding from LEFT as requested */}
      <div
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget) {
            handleTransitionEnd();
          }
        }}
        className={cn(
          "absolute top-0 bottom-0 left-0 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out pointer-events-auto overflow-y-auto",
          isVisible ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-6 md:p-8 flex flex-col gap-6">
          {/* Header Image (Optional) */}
          {article.image_url && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shrink-0">
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Article Info */}
          <div className="flex flex-col gap-4">
            {/* Publisher & Date */}
            <div className="flex items-center gap-3 text-xs font-bold tracking-wider uppercase text-gray-500">
              {publisherName && (
                <span className="text-black">{publisherName}</span>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(article.published_at).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-serif font-bold text-gray-900 leading-tight">
              {article.title}
            </h2>

            {/* Author */}
            {authorNames && (
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                <User className="w-4 h-4" />
                <span>{authorNames}</span>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Tags (Moved up) */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full uppercase tracking-wide">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Content (Description as content) */}
          {article.description && (
            <div className="prose prose-lg font-serif text-gray-700 leading-relaxed">
              {article.description}
            </div>
          )}

          {/* Read Full Article Button */}
          {article.original_url && (
            <a
              href={article.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors mt-4"
            >
              <span>Read Full Article</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <hr className="border-gray-100 mt-6" />

          <CommentsSection articleId={article.article_id} />

        </div>
      </div>
    </div>
  );
}

// Define Comment Interface
interface ArticleComment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    email?: string;
  };
}

function CommentsSection({ articleId }: { articleId: bigint }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments?articleId=${articleId.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (error) {
        console.error("Failed to fetch comments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: articleId.toString(), content: newComment })
      });

      if (res.ok) {
        const savedComment = await res.json();
        setComments([savedComment, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      <h3 className="text-xl font-serif font-bold text-gray-900">Comments</h3>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a thought..."
            className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black min-h-[80px] text-sm resize-none"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="self-end px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <div className="p-4 bg-gray-50 rounded-md text-center text-sm text-gray-600">
          <button onClick={openAuthModal} className="font-bold text-black hover:underline">
            Sign in
          </button>{" "}
          to leave a comment.
        </div>
      )}

      <div className="flex flex-col gap-4 mt-2">
        {loading ? (
          <div className="text-sm text-gray-400">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-sm text-gray-400 italic">No comments yet. Be the first to share your thoughts!</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">{comment.user?.name || "Anonymous"}</span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-snug">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
