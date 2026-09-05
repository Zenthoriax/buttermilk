"use client";

import {
  useMemo,
} from "react";

import {
  CHARACTER_CONFIG,
} from "@/lib/characters";

import type {
  AIComment,
  CharacterId,
  Meme,
} from "@/types/feed";

function CharacterAvatar({
  character,
  small = false,
}: {
  character:
    CharacterId;

  small?:
    boolean;
}) {
  const config =
    CHARACTER_CONFIG[
      character
    ];

  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center rounded-full",
        "border border-white/[0.09] bg-white/[0.035]",
        "font-mono font-medium tracking-[-0.06em]",
        config.accent,
        small
          ? "h-7 w-7 text-[8px]"
          : "h-9 w-9 text-[9px]",
      ].join(" ")}
    >
      {config.symbol}
    </div>
  );
}

function MemeAttachment({
  meme,
}: {
  meme: Meme;
}) {
  return (
    <div className="mt-4 max-w-[440px] overflow-hidden rounded-xl border border-white/[0.075] bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={
          meme.url
        }
        alt={
          meme.displayName
        }
        loading="lazy"
        className="max-h-[440px] w-full object-contain"
      />

      <div className="flex items-center justify-between border-t border-white/[0.055] px-3 py-2">
        <span className="truncate font-mono text-[8px] uppercase tracking-[0.12em] text-white/25">
          {meme.displayName}
        </span>

        <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/15">
          reaction
        </span>
      </div>
    </div>
  );
}

function CommentBlock({
  comment,
  replies,
  depth = 0,
}: {
  comment:
    AIComment;

  replies:
    Map<
      string,
      AIComment[]
    >;

  depth?:
    number;
}) {
  const config =
    CHARACTER_CONFIG[
      comment.character
    ] ??
    CHARACTER_CONFIG
      .chronicallyonline;

  const children =
    replies.get(
      comment.id
    ) ?? [];

  return (
    <div
      className={
        depth > 0
          ? "relative ml-8 sm:ml-12"
          : "relative"
      }
    >
      {depth >
        0 && (
        <div className="absolute -left-4 top-0 h-6 w-3 rounded-bl-lg border-b border-l border-white/[0.07] sm:-left-6 sm:w-4" />
      )}

      <div className="flex gap-3 py-3">
        <CharacterAvatar
          character={
            comment.character
          }
          small={
            depth > 0
          }
        />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-baseline gap-2">
            <span
              className={[
                "truncate font-mono text-[10px] font-medium",
                config.accent,
              ].join(
                " "
              )}
            >
              @{config.name}
            </span>

            <span className="hidden truncate text-[9px] text-white/20 sm:inline">
              {config.label}
            </span>
          </div>

          <p className="mt-1 max-w-[680px] text-[13px] leading-[1.65] text-white/70 sm:text-[14px]">
            {
              comment.text
            }
          </p>

          {comment.meme && (
            <MemeAttachment
              meme={
                comment.meme
              }
            />
          )}
        </div>
      </div>

      {children.length >
        0 && (
        <div className="border-l border-white/[0.045]">
          {children.map(
            (
              child
            ) => (
              <CommentBlock
                key={
                  child.id
                }
                comment={
                  child
                }
                replies={
                  replies
                }
                depth={
                  Math.min(
                    depth +
                      1,
                    3
                  )
                }
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function CommentThread({
  comments,
}: {
  comments:
    AIComment[];
}) {
  const {
    roots,
    replies,
  } =
    useMemo(() => {
      const ids =
        new Set(
          comments.map(
            (
              comment
            ) =>
              comment.id
          )
        );

      const replyMap =
        new Map<
          string,
          AIComment[]
        >();

      const rootComments:
        AIComment[] =
        [];

      for (
        const comment
        of comments
      ) {
        if (
          comment.replyTo &&
          ids.has(
            comment.replyTo
          )
        ) {
          const existing =
            replyMap.get(
              comment.replyTo
            ) ??
            [];

          existing.push(
            comment
          );

          replyMap.set(
            comment.replyTo,
            existing
          );
        } else {
          rootComments.push(
            comment
          );
        }
      }

      return {
        roots:
          rootComments,

        replies:
          replyMap,
      };
    }, [
      comments,
    ]);

  return (
    <div className="mt-4 border-t border-white/[0.06] pt-2">
      {roots.map(
        (
          comment
        ) => (
          <CommentBlock
            key={
              comment.id
            }
            comment={
              comment
            }
            replies={
              replies
            }
          />
        )
      )}
    </div>
  );
}