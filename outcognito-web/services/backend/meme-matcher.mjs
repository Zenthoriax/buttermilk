// ============================================================
// OUTCOGNITO WEIGHTED MEME MATCHER
// services/backend/meme-matcher.mjs
// ============================================================

import fs from "node:fs";
import {
  fileURLToPath
} from "node:url";


// ============================================================
// LOAD MEME METADATA
// ============================================================

const memesUrl =
  new URL(
    "./data/memes.json",
    import.meta.url
  );


const memes =
  JSON.parse(
    fs.readFileSync(
      fileURLToPath(memesUrl),
      "utf8"
    )
  );


// ============================================================
// CONFIG
// ============================================================

const MAX_MEMES_PER_THREAD = 2;

const MINIMUM_MATCH_SCORE = 5;


// Words that are too common to help retrieval.

const STOP_WORDS =
  new Set([
    "a",
    "an",
    "the",
    "to",
    "of",
    "for",
    "in",
    "on",
    "at",
    "with",
    "from",
    "and",
    "or",
    "is",
    "are",
    "was",
    "were",
    "be",
    "being",
    "someone",
    "somebody",
    "person",
    "reaction",
    "meme",
    "image",
    "when",
    "after",
    "before",
    "this",
    "that",
    "their",
    "they",
  ]);


// ============================================================
// TEXT NORMALIZATION
// ============================================================

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function tokenize(text) {
  return normalizeText(text)
    .split(" ")
    .filter(
      word =>
        word.length >= 2 &&
        !STOP_WORDS.has(word)
    );
}


// ============================================================
// BASIC WORD OVERLAP
// ============================================================

function countTokenMatches(
  queryTokens,
  targetText
) {
  const targetTokens =
    new Set(
      tokenize(targetText)
    );


  let matches = 0;


  for (
    const token
    of queryTokens
  ) {
    if (
      targetTokens.has(token)
    ) {
      matches += 1;
    }
  }


  return matches;
}


// ============================================================
// PHRASE MATCHING
//
// Gives extra credit when the actual metadata phrase
// appears in the query.
//
// Example:
//
// query:
// "facepalm reaction after repeating same mistake"
//
// metadata:
// "same mistake"
// ============================================================

function phraseMatchScore(
  query,
  phrases,
  weight
) {
  const normalizedQuery =
    normalizeText(query);

  let score = 0;


  for (
    const phrase
    of phrases || []
  ) {
    const normalizedPhrase =
      normalizeText(phrase);


    if (
      normalizedPhrase.length >= 3 &&
      normalizedQuery.includes(
        normalizedPhrase
      )
    ) {
      score += weight;
    }
  }


  return score;
}


// ============================================================
// INTENSITY SIMILARITY
//
// Meme intensity should roughly match event roastability.
//
// roastability 0.95 + meme intensity 0.90 = strong match
//
// roastability 0.60 + meme intensity 1.00 = weaker match
// ============================================================

function intensityScore(
  roastability,
  memeIntensity
) {
  const eventIntensity =
    Number(roastability ?? 0.5);

  const memeValue =
    Number(memeIntensity ?? 0.5);


  const difference =
    Math.abs(
      eventIntensity -
      memeValue
    );


  // 0 difference -> +2
  // 1 difference -> 0

  return Math.max(
    0,
    2 - difference * 2
  );
}


// ============================================================
// CHARACTER AFFINITY
// ============================================================

function characterScore(
  meme,
  character
) {
  const affinity =
    Number(
      meme.characters?.[
        character
      ] ?? 0
    );


  // Maximum +4

  return affinity * 4;
}


// ============================================================
// NEGATIVE TAG PENALTY
// ============================================================

function negativePenalty(
  query,
  negativeTags
) {
  const queryTokens =
    tokenize(query);


  let penalty = 0;


  for (
    const negativeTag
    of negativeTags || []
  ) {
    const normalizedTag =
      normalizeText(
        negativeTag
      );


    // Exact/phrase negative match

    if (
      normalizeText(query)
        .includes(
          normalizedTag
        )
    ) {
      penalty += 5;

      continue;
    }


    // Token overlap negative match

    const matches =
      countTokenMatches(
        queryTokens,
        negativeTag
      );


    penalty +=
      matches * 2;
  }


  return penalty;
}


// ============================================================
// SCORE ONE MEME
// ============================================================

