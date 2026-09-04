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
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

import Groq from "groq-sdk";


// ============================================================
// CLIENTS
// ============================================================

const dynamo = new DynamoDBClient({});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


// ============================================================
// ENVIRONMENT VARIABLES
// ============================================================

const USERS_TABLE =
  process.env.USERS_TABLE_NAME || "Users";

const EVENTS_TABLE =
  process.env.EVENTS_TABLE_NAME || "Events";

const POSTS_TABLE =
  process.env.POSTS_TABLE_NAME || "Posts";

const USERNAME_INDEX =
  "username-index";

const AI_MODEL =
  process.env.AI_MODEL_ID ||
  "openai/gpt-oss-120b";


// ============================================================
// BROWSER EVENT SCHEMA
// ============================================================

const OutcognitoEventSchema = z.object({
  eventId: z
    .string()
    .min(1)
    .max(128),

  category: z.enum([
    "development",
    "ai",
    "social",
    "entertainment",
    "productivity",
    "shopping",
    "general",
  ]),

  eventType: z
    .string()
    .min(1)
    .max(100),

  description: z
    .string()
    .min(1)
    .max(500),

  stats: z
    .object({
      occurrence: z
        .number()
        .int()
        .nonnegative()
        .optional(),

      durationSeconds: z
        .number()
        .nonnegative()
        .optional(),

      count: z
        .number()
        .int()
        .nonnegative()
        .optional(),
    })
    .optional(),

  roastability: z
    .number()
    .min(0)
    .max(1),

  privacyLevel:
    z.literal("safe"),

  timestamp:
    z.string().datetime(),
});


// ============================================================
// AI SOCIETY OUTPUT SCHEMA
// ============================================================

const AISocietySchema = z.object({
  post: z
    .string()
    .min(1)
    .max(500),

  comments: z
    .array(
      z.object({
        id: z
          .string()
          .min(1),

        character: z.enum([
          "certified_hater",
          "glazer3000",
          "chronicallyonline",
          "society_aunty",
          "detective",
          "linkedin_sigma",
          "maincharacter",
        ]),

        text: z
          .string()
          .min(1)
          .max(300),

        replyTo: z
          .string()
          .nullable(),

        memeQuery: z
          .string()
          .nullable(),
      })
    )
    .min(2)
    .max(5),
});


// ============================================================
// RESPONSE HELPER
// ============================================================

function jsonResponse(statusCode, body) {
  return {
    statusCode,

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(body),
  };
}


// ============================================================
// BODY PARSER
// ============================================================

