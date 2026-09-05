// ============================================================
// OUTCOGNITO API
// services/backend/index.mjs
// ============================================================

import { z } from "zod";

import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

import Groq from "groq-sdk";

import {
  resolveMemes,
} from "./meme-matcher.mjs";


// ============================================================
// CLIENTS
// ============================================================

const dynamo =
  new DynamoDBClient({});

const groq =
  new Groq({
    apiKey:
      process.env.GROQ_API_KEY,
  });


// ============================================================
// ENVIRONMENT VARIABLES
// ============================================================

const USERS_TABLE =
  process.env.USERS_TABLE_NAME ||
  "Users";

const EVENTS_TABLE =
  process.env.EVENTS_TABLE_NAME ||
  "Events";

const POSTS_TABLE =
  process.env.POSTS_TABLE_NAME ||
  "Posts";

const USERNAME_INDEX =
  "username-index";

const AI_MODEL =
  process.env.AI_MODEL_ID ||
  "openai/gpt-oss-120b";


// ============================================================
// BROWSER EVENT SCHEMA
// ============================================================

const OutcognitoEventSchema =
  z.object({
    eventId:
      z
        .string()
        .min(1)
        .max(128),

    category:
      z.enum([
        "development",
        "ai",
        "social",
        "entertainment",
        "productivity",
        "shopping",
        "general",
      ]),

    eventType:
      z
        .string()
        .min(1)
        .max(100),

    description:
      z
        .string()
        .min(1)
        .max(500),

    stats:
      z
        .object({
          occurrence:
            z
              .number()
              .int()
              .nonnegative()
              .optional(),

          durationSeconds:
            z
              .number()
              .nonnegative()
              .optional(),

          count:
            z
              .number()
              .int()
              .nonnegative()
              .optional(),
        })
        .optional(),

    roastability:
      z
        .number()
        .min(0)
        .max(1),

    privacyLevel:
      z.literal("safe"),

    timestamp:
      z.string().datetime(),
  });


// ============================================================
// RAW GROQ AI SOCIETY OUTPUT
//
// This is what Groq returns BEFORE meme matching.
// ============================================================

const AISocietySchema =
  z.object({
    post:
      z
        .string()
        .min(1)
        .max(500),

    comments:
      z
        .array(
          z.object({
            id:
              z
                .string()
                .min(1),

            character:
              z.enum([
                "certified_hater",
                "glazer3000",
                "chronicallyonline",
                "society_aunty",
                "detective",
                "linkedin_sigma",
                "maincharacter",
              ]),

            text:
              z
                .string()
                .min(1)
                .max(300),

            replyTo:
              z
                .string()
                .nullable(),

            memeQuery:
              z
                .string()
                .nullable(),
          })
        )
        .min(2)
        .max(5),
  });


// ============================================================
// RESOLVED MEME SCHEMA
// ============================================================

const ResolvedMemeSchema =
  z
    .object({
      id:
        z.string(),

      filename:
        z.string(),

      displayName:
        z.string(),

      url:
        z.string(),

      score:
        z.number(),

      reactionType:
        z.string(),

      intensity:
        z.number(),
    })
    .nullable();


// ============================================================
// ENRICHED AI SOCIETY SCHEMA
//
// Used AFTER the weighted meme matcher.
//
// The matcher may internally return a "breakdown" field.
// Since it is not declared here, Zod strips it before storage.
// ============================================================

const EnrichedAISocietySchema =
  z.object({
    post:
      z
        .string()
        .min(1)
        .max(500),

    comments:
      z
        .array(
          z.object({
            id:
              z.string(),

            character:
              z.enum([
                "certified_hater",
                "glazer3000",
                "chronicallyonline",
                "society_aunty",
                "detective",
                "linkedin_sigma",
                "maincharacter",
              ]),

            text:
              z
                .string()
                .min(1)
                .max(300),

            replyTo:
              z
                .string()
                .nullable(),

            memeQuery:
              z
                .string()
                .nullable(),

            meme:
              ResolvedMemeSchema,
          })
        )
        .min(2)
        .max(5),
  });


// ============================================================
// RESPONSE HELPER
// ============================================================

