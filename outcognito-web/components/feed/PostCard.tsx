import Link from "next/link";

import CommentThread from "@/components/feed/CommentThread";

import type {
  FeedPost,
} from "@/types/feed";

function getRelativeTime(
  dateString:
    string
) {
  const timestamp =
    new Date(
      dateString
    ).getTime();

  if (
    Number.isNaN(
      timestamp
    )
  ) {
    return "";
  }

  const seconds =
    Math.max(
      0,
      Math.floor(
        (
          Date.now() -
          timestamp
        ) /
          1000
      )
    );

  if (
    seconds <
    10
  ) {
    return "now";
  }

  if (
    seconds <
    60
  ) {
    return `${seconds}s`;
  }

  const minutes =
    Math.floor(
      seconds /
        60
    );

  if (
    minutes <
    60
  ) {
    return `${minutes}m`;
  }

  const hours =
    Math.floor(
      minutes /
        60
    );

  if (
    hours <
    24
  ) {
    return `${hours}h`;
  }

  const days =
    Math.floor(
      hours /
        24
    );

  if (
    days <
    7
  ) {
    return `${days}d`;
  }

  return new Date(
    dateString
  ).toLocaleDateString(
    undefined,
    {
      month:
        "short",

      day:
        "numeric",
    }
  );
}

function formatCategory(
  category:
    string
) {
  return (
    category ||
    "general"
  )
    .replaceAll(
      "_",
      " "
    )
    .toUpperCase();
}

export default function PostCard({
  post,
}: {
  post:
    FeedPost;
}) {
  return (
    <article className="border-b border-white/[0.065] px-5 py-8 sm:px-7">
      <div className="flex gap-3">
        <Link
          href={`/${post.username}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] font-mono text-[10px] uppercase text-white/55 transition hover:border-white/20"
        >
          {post.username
            ?.slice(
              0,
              2
            ) ||
            "OC"}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/${post.username}`}
              className="truncate text-[13px] font-medium text-white/90 transition hover:text-white"
            >
              @{post.username}
            </Link>

            <span className="text-white/15">
              ·
            </span>

            <span className="font-mono text-[9px] text-white/25">
              {getRelativeTime(
                post.createdAt
              )}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/25">
              {formatCategory(
                post.category
              )}
            </span>

            <span className="h-[2px] w-[2px] rounded-full bg-white/15" />

            <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/18">
              auto-posted
            </span>
          </div>

          <p className="mt-5 max-w-[690px] text-[16px] leading-[1.65] tracking-[-0.015em] text-white/90 sm:text-[17px]">
            {
              post.postText
            }
          </p>

          {post.comments
            .length >
            0 && (
            <div className="mt-7">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/25" />

                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/25">
                  society responded
                </span>
              </div>

              <CommentThread
                comments={
                  post.comments
                }
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}