function parseJsonBody(event) {
  if (!event.body) {
    return {};
  }

  if (typeof event.body === "object") {
    return event.body;
  }

  return JSON.parse(event.body);
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
      ?.sub || null
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


CHARACTERS


certified_hater

Short, sarcastic, direct and internet-native.
Find something mockable in almost everything.
Keep replies concise.


glazer3000

Absurdly defends the user even when they are clearly wrong.
Often argues with certified_hater.


chronicallyonline

Internet-native reaction personality.
Short, natural and meme-aware.
Avoid forced or cringe slang.


society_aunty

Judgmental social and family-comparison personality.
Can compare behavior with family expectations,
relatives or society.
Use sparingly.


detective

Dry and factual.

Obsessed with:
- evidence
- timings
- visit counts
- patterns
- statistics

Never invent statistics.
Only use data supplied in the browser event.


linkedin_sigma

Turns ordinary behavior,
bad decisions,
failures or procrastination
into ridiculous corporate,
entrepreneurial or motivational lessons.


maincharacter

Treats ordinary browser behavior
like an anime,
movie,
hero arc
or dramatic cinematic moment.



RULES

1. Create one short funny public post.

2. Choose only 2 to 5 characters relevant to the browser event.

3. Generate comments from those characters.

4. Characters may reply to other characters.

5. Comments should be short and internet-natural.

6. Every character must sound meaningfully different.

7. Never invent browser activity not contained in the event.

8. Never expose or fabricate private information.

9. Avoid generic AI assistant language.

10. Avoid explaining jokes.

11. If a reaction meme would improve a comment,
provide a short semantic memeQuery.

Example:

"disappointed reaction seeing someone repeat the same mistake"

The memeQuery describes the reaction image needed.

Do NOT return:
- image URLs
- filenames
- website URLs

Outcognito has its own local meme matcher.

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
      model: AI_MODEL,

      reasoning_effort:
        "low",

      max_completion_tokens:
        900,

      messages: [
        {
          role: "system",
          content: systemPrompt,
        },

        {
          role: "user",
          content: userPrompt,
        },
      ],


      // ======================================================
      // STRICT STRUCTURED JSON OUTPUT
      // ======================================================

      response_format: {
        type: "json_schema",

        json_schema: {
          name:
            "outcognito_ai_society",

          strict: true,

          schema: {
            type: "object",

            additionalProperties:
              false,

            properties: {
              post: {
                type: "string",
              },

              comments: {
                type: "array",

                minItems: 2,
                maxItems: 5,

                items: {
                  type: "object",

                  additionalProperties:
                    false,

                  properties: {
                    id: {
                      type: "string",
                    },

                    character: {
                      type: "string",

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
                      type: "string",
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
      JSON.parse(outputText);
  } catch (error) {
    console.error(
      "Groq JSON parse failed:",
      outputText
    );

    throw new Error(
      "Groq returned invalid JSON."
    );
  }


  // ==========================================================
  // SECOND VALIDATION LAYER
  // ==========================================================

  const validation =
    AISocietySchema.safeParse(
      parsed
    );


  if (!validation.success) {
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
//
// Not connected to POST /events yet.
// Will be connected after meme matching.
// ============================================================

async function saveGeneratedPost({
  userId,
  browserEvent,
  aiThread,
}) {
  const validatedAI =
    AISocietySchema.parse(
      aiThread
    );


  const postId =
    `post_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;


  // ----------------------------------------------------------
  // Get username
  // ----------------------------------------------------------

  const userResult =
    await dynamo.send(
      new GetItemCommand({
        TableName:
          USERS_TABLE,

        Key: {
          userId: {
            S: userId,
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
  // Save post
  // ----------------------------------------------------------

  await dynamo.send(
    new PutItemCommand({
      TableName:
        POSTS_TABLE,

      Item: {
        postId: {
          S: postId,
        },

        userId: {
          S: userId,
        },

        username: {
          S: username,
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
          S: createdAt,
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
// LAMBDA HANDLER
// ============================================================

export const handler =
  async (event) => {
    try {

      // --------------------------------------------------------
      // HTTP INFO
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
            ok: true,

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
      // Lambda Test only.
      // Do NOT add to API Gateway.
      // ========================================================

      if (
        method === "GET" &&
        path === "/ai-test"
      ) {

        if (
          !process.env.GROQ_API_KEY
        ) {
          return jsonResponse(
            500,
            {
              error:
                "GROQ_API_KEY environment variable is missing.",
            }
          );
        }


        console.log(
          "Testing Groq connection..."
        );


        const completion =
          await groq.chat.completions.create({
            model: AI_MODEL,

            reasoning_effort:
              "low",

            max_completion_tokens:
              50,

            messages: [
              {
                role: "user",

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


        console.log(
          "Groq test output:",
          output
        );


        return jsonResponse(
          200,
          {
            success: true,

            provider:
              "groq",

            model:
              AI_MODEL,

            output,
          }
        );
      }


      // ========================================================
      // TEMPORARY FULL AI SOCIETY TEST
      //
      // This tests:
      //
      // Lambda
      // → Groq
      // → GPT-OSS 120B
      // → structured JSON
      // → Zod validation
      //
      // Lambda Test only.
      // DO NOT add to API Gateway.
      // ========================================================

      if (
        method === "GET" &&
        path === "/ai-society-test"
      ) {

        if (
          !process.env.GROQ_API_KEY
        ) {
          return jsonResponse(
            500,
            {
              error:
                "GROQ_API_KEY environment variable is missing.",
            }
          );
        }


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
            occurrence: 9,

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


        console.log(
          "Testing full AI Society generation..."
        );


        const aiThread =
          await generateAISocietyThread(
            testBrowserEvent
          );


        console.log(
          "AI Society test successful."
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
          }
        );
      }


      // ========================================================
      // AUTHENTICATED ROUTES BELOW
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
                  S: userId,
                },
              },
            })
          );


        if (!result.Item) {
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

        if (!userId) {
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
        // Validate username
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
        // Current profile
        // ------------------------------------------------------

        const currentUser =
          await dynamo.send(
            new GetItemCommand({
              TableName:
                USERS_TABLE,

              Key: {
                userId: {
                  S: userId,
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
        // Check username uniqueness
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
                    S: username,
                  },
                },

              Limit: 1,
            })
          );


        if (
          usernameResult.Items &&
          usernameResult.Items.length >
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
                S: userId,
              },
            },

            UpdateExpression:
              "SET username = :username, updatedAt = :updatedAt, createdAt = if_not_exists(createdAt, :createdAt)",

            ExpressionAttributeValues:
              {
                ":username": {
                  S: username,
                },

                ":updatedAt": {
                  S: now,
                },

                ":createdAt": {
                  S: now,
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
      // CURRENT:
      //
      // event
      // ↓
      // validation
      // ↓
      // Events DynamoDB
      // ↓
      // pending_ai
      //
      // AI generation is intentionally NOT connected yet.
      // ========================================================

      if (
        method === "POST" &&
        path === "/events"
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
                    (issue) => ({
                      path:
                        issue.path
                          .join("."),

                      message:
                        issue.message,
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
        // DynamoDB item
        // ------------------------------------------------------

        const eventItem = {
          eventId: {
            S:
              browserEvent.eventId,
          },

          userId: {
            S:
              userId,
          },

          category: {
            S:
              browserEvent.category,
          },

          eventType: {
            S:
              browserEvent.eventType,
          },

          description: {
            S:
              browserEvent.description,
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
              browserEvent.timestamp,
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
        // Optional stats
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
            statsMap.durationSeconds =
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
        // Store event with idempotency
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

        } catch (error) {

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

                aiStatus:
                  publishEligible
                    ? "pending"
                    : "not_required",
              }
            );
          }


          throw error;
        }


        // ------------------------------------------------------
        // DO NOT CONNECT GROQ HERE YET
        //
        // After meme matcher:
        //
        // const aiThread =
        //   await generateAISocietyThread(
        //     browserEvent
        //   );
        //
        // const enrichedThread =
        //   resolveMemes(aiThread);
        //
        // const post =
        //   await saveGeneratedPost({
        //     userId,
        //     browserEvent,
        //     aiThread:
        //       enrichedThread,
        //   });
        //
        // ------------------------------------------------------


        return jsonResponse(
          202,
          {
            accepted:
              true,

            duplicate:
              false,

            eventId:
              browserEvent.eventId,

            publishEligible,

            aiStatus:
              publishEligible
                ? "pending"
                : "not_required",
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

    } catch (error) {

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
            error instanceof Error
              ? error.message
              : "Unknown error",
        }
      );
    }
  };