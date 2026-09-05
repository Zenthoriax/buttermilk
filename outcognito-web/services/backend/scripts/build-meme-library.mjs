// ============================================================
// OUTCOGNITO MEME LIBRARY BUILDER
//
// Source:
// Hugging Face d-s-b/MemeDataset
//
// Flow:
//
// Hugging Face dataset
//      ↓
// Pick useful reaction memes
//      ↓
// Download actual images
//      ↓
// Groq enriches existing description/usecases
//      ↓
// public/memes/
// data/memes.json
// ============================================================

import fs from "node:fs/promises";
import path from "node:path";
import {
  fileURLToPath
} from "node:url";

import Groq from "groq-sdk";


// ============================================================
// PATH SETUP
// ============================================================

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);


// script lives in:
//
// services/backend/scripts/
//
// therefore backend is one level above
const BACKEND_DIR =
  path.resolve(
    __dirname,
    ".."
  );


// project root is:
//
// backend
//   ↓
// services
//   ↓
// project root

const PROJECT_ROOT =
  path.resolve(
    BACKEND_DIR,
    "..",
    ".."
  );


const DATA_DIR =
  path.join(
    PROJECT_ROOT,
    "data"
  );


const MEME_OUTPUT_DIR =
  path.join(
    PROJECT_ROOT,
    "public",
    "memes"
  );


const MEMES_JSON =
  path.join(
    DATA_DIR,
    "memes.json"
  );


const CHARACTERS_JSON =
  path.join(
    DATA_DIR,
    "characters.json"
  );


// ============================================================
// CONFIGURATION
// ============================================================

const DATASET =
  "d-s-b/MemeDataset";

const CONFIG =
  "default";

const SPLIT =
  "train";


// Default number of memes we want.
//
// You can override:
//
// PowerShell:
// $env:MEME_LIMIT="10"

const MEME_LIMIT =
  Number(
    process.env.MEME_LIMIT ||
    40
  );


const AI_MODEL =
  process.env.MEME_AI_MODEL ||
  "openai/gpt-oss-120b";


// Delay between Groq calls.
//
// Helps stay inside free-tier
// rate limits.

const AI_DELAY_MS =
  7000;


// ============================================================
// GROQ
// ============================================================

if (!process.env.GROQ_API_KEY) {
  console.error(
    "\nERROR: GROQ_API_KEY is missing."
  );

  console.error(
    'Run: $env:GROQ_API_KEY="gsk_..."'
  );

  process.exit(1);
}


const groq =
  new Groq({
    apiKey:
      process.env.GROQ_API_KEY,
  });


// ============================================================
// BASIC HELPERS
// ============================================================

function sleep(ms) {
  return new Promise(
    resolve =>
      setTimeout(resolve, ms)
  );
}


function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .slice(0, 80);
}


function normalizeText(value) {
  if (!value) {
    return "";
  }

  if (Array.isArray(value)) {
    return value
      .join(" ")
      .toLowerCase();
  }

  return String(value)
    .toLowerCase();
}


// ============================================================
// CONTENT FILTER
//
// We don't want every random/dated meme.
// We're prioritizing reaction memes suitable for Outcognito.
// ============================================================

const POSITIVE_KEYWORDS = [
  "reaction",
  "react",
  "confusion",
  "confused",
  "disbelief",
  "sarcasm",
  "sarcastic",
  "mock",
  "ridiculous",
  "awkward",
  "failure",
  "failed",
  "mistake",
  "frustration",
  "surprise",
  "shocked",
  "laugh",
  "laughing",
  "smug",
  "obvious",
  "internet",
  "productivity",
  "work",
  "focus",
  "obsession",
  "chaos",
  "disappointed",
  "judgment",
  "suspicious",
  "impressive",
  "success",
  "repeat",
  "again",
  "stupid",
  "dumb",
  "cringe",
  "weird",
  "panic",
  "confidence",
  "brag",
  "overreact"
];


