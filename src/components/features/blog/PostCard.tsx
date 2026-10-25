import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { uploadUrl } from "@/lib/utils/urls";
import type { BlogPost } from "@/types";
import pellets from "@/assets/wood-pellets.jpg";

export function PostCard({ post }: { post: Omit<BlogPost, "body"> }) {
  return (
    <article className="post-card">
      <Link to="/blog/$slug" params={{ slug: post.slug }} tabIndex={-1} aria-hidden="true">
        <img
          src={uploadUrl("blog", post.cover_path) || pellets}
          alt=""
          loading="lazy"
          width={1024}
          height={768}
        />
      </Link>
      <div>
        <time dateTime={post.published_at ?? ""}>{formatDate(post.published_at)}</time>
        <h2>
          <Link to="/blog/$slug" params={{ slug: post.slug }}>
            {post.title}
          </Link>
        </h2>
        <p>{post.excerpt}</p>
        <Link to="/blog/$slug" params={{ slug: post.slug }} className="choice-cta">
          Tovább olvasom <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