function jsonResponse(
  statusCode,
  body
) {
  return {
    statusCode,

    headers: {
      "Content-Type":
        "application/json",
    },

    body:
      JSON.stringify(body),
  };
}


// ============================================================
// BODY PARSER
// ============================================================

function parseJsonBody(event) {
  if (!event.body) {
    return {};
  }

  if (
    typeof event.body ===
    "object"
  ) {
    return event.body;
  }

  return JSON.parse(
    event.body
  );
}


// ============================================================
// AUTH HELPER
// ============================================================

function getUserId(event) {
  return (
    event.requestContext
      ?.authorizer
      ?.jwt
      ?.claims
      ?.sub ||
    null
  );
}


// ============================================================
// GROQ AI SOCIETY GENERATOR
// ============================================================

async function generateAISocietyThread(
  browserEvent
) {

  const systemPrompt = `
You are the AI Society inside Outcognito.

Outcognito is a satirical social network where users do not manually post.

Privacy-safe browser behavior automatically becomes social content.

You control seven recurring AI personalities.


============================================================
CHARACTERS
============================================================


certified_hater

Short, sarcastic, direct and internet-native.

Find something mockable in almost everything.

Keep replies concise.

Roast the behavior rather than attacking the person.



glazer3000

Absurdly defends the user even when they are clearly wrong.

Often argues with certified_hater.

Treat mediocre behavior like an impressive achievement.



chronicallyonline

Internet-native reaction personality.

Short, natural and meme-aware.

Avoid forced or cringe slang.

Can respond to another AI character rather than directly
responding to the browser event.



society_aunty

Judgmental social and family-comparison personality.

Can compare behavior with family expectations,
relatives or society.

Use sparingly.

Treat small browser behavior like a major societal concern.



detective

Dry and factual.

Obsessed with:

- evidence
- timings
- visit counts
- patterns
- statistics
- repeated behavior

Never invent statistics.

Only use numbers or evidence supplied by the browser event.



linkedin_sigma

Turns ordinary behavior,
bad decisions,
failures,
procrastination,
development work
or AI usage

into ridiculous corporate,
entrepreneurial or motivational lessons.

Satirizes LinkedIn-style motivational posts.



maincharacter

Treats ordinary browser behavior
like an anime,
movie,
hero arc
or dramatic cinematic moment.

Can describe mundane activity as:

- plot twists
- sequels
- boss fights
- character development
- cinematic moments

Avoid repeating the same joke every time.


============================================================
RULES
============================================================

1. Create one short funny public post.

2. Choose only 2 to 5 characters relevant to the browser event.

3. Generate comments from those characters.

4. Characters may reply to other characters.

5. Comments should be short and internet-natural.

6. Every character must sound meaningfully different.

7. Never invent browser activity not contained in the event.

8. Never expose or fabricate private information.

9. Never infer page content that was not supplied.

10. Avoid generic AI assistant language.

11. Avoid explaining jokes.

12. Do not make serious personal accusations.

13. Vary recurring jokes and wording.

14. If a reaction meme would genuinely improve a comment,
provide a short semantic memeQuery.

Example memeQuery:

"facepalm reaction seeing someone repeat the same mistake"

Another example:

"corporate success reaction to absurd productivity"

Another example:

"dramatic cinema reaction to a ridiculous comeback"

The memeQuery describes the emotional or situational reaction
needed from the local meme library.

Do NOT return:

- image URLs
- image filenames
- website URLs
- meme IDs

Outcognito has its own weighted local meme matcher.

A meme is optional.

If a comment does not genuinely benefit from a meme,
return memeQuery as null.

Return only structured output.
`;


  const userPrompt = `
Generate an Outcognito post and AI Society discussion
for this privacy-safe browser event:

${JSON.stringify(
  browserEvent,
  null,
  2
)}
`;


  const completion =
    await groq.chat.completions.create({
      model:
        AI_MODEL,

      reasoning_effort:
        "low",

      max_completion_tokens:
        900,

      messages: [
        {
          role:
            "system",

          content:
            systemPrompt,
        },

        {
          role:
            "user",

          content:
            userPrompt,
        },
      ],


      // ======================================================
      // STRICT STRUCTURED OUTPUT
      // ======================================================

      response_format: {
        type:
          "json_schema",

        json_schema: {
          name:
            "outcognito_ai_society",

          strict:
            true,

          schema: {
            type:
              "object",

            additionalProperties:
              false,

            properties: {

              post: {
                type:
                  "string",
              },

              comments: {
                type:
                  "array",

                minItems:
                  2,

                maxItems:
                  5,

                items: {
                  type:
                    "object",

                  additionalProperties:
                    false,

                  properties: {

                    id: {
                      type:
                        "string",
                    },

                    character: {
                      type:
                        "string",

                      enum: [
                        "certified_hater",
                        "glazer3000",
                        "chronicallyonline",
                        "society_aunty",
                        "detective",
                        "linkedin_sigma",
                        "maincharacter",
                      ],
                    },

                    text: {
                      type:
                        "string",
                    },

                    replyTo: {
                      type: [
                        "string",
                        "null",
                      ],
                    },

                    memeQuery: {
                      type: [
                        "string",
                        "null",
                      ],
                    },
                  },

                  required: [
                    "id",
                    "character",
                    "text",
                    "replyTo",
                    "memeQuery",
                  ],
                },
              },
            },

            required: [
              "post",
              "comments",
            ],
          },
        },
      },
    });


  const outputText =
    completion
      .choices?.[0]
      ?.message
      ?.content;


  if (!outputText) {
    throw new Error(
      "Groq returned no AI output."
    );
  }


  console.log(
    "Groq AI Society response received."
  );


  let parsed;


  try {

    parsed =
      JSON.parse(
        outputText
      );

  } catch {

    console.error(
      "Groq JSON parse failed:",
      outputText
    );


    throw new Error(
      "Groq returned invalid JSON."
    );
  }


  const validation =
    AISocietySchema.safeParse(
      parsed
    );


  if (
    !validation.success
  ) {

    console.error(
      "AI Society validation failed:",
      validation.error.issues
    );


    throw new Error(
      "AI Society output failed Zod validation."
    );
  }


  return validation.data;
}