// Exclude content that isn't a good fit for
// a general-purpose college hackathon social feed.

const EXCLUDED_KEYWORDS = [
  "predatory",
  "underage",
  "younger",
  "sexual",
  "porn",
  "suicide",
  "self harm",
  "racial slur",
  "racist",
  "nazi",
  "terrorist"
];


function scoreDatasetRow(row) {

  const text =
    normalizeText([
      row.name,
      row.description,
      ...(row.usecases || [])
    ]);


  for (
    const excluded
    of EXCLUDED_KEYWORDS
  ) {
    if (
      text.includes(excluded)
    ) {
      return -999;
    }
  }


  let score = 0;


  for (
    const keyword
    of POSITIVE_KEYWORDS
  ) {
    if (
      text.includes(keyword)
    ) {
      score += 1;
    }
  }


  // More useful source usecases
  // = generally better meme metadata.

  score +=
    Math.min(
      row.usecases?.length || 0,
      5
    ) * 0.4;


  return score;
}


// ============================================================
// HUGGING FACE DATASET API
// ============================================================

async function fetchDatasetBatch(
  offset,
  length = 100
) {

  const params =
    new URLSearchParams({
      dataset:
        DATASET,

      config:
        CONFIG,

      split:
        SPLIT,

      offset:
        String(offset),

      length:
        String(length),
    });


  const url =
    `https://datasets-server.huggingface.co/rows?${params}`;


  console.log(
    `Fetching dataset rows ${offset}-${offset + length - 1}...`
  );


  const response =
    await fetch(url);


  if (!response.ok) {
    throw new Error(
      `Hugging Face error ${response.status}: ${await response.text()}`
    );
  }


  return response.json();
}


async function fetchEntireDataset() {

  const allRows = [];


  // Dataset currently contains 300 rows.
  //
  // Dataset viewer allows at most
  // 100 rows per request.

  for (
    let offset = 0;
    offset < 300;
    offset += 100
  ) {

    const data =
      await fetchDatasetBatch(
        offset,
        100
      );


    for (
      const entry
      of data.rows || []
    ) {

      const row =
        entry.row;


      allRows.push({
        rowIndex:
          entry.row_idx,

        image:
          row.image,

        name:
          row.name,

        description:
          row.description,

        usecases:
          row.usecases || [],
      });
    }
  }


  return allRows;
}


// ============================================================
// CHARACTER CONTEXT
// ============================================================

async function loadCharacterContext() {

  const raw =
    await fs.readFile(
      CHARACTERS_JSON,
      "utf8"
    );


  const characters =
    JSON.parse(raw);


  // We intentionally send a compact version
  // to Groq to save tokens.

  return characters
    .map(character => {

      const triggerText =
        Array.isArray(
          character.triggers
        )
          ? character.triggers
              .slice(0, 6)
              .join(", ")
          : "";


      return [
        `${character.id}:`,
        character.description ||
          character.archetype ||
          "",
        triggerText
          ? `Typical triggers: ${triggerText}`
          : ""
      ]
        .filter(Boolean)
        .join(" ");
    })
    .join("\n");
}


// ============================================================
// IMAGE DOWNLOAD
// ============================================================

function extensionFromContentType(
  contentType
) {

  const type =
    String(contentType)
      .toLowerCase();


  if (
    type.includes("png")
  ) {
    return "png";
  }


  if (
    type.includes("webp")
  ) {
    return "webp";
  }


  if (
    type.includes("gif")
  ) {
    return "gif";
  }


  // Most dataset images will
  // probably be JPEG.

  return "jpg";
}