export function scoreMeme({
  meme,
  memeQuery,
  character,
  roastability,
}) {

  const queryTokens =
    tokenize(
      memeQuery
    );


  let score = 0;


  // ----------------------------------------------------------
  // 1. TAG MATCH
  // strongest general semantic signal
  // ----------------------------------------------------------

  const tagMatches =
    countTokenMatches(
      queryTokens,
      (meme.tags || [])
        .join(" ")
    );


  score +=
    tagMatches * 3;


  // Extra phrase bonus

  score +=
    phraseMatchScore(
      memeQuery,
      meme.tags,
      3
    );


  // ----------------------------------------------------------
  // 2. SITUATION MATCH
  // ----------------------------------------------------------

  const situationMatches =
    countTokenMatches(
      queryTokens,
      (meme.situations || [])
        .join(" ")
    );


  score +=
    situationMatches * 3;


  score +=
    phraseMatchScore(
      memeQuery,
      meme.situations,
      3
    );


  // ----------------------------------------------------------
  // 3. EMOTION MATCH
  // ----------------------------------------------------------

  const emotionMatches =
    countTokenMatches(
      queryTokens,
      (meme.emotions || [])
        .join(" ")
    );


  score +=
    emotionMatches * 2;


  score +=
    phraseMatchScore(
      memeQuery,
      meme.emotions,
      2
    );


  // ----------------------------------------------------------
  // 4. REACTION TYPE
  // ----------------------------------------------------------

  if (
    meme.reactionType
  ) {
    const reactionMatches =
      countTokenMatches(
        queryTokens,
        meme.reactionType
      );


    score +=
      reactionMatches * 4;


    if (
      normalizeText(
        memeQuery
      ).includes(
        normalizeText(
          meme.reactionType
        )
      )
    ) {
      score += 4;
    }
  }


  // ----------------------------------------------------------
  // 5. DESCRIPTION
  //
  // Lower weight because descriptions can be broad.
  // ----------------------------------------------------------

  const descriptionMatches =
    countTokenMatches(
      queryTokens,
      meme.description
    );


  score +=
    descriptionMatches * 1.5;


  // ----------------------------------------------------------
  // 6. CHARACTER AFFINITY
  // ----------------------------------------------------------

  const affinityScore =
    characterScore(
      meme,
      character
    );


  score +=
    affinityScore;


  // ----------------------------------------------------------
  // 7. INTENSITY
  // ----------------------------------------------------------

  const memeIntensityScore =
    intensityScore(
      roastability,
      meme.intensity
    );


  score +=
    memeIntensityScore;


  // ----------------------------------------------------------
  // 8. VERSATILITY
  //
  // Small tiebreaker only.
  // ----------------------------------------------------------

  const versatilityScore =
    Number(
      meme.versatility ??
      0.5
    );


  score +=
    versatilityScore;


  // ----------------------------------------------------------
  // 9. NEGATIVE CONTEXT
  // ----------------------------------------------------------

  const penalty =
    negativePenalty(
      memeQuery,
      meme.negativeTags
    );


  score -=
    penalty;


  return {
    score,

    breakdown: {
      tagMatches,
      situationMatches,
      emotionMatches,
      affinityScore,
      memeIntensityScore,
      versatilityScore,
      negativePenalty:
        penalty,
    },
  };
}


// ============================================================
// FIND BEST MEME
// ============================================================

export function findBestMeme({
  memeQuery,
  character,
  roastability = 0.5,
  excludedMemeIds = [],
}) {

  if (
    !memeQuery ||
    !String(
      memeQuery
    ).trim()
  ) {
    return null;
  }


  const excluded =
    new Set(
      excludedMemeIds
    );


  const ranked = [];


  for (
    const meme
    of memes
  ) {

    if (
      excluded.has(
        meme.id
      )
    ) {
      continue;
    }


    const result =
      scoreMeme({
        meme,
        memeQuery,
        character,
        roastability,
      });


    ranked.push({
      meme,
      ...result,
    });
  }


  ranked.sort(
    (a, b) =>
      b.score -
      a.score
  );


  const winner =
    ranked[0];


  if (
    !winner ||
    winner.score <
      MINIMUM_MATCH_SCORE
  ) {
    return null;
  }


  return {
    id:
      winner.meme.id,

    filename:
      winner.meme.filename,

    displayName:
      winner.meme.displayName,

    url:
      `/memes/${winner.meme.filename}`,

    score:
      Number(
        winner.score
          .toFixed(2)
      ),

    reactionType:
      winner.meme.reactionType,

    intensity:
      winner.meme.intensity,

    // useful while debugging;
    // can remove from API later

    breakdown:
      winner.breakdown,
  };
}


// ============================================================
// ENRICH AN ENTIRE AI THREAD
//
// Groq may request a meme on multiple comments.
//
// We rank those opportunities and attach at most 2 memes.
// ============================================================

export function resolveMemes(
  aiThread,
  roastability = 0.5
) {

  const comments =
    aiThread.comments ||
    [];


  const candidates = [];


  // ----------------------------------------------------------
  // Find best match for every comment that requested a meme
  // ----------------------------------------------------------

  for (
    let index = 0;
    index < comments.length;
    index++
  ) {

    const comment =
      comments[index];


    if (
      !comment.memeQuery
    ) {
      continue;
    }


    const meme =
      findBestMeme({
        memeQuery:
          comment.memeQuery,

        character:
          comment.character,

        roastability,
      });


    if (!meme) {
      continue;
    }


    candidates.push({
      commentIndex:
        index,

      meme,
    });
  }


  // ----------------------------------------------------------
  // Prefer the strongest matches
  // ----------------------------------------------------------

  candidates.sort(
    (a, b) =>
      b.meme.score -
      a.meme.score
  );


  // ----------------------------------------------------------
  // Limit memes per thread
  // ----------------------------------------------------------

  const selected =
    candidates.slice(
      0,
      MAX_MEMES_PER_THREAD
    );


  const selectedByComment =
    new Map();


  const usedMemeIds =
    new Set();


  for (
    const candidate
    of selected
  ) {

    // Avoid duplicate image appearing twice
    // in the same comment thread.

    if (
      usedMemeIds.has(
        candidate.meme.id
      )
    ) {
      continue;
    }


    usedMemeIds.add(
      candidate.meme.id
    );


    selectedByComment.set(
      candidate.commentIndex,
      candidate.meme
    );
  }


  // ----------------------------------------------------------
  // Enrich comments
  // ----------------------------------------------------------

  const enrichedComments =
    comments.map(
      (
        comment,
        index
      ) => {

        const meme =
          selectedByComment.get(
            index
          ) || null;


        return {
          ...comment,

          meme,
        };
      }
    );


  return {
    ...aiThread,

    comments:
      enrichedComments,
  };
}


// ============================================================
// DEBUG EXPORT
// ============================================================

export function getMemeLibrarySize() {
  return memes.length;
}