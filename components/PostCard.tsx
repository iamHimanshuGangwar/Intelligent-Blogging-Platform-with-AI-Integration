"use client";
import Image from "next/image";

interface PostCardProps {
  title: string;
  excerpt: string;
  category: string;
  categoryColor: "primary" | "secondary" | "tertiary";
  author: string;
  authorRole: string;
  image: string;
  views: number;
  likes: number;
  comments: number;
  readTime: string;
}

export default function PostCard({
  title,
  excerpt,
  category,
  categoryColor,
  author,
  authorRole,
  image,
  views: _views,
  likes,
  comments,
  readTime: _readTime,
}: PostCardProps) {
  const categoryColorMap = {
    primary: "bg-primary/20 text-primary",
    secondary: "bg-secondary/20 text-secondary",
    tertiary: "bg-tertiary/20 text-tertiary",
  };

  return (
    <article className="group glass-card rounded-3xl overflow-hidden hover:scale-[1.01] transition-all duration-500">
      {/* Image Container */}
      <div className="aspect-21/9 w-full relative overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-linear-to-t from-surface-container-low via-transparent to-transparent"></div>
        <div className="absolute top-6 left-6 flex gap-2">
          <span className={`${categoryColorMap[categoryColor]} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest`}>
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 -mt-12 relative z-10">
        {/* Author */}
        <div className="flex items-center gap-4 mb-4">
          <Image
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`}
            alt={author}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full border-2 border-primary-container"
          />
          <div>
            <h4 className="text-sm font-bold text-white">{author}</h4>
            <p className="text-[10px] text-on-surface-variant font-label uppercase">
              {authorRole}
            </p>
          </div>
        </div>

        {/* Title & Description */}
        <h2 className="font-headline text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
          {title}
        </h2>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-8 line-clamp-2">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg">favorite</span>
              <span className="text-xs font-medium">{likes}</span>
            </button>
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors">
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
              <span className="text-xs font-medium">{comments}</span>
            </button>
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">share</span>
              <span className="text-xs font-medium">Share</span>
            </button>
          </div>
          <button
            className="material-symbols-outlined text-on-surface-variant hover:text-white"
            aria-label="Bookmark"
          >
            bookmark
          </button>
        </div>
      </div>
    </article>
  );
}