async function downloadImage(
  imageUrl,
  slug
) {

  const response =
    await fetch(imageUrl);


  if (!response.ok) {
    throw new Error(
      `Image download failed: ${response.status}`
    );
  }


  const contentType =
    response.headers.get(
      "content-type"
    ) || "";


  const extension =
    extensionFromContentType(
      contentType
    );


  const filename =
    `${slug}.${extension}`;


  const outputPath =
    path.join(
      MEME_OUTPUT_DIR,
      filename
    );


  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    );


  await fs.writeFile(
    outputPath,
    buffer
  );


  return {
    filename,
    outputPath,
  };
}


// ============================================================
// OUTCOGNITO METADATA SCHEMA
// ============================================================

const CHARACTER_IDS = [
  "certified_hater",
  "glazer3000",
  "chronicallyonline",
  "society_aunty",
  "detective",
  "linkedin_sigma",
  "maincharacter",
];


// ============================================================
// GROQ METADATA ENRICHMENT
// ============================================================

async function enrichMemeMetadata({
  row,
  filename,
  characterContext,
}) {

  const prompt = `
You are building metadata for a reaction-meme retrieval system
called Outcognito.

Outcognito automatically creates social posts from privacy-safe
browser activity.

Seven AI personalities comment on those posts.

CHARACTERS:

${characterContext}


MEME SOURCE INFORMATION:

Original name:
${row.name}

Existing dataset description:
${row.description}

Existing use cases:
${JSON.stringify(
  row.usecases,
  null,
  2
)}


TASK:

Generate retrieval metadata for THIS SPECIFIC meme.

Use the supplied description and use cases as the source of truth.

The metadata will be used to match semantic queries such as:

"facepalm reaction after repeating the same mistake"

"shocked reaction to chaotic browsing"

"dramatic reaction to a tiny achievement"


RULES:

- tags should be useful search phrases.
- situations describe when this meme should be used.
- emotions describe the emotional reaction.
- reactionType should be a short normalized snake_case category.
- character scores range from 0.0 to 1.0.
- 1.0 means the meme strongly fits that character.
- 0.0 means the character would almost never use it.
- intensity is how strong/aggressive the reaction feels.
- versatility is how broadly reusable the meme is.
- negativeTags describe situations where this meme would be a bad match.
- Do not invent visual details beyond the supplied dataset information.
`;


  const completion =
    await groq.chat.completions.create({

      model:
        AI_MODEL,

      reasoning_effort:
        "low",

      max_completion_tokens:
        800,

      messages: [
        {
          role:
            "user",

          content:
            prompt,
        },
      ],


      response_format: {
        type:
          "json_schema",

        json_schema: {
          name:
            "outcognito_meme_metadata",

          strict:
            true,

          schema: {
            type:
              "object",

            additionalProperties:
              false,

            properties: {

              displayName: {
                type:
                  "string",
              },

              description: {
                type:
                  "string",
              },

              tags: {
                type:
                  "array",

                minItems:
                  5,

                maxItems:
                  12,

                items: {
                  type:
                    "string",
                },
              },

              situations: {
                type:
                  "array",

                minItems:
                  3,

                maxItems:
                  7,

                items: {
                  type:
                    "string",
                },
              },

              emotions: {
                type:
                  "array",

                minItems:
                  2,

                maxItems:
                  5,

                items: {
                  type:
                    "string",
                },
              },

              reactionType: {
                type:
                  "string",
              },

              characters: {
                type:
                  "object",

                additionalProperties:
                  false,

                properties: {
                  certified_hater: {
                    type:
                      "number",
                  },

                  glazer3000: {
                    type:
                      "number",
                  },

                  chronicallyonline: {
                    type:
                      "number",
                  },

                  society_aunty: {
                    type:
                      "number",
                  },

                  detective: {
                    type:
                      "number",
                  },

                  linkedin_sigma: {
                    type:
                      "number",
                  },

                  maincharacter: {
                    type:
                      "number",
                  },
                },

                required:
                  CHARACTER_IDS,
              },

              intensity: {
                type:
                  "number",
              },

              versatility: {
                type:
                  "number",
              },

              negativeTags: {
                type:
                  "array",

                minItems:
                  2,

                maxItems:
                  6,

                items: {
                  type:
                    "string",
                },
              },
            },

            required: [
              "displayName",
              "description",
              "tags",
              "situations",
              "emotions",
              "reactionType",
              "characters",
              "intensity",
              "versatility",
              "negativeTags",
            ],
          },
        },
      },
    });


  const output =
    completion
      .choices?.[0]
      ?.message
      ?.content;


  if (!output) {
    throw new Error(
      "Groq returned empty metadata."
    );
  }


  const metadata =
    JSON.parse(output);


  // Clamp numeric scores
  // because this is retrieval data.

  for (
    const characterId
    of CHARACTER_IDS
  ) {

    const value =
      Number(
        metadata.characters[
          characterId
        ]
      );


    metadata.characters[
      characterId
    ] =
      Math.max(
        0,
        Math.min(
          1,
          value
        )
      );
  }


  metadata.intensity =
    Math.max(
      0,
      Math.min(
        1,
        Number(
          metadata.intensity
        )
      )
    );


  metadata.versatility =
    Math.max(
      0,
      Math.min(
        1,
        Number(
          metadata.versatility
        )
      )
    );


  // Add deterministic fields ourselves.
  //
  // AI does NOT control filenames or IDs.

  return {

    id:
      slugify(
        row.name
      ),

    filename,

    displayName:
      metadata.displayName,

    description:
      metadata.description,

    tags:
      metadata.tags,

    situations:
      metadata.situations,

    emotions:
      metadata.emotions,

    reactionType:
      metadata.reactionType,

    characters:
      metadata.characters,

    intensity:
      metadata.intensity,

    versatility:
      metadata.versatility,

    negativeTags:
      metadata.negativeTags,


    // Keep original dataset metadata.
    //
    // Useful for debugging and provenance.

    source: {
      dataset:
        DATASET,

      rowIndex:
        row.rowIndex,

      originalName:
        row.name,

      originalDescription:
        row.description,

      originalUsecases:
        row.usecases,
    },
  };
}