// ============================================================
// SAVE GENERATED POST
// ============================================================

async function saveGeneratedPost({
  userId,
  browserEvent,
  aiThread,
}) {

  // ----------------------------------------------------------
  // Validate AFTER meme resolution
  // ----------------------------------------------------------

  const validatedAI =
    EnrichedAISocietySchema.parse(
      aiThread
    );


  // ----------------------------------------------------------
  // Generate Post ID
  // ----------------------------------------------------------

  const postId =
    `post_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;


  // ----------------------------------------------------------
  // Get username from Users table
  // ----------------------------------------------------------

  const userResult =
    await dynamo.send(
      new GetItemCommand({
        TableName:
          USERS_TABLE,

        Key: {
          userId: {
            S:
              userId,
          },
        },
      })
    );


  const username =
    userResult.Item
      ?.username
      ?.S ||
    "unknown";


  const createdAt =
    new Date()
      .toISOString();


  // ----------------------------------------------------------
  // Save generated post
  // ----------------------------------------------------------

  await dynamo.send(
    new PutItemCommand({
      TableName:
        POSTS_TABLE,

      Item: {

        postId: {
          S:
            postId,
        },

        userId: {
          S:
            userId,
        },

        username: {
          S:
            username,
        },

        eventId: {
          S:
            browserEvent.eventId,
        },

        category: {
          S:
            browserEvent.category,
        },

        eventType: {
          S:
            browserEvent.eventType,
        },

        postText: {
          S:
            validatedAI.post,
        },

        commentsJson: {
          S:
            JSON.stringify(
              validatedAI.comments
            ),
        },

        roastability: {
          N:
            String(
              browserEvent
                .roastability
            ),
        },

        createdAt: {
          S:
            createdAt,
        },
      },
    })
  );


  console.log(
    "Generated post stored:",
    postId
  );


  return {
    postId,
    createdAt,
  };
}


// ============================================================
// CONVERT DYNAMODB POST TO NORMAL JSON
// ============================================================

function deserializePost(item) {

  let comments = [];


  try {

    comments =
      JSON.parse(
        item.commentsJson?.S ||
        "[]"
      );

  } catch (
    error
  ) {

    console.error(
      "Failed to parse commentsJson for post:",
      item.postId?.S,
      error
    );


    comments = [];
  }


  return {

    postId:
      item.postId?.S ||
      null,

    userId:
      item.userId?.S ||
      null,

    username:
      item.username?.S ||
      "unknown",

    eventId:
      item.eventId?.S ||
      null,

    category:
      item.category?.S ||
      "general",

    eventType:
      item.eventType?.S ||
      null,

    postText:
      item.postText?.S ||
      "",

    comments,

    roastability:
      item.roastability?.N
        ? Number(
            item.roastability.N
          )
        : 0,

    createdAt:
      item.createdAt?.S ||
      null,
  };
}


// ============================================================
// LAMBDA HANDLER
// ============================================================

export const handler =
  async (event) => {

    try {

      // --------------------------------------------------------
      // HTTP INFORMATION
      // --------------------------------------------------------

      const method =
        event.requestContext
          ?.http
          ?.method ||
        event.httpMethod ||
        "";


      const path =
        event.rawPath ||
        event.path ||
        "";


      console.log(
        `${method} ${path}`
      );


      // ========================================================
      // GET /health
      // ========================================================

      if (
        method === "GET" &&
        path === "/health"
      ) {

        return jsonResponse(
          200,
          {
            ok:
              true,

            service:
              "outcognito-api",

            aiProvider:
              "groq",

            aiModel:
              AI_MODEL,

            message:
              "Outcognito API is healthy.",
          }
        );
      }


      // ========================================================
      // TEMPORARY GROQ CONNECTION TEST
      //
      // Lambda test only.
      // ========================================================

      if (
        method === "GET" &&
        path === "/ai-test"
      ) {

        if (
          !process.env
            .GROQ_API_KEY
        ) {

          return jsonResponse(
            500,
            {
              error:
                "GROQ_API_KEY environment variable is missing.",
            }
          );
        }


        const completion =
          await groq
            .chat
            .completions
            .create({
              model:
                AI_MODEL,

              reasoning_effort:
                "low",

              max_completion_tokens:
                50,

              messages: [
                {
                  role:
                    "user",

                  content:
                    "Reply exactly with OUTCOGNITO_AI_WORKS",
                },
              ],
            });


        const output =
          completion
            .choices?.[0]
            ?.message
            ?.content ||
          null;


        return jsonResponse(
          200,
          {
            success:
              true,

            provider:
              "groq",

            model:
              AI_MODEL,

            output,
          }
        );
      }


      // ========================================================
      // TEMPORARY AI SOCIETY + MEME TEST
      //
      // Lambda test only.
      // ========================================================

      if (
        method === "GET" &&
        path === "/ai-society-test"
      ) {

        const testBrowserEvent = {

          eventId:
            `evt_ai_test_${Date.now()}`,

          category:
            "ai",

          eventType:
            "ai_return",

          description:
            "User returned to an AI assistant only 47 seconds after leaving.",

          stats: {
            occurrence:
              9,

            durationSeconds:
              47,
          },

          roastability:
            0.94,

          privacyLevel:
            "safe",

          timestamp:
            new Date()
              .toISOString(),
        };


        const aiThread =
          await generateAISocietyThread(
            testBrowserEvent
          );


        const enrichedThread =
          resolveMemes(
            aiThread,
            testBrowserEvent
              .roastability
          );


        return jsonResponse(
          200,
          {
            success:
              true,

            provider:
              "groq",

            model:
              AI_MODEL,

            browserEvent:
              testBrowserEvent,

            aiThread,

            enrichedThread,
          }
        );
      }


      // ========================================================
      // GET /feed
      //
      // PUBLIC GLOBAL FEED
      //
      // DynamoDB Scan is acceptable for our hackathon-scale MVP.
      // ========================================================

      if (
        method === "GET" &&
        path === "/feed"
      ) {

        console.log(
          "Loading global feed..."
        );


        const result =
          await dynamo.send(
            new ScanCommand({
              TableName:
                POSTS_TABLE,

              Limit:
                50,
            })
          );


        const posts =
          (result.Items || [])

            .map(
              deserializePost
            )

            // --------------------------------------------------
            // Newest posts first
            // --------------------------------------------------

            .sort(
              (
                a,
                b
              ) => {

                const aTime =
                  a.createdAt
                    ? new Date(
                        a.createdAt
                      ).getTime()
                    : 0;


                const bTime =
                  b.createdAt
                    ? new Date(
                        b.createdAt
                      ).getTime()
                    : 0;


                return (
                  bTime -
                  aTime
                );
              }
            )

            // --------------------------------------------------
            // Return latest 20
            // --------------------------------------------------

            .slice(
              0,
              20
            );


        console.log(
          `Feed loaded: ${posts.length} posts`
        );


        return jsonResponse(
          200,
          {
            posts,

            count:
              posts.length,
          }
        );
      }


      // ========================================================
      // AUTHENTICATED ROUTES
      // ========================================================

      const userId =
        getUserId(event);


      // ========================================================
      // GET /me
      // ========================================================

      if (
        method === "GET" &&
        path === "/me"
      ) {

        if (!userId) {

          return jsonResponse(
            401,
            {
              error:
                "Unauthorized",
            }
          );
        }


        const result =
          await dynamo.send(
            new GetItemCommand({
              TableName:
                USERS_TABLE,

              Key: {
                userId: {
                  S:
                    userId,
                },
              },
            })
          );


        if (
          !result.Item
        ) {

          return jsonResponse(
            200,
            {
              authenticated:
                true,

              userId,

              profile:
                null,
            }
          );
        }


        return jsonResponse(
          200,
          {
            authenticated:
              true,

            userId,

            profile: {

              username:
                result.Item
                  ?.username
                  ?.S ||
                null,

              createdAt:
                result.Item
                  ?.createdAt
                  ?.S ||
                null,

              updatedAt:
                result.Item
                  ?.updatedAt
                  ?.S ||
                null,
            },
          }
        );
      }


      // ========================================================
      // PATCH /me
      // ========================================================

      if (
        method === "PATCH" &&
        path === "/me"
      ) {

        if (
          !userId
        ) {

          return jsonResponse(
            401,
            {
              error:
                "Unauthorized",
            }
          );
        }


        let body;


        try {

          body =
            parseJsonBody(
              event
            );

        } catch {

          return jsonResponse(
            400,
            {
              error:
                "Invalid JSON body.",
            }
          );
        }


        const username =
          String(
            body.username ||
            ""
          )
            .trim()
            .toLowerCase();


        // ------------------------------------------------------
        // Username validation
        // ------------------------------------------------------

        if (
          !/^[a-z0-9_]{3,20}$/.test(
            username
          )
        ) {

          return jsonResponse(
            400,
            {
              error:
                "Username must be 3-20 characters and contain only lowercase letters, numbers, and underscores.",
            }
          );
        }


        // ------------------------------------------------------
        // Load current user
        // ------------------------------------------------------

        const currentUser =
          await dynamo.send(
            new GetItemCommand({
              TableName:
                USERS_TABLE,

              Key: {
                userId: {
                  S:
                    userId,
                },
              },
            })
          );


        const currentUsername =
          currentUser.Item
            ?.username
            ?.S;


        if (
          currentUsername ===
          username
        ) {

          return jsonResponse(
            200,
            {
              success:
                true,

              username,

              unchanged:
                true,
            }
          );
        }


        // ------------------------------------------------------
        // Username uniqueness check
        // ------------------------------------------------------

        const usernameResult =
          await dynamo.send(
            new QueryCommand({
              TableName:
                USERS_TABLE,

              IndexName:
                USERNAME_INDEX,

              KeyConditionExpression:
                "username = :username",

              ExpressionAttributeValues:
                {
                  ":username": {
                    S:
                      username,
                  },
                },

              Limit:
                1,
            })
          );


        if (
          usernameResult.Items &&
          usernameResult.Items
            .length >
            0
        ) {

          const ownerUserId =
            usernameResult
              .Items[0]
              ?.userId
              ?.S;


          if (
            ownerUserId !==
            userId
          ) {

            return jsonResponse(
              409,
              {
                error:
                  "Username is already taken.",
              }
            );
          }
        }


        const now =
          new Date()
            .toISOString();


        // ------------------------------------------------------
        // Save username
        // ------------------------------------------------------

        await dynamo.send(
          new UpdateItemCommand({
            TableName:
              USERS_TABLE,

            Key: {
              userId: {
                S:
                  userId,
              },
            },

            UpdateExpression:
              "SET username = :username, updatedAt = :updatedAt, createdAt = if_not_exists(createdAt, :createdAt)",

            ExpressionAttributeValues:
              {
                ":username": {
                  S:
                    username,
                },

                ":updatedAt": {
                  S:
                    now,
                },

                ":createdAt": {
                  S:
                    now,
                },
              },
          })
        );


        return jsonResponse(
          200,
          {
            success:
              true,

            username,
          }
        );
      }


      // ========================================================
      // POST /events
      //
      // REAL OUTCOGNITO PIPELINE
      //
      // Browser Event
      //      ↓
      // Zod validation
      //      ↓
      // Events DynamoDB
      //      ↓
      // Roastability threshold
      //      ↓
      // Groq AI Society
      //      ↓
      // Weighted Meme Matcher
      //      ↓
      // Posts DynamoDB
      //      ↓
      // Event marked published
      // ========================================================

      if (
        method === "POST" &&
        path === "/events"
      ) {

        if (
          !userId
        ) {

          return jsonResponse(
            401,
            {
              error:
                "Unauthorized",
            }
          );
        }


        let body;


        try {

          body =
            parseJsonBody(
              event
            );

        } catch {

          return jsonResponse(
            400,
            {
              error:
                "Invalid JSON body.",
            }
          );
        }


        // ------------------------------------------------------
        // Validate event
        // ------------------------------------------------------

        const validation =
          OutcognitoEventSchema
            .safeParse(
              body
            );


        if (
          !validation.success
        ) {

          return jsonResponse(
            400,
            {
              error:
                "Invalid Outcognito event.",

              issues:
                validation
                  .error
                  .issues
                  .map(
                    issue => ({
                      path:
                        issue
                          .path
                          .join(
                            "."
                          ),

                      message:
                        issue
                          .message,
                    })
                  ),
            }
          );
        }


        const browserEvent =
          validation.data;


        const publishEligible =
          browserEvent
            .roastability >=
          0.6;


        // ------------------------------------------------------
        // Build DynamoDB Event item
        // ------------------------------------------------------

        const eventItem = {

          eventId: {
            S:
              browserEvent
                .eventId,
          },

          userId: {
            S:
              userId,
          },

          category: {
            S:
              browserEvent
                .category,
          },

          eventType: {
            S:
              browserEvent
                .eventType,
          },

          description: {
            S:
              browserEvent
                .description,
          },

          roastability: {
            N:
              String(
                browserEvent
                  .roastability
              ),
          },

          privacyLevel: {
            S:
              browserEvent
                .privacyLevel,
          },

          timestamp: {
            S:
              browserEvent
                .timestamp,
          },

          receivedAt: {
            S:
              new Date()
                .toISOString(),
          },

          publishEligible: {
            BOOL:
              publishEligible,
          },

          processingStatus: {
            S:
              publishEligible
                ? "pending_ai"
                : "accepted",
          },
        };


        // ------------------------------------------------------
        // Optional browser-event statistics
        // ------------------------------------------------------

        if (
          browserEvent.stats
        ) {

          const statsMap =
            {};


          if (
            browserEvent
              .stats
              .occurrence !==
            undefined
          ) {

            statsMap.occurrence =
              {
                N:
                  String(
                    browserEvent
                      .stats
                      .occurrence
                  ),
              };
          }


          if (
            browserEvent
              .stats
              .durationSeconds !==
            undefined
          ) {

            statsMap
              .durationSeconds =
              {
                N:
                  String(
                    browserEvent
                      .stats
                      .durationSeconds
                  ),
              };
          }


          if (
            browserEvent
              .stats
              .count !==
            undefined
          ) {

            statsMap.count =
              {
                N:
                  String(
                    browserEvent
                      .stats
                      .count
                  ),
              };
          }


          if (
            Object.keys(
              statsMap
            ).length >
            0
          ) {

            eventItem.stats =
              {
                M:
                  statsMap,
              };
          }
        }


        // ------------------------------------------------------
        // Store event with idempotency protection
        // ------------------------------------------------------

        try {

          await dynamo.send(
            new PutItemCommand({
              TableName:
                EVENTS_TABLE,

              Item:
                eventItem,

              ConditionExpression:
                "attribute_not_exists(eventId)",
            })
          );

        } catch (
          error
        ) {

          if (
            error?.name ===
            "ConditionalCheckFailedException"
          ) {

            return jsonResponse(
              200,
              {
                accepted:
                  true,

                duplicate:
                  true,

                eventId:
                  browserEvent
                    .eventId,

                publishEligible,
              }
            );
          }


          throw error;
        }


        // ======================================================
        // AI + MEME PIPELINE
        // ======================================================

        let aiStatus =
          publishEligible
            ? "pending"
            : "not_required";


        let postCreated =
          false;


        let postId =
          null;


        if (
          publishEligible
        ) {

          try {

            // --------------------------------------------------
            // 1. Generate AI Society
            // --------------------------------------------------

            console.log(
              "Generating AI Society thread..."
            );


            const aiThread =
              await generateAISocietyThread(
                browserEvent
              );


            console.log(
              "AI Society generated."
            );


            // --------------------------------------------------
            // 2. Resolve local reaction memes
            // --------------------------------------------------

            const enrichedThread =
              resolveMemes(
                aiThread,
                browserEvent
                  .roastability
              );


            console.log(
              "Meme resolution completed."
            );


            // --------------------------------------------------
            // 3. Save generated Post
            // --------------------------------------------------

            const savedPost =
              await saveGeneratedPost({
                userId,

                browserEvent,

                aiThread:
                  enrichedThread,
              });


            postId =
              savedPost.postId;


            postCreated =
              true;


            aiStatus =
              "published";


            // --------------------------------------------------
            // 4. Mark Event as published
            // --------------------------------------------------

            await dynamo.send(
              new UpdateItemCommand({
                TableName:
                  EVENTS_TABLE,

                Key: {
                  eventId: {
                    S:
                      browserEvent
                        .eventId,
                  },
                },

                UpdateExpression:
                  "SET processingStatus = :status, postId = :postId, processedAt = :processedAt",

                ExpressionAttributeValues:
                  {

                    ":status": {
                      S:
                        "published",
                    },

                    ":postId": {
                      S:
                        postId,
                    },

                    ":processedAt": {
                      S:
                        new Date()
                          .toISOString(),
                    },
                  },
              })
            );


            console.log(
              "Event published:",
              postId
            );

          } catch (
            error
          ) {

            // --------------------------------------------------
            // AI / Meme / Post generation failed
            // --------------------------------------------------

            console.error(
              "AI processing failed:",
              error
            );


            aiStatus =
              "failed";


            // --------------------------------------------------
            // Event itself remains safely stored.
            //
            // Only mark processing as failed.
            // --------------------------------------------------

            try {

              await dynamo.send(
                new UpdateItemCommand({
                  TableName:
                    EVENTS_TABLE,

                  Key: {
                    eventId: {
                      S:
                        browserEvent
                          .eventId,
                    },
                  },

                  UpdateExpression:
                    "SET processingStatus = :status, processedAt = :processedAt",

                  ExpressionAttributeValues:
                    {

                      ":status": {
                        S:
                          "ai_failed",
                      },

                      ":processedAt": {
                        S:
                          new Date()
                            .toISOString(),
                      },
                    },
                })
              );

            } catch (
              updateError
            ) {

              console.error(
                "Failed to update Event failure status:",
                updateError
              );
            }
          }
        }


        // ------------------------------------------------------
        // Final POST /events response
        // ------------------------------------------------------

        return jsonResponse(
          202,
          {
            accepted:
              true,

            duplicate:
              false,

            eventId:
              browserEvent
                .eventId,

            publishEligible,

            aiStatus,

            postCreated,

            postId,
          }
        );
      }


      // ========================================================
      // ROUTE NOT FOUND
      // ========================================================

      return jsonResponse(
        404,
        {
          error:
            "Route not found.",
        }
      );

    } catch (
      error
    ) {

      // ========================================================
      // GLOBAL ERROR HANDLER
      // ========================================================

      console.error(
        "Outcognito API error:",
        error
      );


      return jsonResponse(
        500,
        {
          error:
            "Internal server error.",

          message:
            error instanceof
            Error
              ? error.message
              : "Unknown error",
        }
      );
    }
  };