// ============================================================
// EXISTING OUTPUT
//
// Allows script to resume if interrupted.
// ============================================================

async function loadExistingMetadata() {

  try {

    const raw =
      await fs.readFile(
        MEMES_JSON,
        "utf8"
      );


    if (!raw.trim()) {
      return [];
    }


    const data =
      JSON.parse(raw);


    return Array.isArray(data)
      ? data
      : [];

  } catch {
    return [];
  }
}


async function saveMetadata(
  memes
) {

  await fs.writeFile(
    MEMES_JSON,

    JSON.stringify(
      memes,
      null,
      2
    ),

    "utf8"
  );
}


// ============================================================
// RETRY GROQ
// ============================================================

async function enrichWithRetry(
  args
) {

  let lastError;


  for (
    let attempt = 1;
    attempt <= 3;
    attempt++
  ) {

    try {

      return await enrichMemeMetadata(
        args
      );

    } catch (error) {

      lastError =
        error;


      console.error(
        `Groq attempt ${attempt} failed:`,
        error?.message ||
          error
      );


      if (
        attempt < 3
      ) {

        const wait =
          15000 *
          attempt;


        console.log(
          `Waiting ${wait / 1000}s before retry...`
        );


        await sleep(wait);
      }
    }
  }


  throw lastError;
}


// ============================================================
// MAIN
// ============================================================

async function main() {

  console.log(
    "\n========================================"
  );

  console.log(
    "OUTCOGNITO MEME LIBRARY BUILDER"
  );

  console.log(
    "========================================\n"
  );


  await fs.mkdir(
    DATA_DIR,
    {
      recursive:
        true,
    }
  );


  await fs.mkdir(
    MEME_OUTPUT_DIR,
    {
      recursive:
        true,
    }
  );


  console.log(
    "Project root:",
    PROJECT_ROOT
  );


  console.log(
    "Target meme count:",
    MEME_LIMIT
  );


  // ----------------------------------------------------------
  // Character data
  // ----------------------------------------------------------

  const characterContext =
    await loadCharacterContext();


  console.log(
    "Character registry loaded."
  );


  // ----------------------------------------------------------
  // Fetch Hugging Face dataset
  // ----------------------------------------------------------

  const datasetRows =
    await fetchEntireDataset();


  console.log(
    `Dataset rows received: ${datasetRows.length}`
  );


  // ----------------------------------------------------------
  // Score and select relevant memes
  // ----------------------------------------------------------

  const ranked =
    datasetRows
      .map(row => ({
        ...row,

        relevanceScore:
          scoreDatasetRow(row),
      }))

      .filter(
        row =>
          row.relevanceScore >= 0
      )

      .sort(
        (a, b) =>
          b.relevanceScore -
          a.relevanceScore
      );


  const selected =
    ranked.slice(
      0,
      MEME_LIMIT
    );


  console.log(
    `Selected ${selected.length} memes for Outcognito.\n`
  );


  // ----------------------------------------------------------
  // Load previous progress
  // ----------------------------------------------------------

  const existing =
    await loadExistingMetadata();


  const completedIds =
    new Set(
      existing.map(
        meme =>
          meme.id
      )
    );


  const output =
    [...existing];


  console.log(
    `Already processed: ${existing.length}\n`
  );


  // ----------------------------------------------------------
  // Process memes
  // ----------------------------------------------------------

  for (
    let index = 0;
    index < selected.length;
    index++
  ) {

    const row =
      selected[index];


    const slug =
      slugify(
        row.name
      );


    console.log(
      `\n[${index + 1}/${selected.length}] ${row.name}`
    );


    if (
      completedIds.has(
        slug
      )
    ) {

      console.log(
        "Already processed. Skipping."
      );

      continue;
    }


    if (
      !row.image?.src
    ) {

      console.log(
        "No downloadable image. Skipping."
      );

      continue;
    }


    try {

      // ------------------------------------------------------
      // Download image
      // ------------------------------------------------------

      console.log(
        "Downloading image..."
      );


      const {
        filename
      } =
        await downloadImage(
          row.image.src,
          slug
        );


      console.log(
        `Saved: public/memes/${filename}`
      );


      // ------------------------------------------------------
      // Generate metadata
      // ------------------------------------------------------

      console.log(
        "Generating Outcognito metadata..."
      );


      const metadata =
        await enrichWithRetry({
          row,
          filename,
          characterContext,
        });


      output.push(
        metadata
      );


      completedIds.add(
        metadata.id
      );


      // Save after EVERY meme.
      //
      // If the script dies,
      // we don't lose previous work.

      await saveMetadata(
        output
      );


      console.log(
        `Metadata saved: ${metadata.id}`
      );


      console.log(
        `Reaction type: ${metadata.reactionType}`
      );


      // Avoid hammering free tier.

      await sleep(
        AI_DELAY_MS
      );

    } catch (error) {

      console.error(
        `FAILED: ${row.name}`
      );


      console.error(
        error?.message ||
          error
      );
    }
  }


  // ----------------------------------------------------------
  // FINAL OUTPUT
  // ----------------------------------------------------------

  console.log(
    "\n========================================"
  );


  console.log(
    "MEME LIBRARY COMPLETE"
  );


  console.log(
    "========================================"
  );


  console.log(
    `Metadata entries: ${output.length}`
  );


  console.log(
    `Images: ${MEME_OUTPUT_DIR}`
  );


  console.log(
    `Metadata: ${MEMES_JSON}`
  );


  console.log(
    "\nDone.\n"
  );
}


// ============================================================
// RUN
// ============================================================

main().catch(
  error => {

    console.error(
      "\nFatal error:",
      error
    );


    process.exit(1);
  }
);